const $=s=>document.querySelector(s);
const e=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const slug=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||String(Date.now());
const yt=u=>{try{const x=new URL(u),h=x.hostname.replace(/^(www|m|music)\./,"");let i="";if(h==="youtu.be")i=x.pathname.slice(1).split("/")[0];else if(h.startsWith("youtube"))i=x.searchParams.get("v")||(x.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?]+)/)||[])[1]||"";return /^[\w-]{11}$/.test(i)?i:""}catch{return ""}};
const DOM="https://www.radiobezmiliana.es",code=p=>p.codigo||slug(p.titulo);
const SECC=[["profesorado","Profesorado"],["coordinacion","Coordinación"],["miembros","Equipo"]];
const YT=/^https?:\/\/(www\.|m\.|music\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i;
const VISTAS={resumen:"Resumen",programas:"Programas",equipo:"Equipo",formularios:"Formularios",archivos:"Archivos",ajustes:"Ajustes"};
let root,D,view="resumen",dirty=false,stored=null,q="",FILES=null;

/* ---------- Archivos ---------- */
async function dir(path,create){let h=root;for(const p of path.split("/").filter(Boolean))h=await h.getDirectoryHandle(p,{create});return h}
async function write(path,data){const ps=path.split("/"),n=ps.pop(),d=await dir(ps.join("/"),true),w=await(await d.getFileHandle(n,{create:true})).createWritable();await w.write(data);await w.close()}
const save=()=>write("data/data.js","window.RB_DATA = "+JSON.stringify(D,null,2)+";");
const pagina=p=>`<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${e(p.titulo)} | Radio Bezmiliana</title>
        <meta name="description" content="${e(p.descripcion)}">
        <link rel="canonical" href="${DOM}/programas/${code(p)}/">
        <meta property="og:title" content="${e(p.titulo)} | Radio Bezmiliana">
        <meta property="og:description" content="${e(p.descripcion)}">
        <meta property="og:type" content="website">
        <meta property="og:url" content="${DOM}/programas/${code(p)}/">
        <link rel="icon" href="../../assets/icons/favicon.ico">
        <link rel="apple-touch-icon" href="../../assets/icons/apple-touch-icon.png">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Inter:wght@400;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap">
        <link rel="stylesheet" href="../../style.css">
    </head>
    <body data-page="programa" data-root="../../" data-codigo="${code(p)}">
        <main id="programa">
            <noscript><p class="container">${e(p.titulo)}: ${e(p.descripcion)}</p></noscript>
        </main>
        <script src="../../data/data.js"></script>
        <script src="../../js/site.js"></script>
    </body>
</html>
`;
async function sitemap(){
 let t="";try{t=await(await(await root.getFileHandle("sitemap.xml")).getFile()).text()}catch{return}
 t=t.replace(/\s*<url>\s*<loc>[^<]*\/programas\/[^<]+<\/loc>[\s\S]*?<\/url>/g,"");
 const x=[...D.programas].map(code).sort().map(c=>`\n  <url>\n    <loc>${DOM}/programas/${c}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join("");
 await write("sitemap.xml",t.replace("</urlset>",x+"\n</urlset>"));
}
async function paginas(borrar){
 const pd=await dir("programas",true);
 for(const p of D.programas)await write(`programas/${code(p)}/index.html`,pagina(p));
 if(borrar)try{await pd.removeEntry(borrar,{recursive:true})}catch{}
 await sitemap();
}
function normalizar(){
 D.equipo=D.equipo||{};D.categorias=D.categorias||[];D.programas=D.programas||[];D.formularios=D.formularios||[];D.formularioUrl=D.formularioUrl||"";
 if(D.equipo.alumnado){D.equipo.miembros=[...(D.equipo.miembros||[]),...D.equipo.alumnado];delete D.equipo.alumnado}
 SECC.forEach(([k])=>D.equipo[k]=D.equipo[k]||[]);
}

/* ---------- Carpeta recordada (IndexedDB) ---------- */
const idb=()=>new Promise((ok,ko)=>{const r=indexedDB.open("rb-admin",1);r.onupgradeneeded=()=>r.result.createObjectStore("k");r.onsuccess=()=>ok(r.result);r.onerror=ko});
const kv=async(m,k,v)=>{const d=await idb();return new Promise((ok,ko)=>{const s=d.transaction("k",m==="get"?"readonly":"readwrite").objectStore("k"),r=m==="get"?s.get(k):s.put(v,k);r.onsuccess=()=>ok(r.result);r.onerror=ko})};
async function conectar(h){
 const prev=root;
 try{
  h=h||await showDirectoryPicker({mode:"readwrite"});root=h;
  const t=await(await(await dir("data")).getFileHandle("data.js")).getFile().then(f=>f.text());
  D=JSON.parse(t.slice(t.indexOf("{"),t.lastIndexOf("}")+1));normalizar();stored=h;view="resumen";
  try{await kv("put","h",h)}catch{}
 }catch(x){root=prev;if(x.name!=="AbortError")toast("No encuentro data/data.js. Elige la carpeta raíz de la web (donde está index.html).","err")}
 draw();
}

/* ---------- Interfaz base ---------- */
function toast(t,tipo){const d=document.createElement("div");d.className="t"+(tipo==="err"?" err":"");d.textContent=t;$("#toasts").append(d);setTimeout(()=>d.remove(),tipo==="err"?6000:3200)}
const ask=(t,ok="Eliminar")=>new Promise(r=>{const d=$("#cf");$("#cf-t").textContent=t;$("#cf-ok").textContent=ok;d.returnValue="";d.onclose=()=>r(d.returnValue==="ok");d.showModal()});
function modal(t,html,ok,fn){
 $("#dt").textContent=t;$("#db").innerHTML=html;$("#dok").textContent=ok;const d=$("#dlg"),f=$("#df");
 f.onsubmit=async ev=>{ev.preventDefault();$("#dok").disabled=true;try{if(await fn(f)!==false)d.close()}catch(x){toast("No se ha podido guardar: "+x.message,"err")}$("#dok").disabled=false};
 d.showModal();
}
const F=(l,inp,h)=>`<label class="fld"><span>${l}</span>${inp}${h?`<small>${h}</small>`:""}</label>`;
const vacio=(t,b="")=>`<div class="vacio"><p>${t}</p>${b}</div>`;
const nMiembros=()=>SECC.reduce((a,[k])=>a+D.equipo[k].length,0);

/* ---------- Vistas ---------- */
const inicio=()=>`<div class="card pad welcome"><h2>Conecta la carpeta de la web</h2><p>Elige la carpeta que contiene index.html. El panel guarda los cambios directamente en ella. Funciona en Chrome o Edge.</p>${stored?`<button class="b pri" data-a="reconectar">Reconectar la última carpeta</button>`:""}<button class="b${stored?"":" pri"}" data-a="conectar">Elegir carpeta</button></div>`;
const VIEWS={
 resumen(){
  const ab=D.formularios.filter(f=>f.abierto).length;
  return `<div class="stats">${[["Programas",D.programas.length,"programas"],["Miembros del equipo",nMiembros(),"equipo"],["Formularios abiertos",ab,"formularios"],["Categorías",D.categorias.length,"ajustes"]].map(([t,v,g])=>`<button class="stat" data-a="nav" data-i="${g}"><b>${v}</b><span>${t}</span></button>`).join("")}</div>
  <div class="card"><div class="ch"><h2>Últimos programas</h2><button class="b pri" data-a="p-new">Nuevo programa</button></div>${D.programas.length?`<table><tbody>${D.programas.slice(0,5).map((p,i)=>`<tr><td><b>${e(p.titulo)}</b><small>${e(p.categoria)}</small></td><td class="ac"><button class="b sm" data-a="p-edit" data-i="${i}">Editar</button></td></tr>`).join("")}</tbody></table>`:vacio("Aún no hay programas. Sube el primero.")}</div>`;
 },
 programas(){
  const L=D.programas.map((p,i)=>[p,i]).filter(([p])=>!q||(p.titulo+" "+p.categoria).toLowerCase().includes(q.toLowerCase()));
  return `<div class="bar"><input type="search" id="q" placeholder="Buscar programa o categoría" aria-label="Buscar programa" value="${e(q)}"><button class="b pri" data-a="p-new">Nuevo programa</button></div>
  ${q?"":`<p class="m">El orden de esta lista es el de la web: los 3 primeros salen en la página de inicio.</p>`}<div class="card">${L.length?`<table><thead><tr><th>Programa</th><th>Categoría</th><th>Equipo</th><th></th></tr></thead><tbody>${L.map(([p,i])=>`<tr><td><b>${e(p.titulo)}</b>${p.video?` <span class="pill">Vídeo</span>`:""}<small>/programas/${e(code(p))}/</small></td><td>${e(p.categoria)}</td><td>${(p.equipo||[]).length}</td><td class="ac"><button class="b sm" data-a="p-up" data-i="${i}" aria-label="Subir"${i&&!q?"":" disabled"}>↑</button><button class="b sm" data-a="p-down" data-i="${i}" aria-label="Bajar"${i<D.programas.length-1&&!q?"":" disabled"}>↓</button><a class="b sm" href="programas/${e(code(p))}/" target="_blank" rel="noopener">Ver</a><button class="b sm" data-a="p-edit" data-i="${i}">Editar</button><button class="b sm danger" data-a="p-del" data-i="${i}">Eliminar</button></td></tr>`).join("")}</tbody></table>`:vacio(q?"Ningún programa coincide con la búsqueda.":"Aún no hay programas. Sube el primero.")}</div>`;
 },
 equipo(){
  return SECC.map(([s,et])=>`<div class="card"><div class="ch"><h2>${et}</h2><button class="b" data-a="m-new" data-i="${s}">Añadir persona</button></div>${D.equipo[s].length?`<table><tbody>${D.equipo[s].map((m,i)=>`<tr><td><b>${e(m.nombre)}</b></td><td>${e(m.rol||"")}</td><td class="ac"><button class="b sm" data-a="m-up" data-i="${s}:${i}" aria-label="Subir"${i?"":" disabled"}>↑</button><button class="b sm" data-a="m-down" data-i="${s}:${i}" aria-label="Bajar"${i<D.equipo[s].length-1?"":" disabled"}>↓</button><button class="b sm" data-a="m-edit" data-i="${s}:${i}">Editar</button><button class="b sm danger" data-a="m-del" data-i="${s}:${i}">Eliminar</button></td></tr>`).join("")}</tbody></table>`:vacio("Nadie en esta sección todavía.")}</div>`).join("");
 },
 formularios(){
  const n=D.formularios.length;
  return `<div class="bar"><p class="m" style="flex:1;margin:0;align-self:center">Se muestran en la página pública <b>Formularios</b>, en este orden.</p><button class="b pri" data-a="f-new">Nuevo formulario</button></div>
  <div class="card">${n?D.formularios.map((f,i)=>`<div class="fi"><div><b>${e(f.titulo)}</b> <span class="pill ${f.abierto?"ok":"off"}">${f.abierto?"Abierto":"Cerrado"}</span>${f.descripcion?`<p>${e(f.descripcion)}</p>`:""}<a href="${e(f.url)}" target="_blank" rel="noopener">${e(f.url)}</a>${f.limite||f.para?`<p>${[f.para,f.limite&&"hasta el "+f.limite].filter(Boolean).map(e).join(" · ")}</p>`:""}</div><div class="ac"><button class="b sm" data-a="f-up" data-i="${i}" aria-label="Subir"${i?"":" disabled"}>↑</button><button class="b sm" data-a="f-down" data-i="${i}" aria-label="Bajar"${i<n-1?"":" disabled"}>↓</button><button class="b sm" data-a="f-toggle" data-i="${i}">${f.abierto?"Cerrar":"Abrir"}</button><button class="b sm" data-a="f-edit" data-i="${i}">Editar</button><button class="b sm danger" data-a="f-del" data-i="${i}">Eliminar</button></div></div>`).join(""):vacio("Aún no hay formularios.")}</div>`;
 },
 archivos(){
  if(!FILES)return vacio("Cargando archivos…");
  const uso={};D.programas.forEach(p=>[p.audio,p.imagen].filter(Boolean).forEach(x=>uso[x]=p.titulo));
  const sin=FILES.filter(f=>!uso[f.path]),mb=b=>(b/1048576).toFixed(1)+" MB",tot=FILES.reduce((a,f)=>a+f.size,0);
  return `<div class="bar"><p class="m" style="flex:1;margin:0;align-self:center">${FILES.length} archivos · ${mb(tot)} en total. GitHub no admite archivos de más de 100 MB.</p><button class="b danger" data-a="a-sin"${sin.length?"":" disabled"}>Eliminar los ${sin.length} sin usar</button></div>
  <div class="card">${FILES.length?`<table><thead><tr><th>Archivo</th><th>Usado en</th><th>Tamaño</th><th></th></tr></thead><tbody>${FILES.map(f=>`<tr><td><b>${e(f.n)}</b><small>${e(f.d)}/</small></td><td>${uso[f.path]?e(uso[f.path]):`<span class="pill off">Sin usar</span>`}</td><td>${mb(f.size)}${f.size>104857600?` <span class="pill">Supera 100 MB</span>`:""}</td><td class="ac">${uso[f.path]?"":`<button class="b sm danger" data-a="a-del" data-i="${e(f.path)}">Eliminar</button>`}</td></tr>`).join("")}</tbody></table>`:vacio("No hay archivos en audios/ ni imagenes/.")}</div>`;
 },
 ajustes(){
  const usada=c=>D.programas.some(p=>p.categoria===c);
  return `<div class="card pad"><h2>Formulario de inscripción</h2><p class="m">Enlace del botón de la página Inscríbete.</p><form data-f="url" class="row"><input name="u" type="url" aria-label="Enlace" value="${e(D.formularioUrl)}" placeholder="https://forms.gle/…"><button class="b pri">Guardar</button></form></div>
  <div class="card pad"><h2>Categorías de programas</h2><div class="chips">${D.categorias.map(c=>`<span class="chip">${e(c)}${usada(c)?"":`<button data-a="c-del" data-i="${e(c)}" aria-label="Quitar ${e(c)}">✕</button>`}</span>`).join("")}</div><p class="m">Las categorías con programas no se pueden quitar.</p><form data-f="cat" class="row"><input name="c" aria-label="Nueva categoría" placeholder="Nueva categoría" required><button class="b">Añadir</button></form></div>`;
 }
};
function draw(){
 $("#nav").innerHTML=Object.entries(VISTAS).map(([k,t])=>`<button data-a="nav" data-i="${k}"${k===view&&D?' aria-current="page"':""}${D?"":" disabled"}>${t}${D&&k==="programas"?`<em>${D.programas.length}</em>`:""}</button>`).join("");
 $("#conn").innerHTML=D?`<span class="dot on"></span>Carpeta conectada<button class="b sm" data-a="conectar">Cambiar</button>`:`<span class="dot"></span>Sin conectar`;
 $("#tit").textContent=D?VISTAS[view]:"Bienvenida";
 $("#pend").innerHTML=D&&dirty?`<div class="pend"><div><b>Hay cambios sin publicar.</b> Están guardados en tu carpeta, pero la web pública no cambia hasta que los subas a GitHub.</div><button class="b" data-a="copiar">Copiar comandos</button></div>`:"";
 $("#vista").innerHTML=D?VIEWS[view]():inicio();
}
const hecho=async(m,del)=>{await save();if(del!==undefined)await paginas(del);dirty=true;toast(m);draw()};

async function cargarArchivos(){
 const L=[];
 for(const d of ["audios","imagenes"]){let h;try{h=await dir(d)}catch{continue}
  for await(const[n,x]of h.entries())if(x.kind==="file")L.push({d,n,path:d+"/"+n,size:(await x.getFile()).size})}
 FILES=L.sort((a,b)=>b.size-a.size);if(view==="archivos")draw();
}
const recargar=()=>{FILES=null;draw();cargarArchivos()};

/* ---------- Formularios de edición ---------- */
function formP(i){
 const p=i==null?{}:D.programas[i],eq=p.equipo||[],all=[...new Set([...SECC.flatMap(([k])=>D.equipo[k].map(m=>m.nombre)),...eq])];
 modal(i==null?"Nuevo programa":"Editar programa",`<div class="g2">${F("Título",`<input name="titulo" required value="${e(p.titulo)}">`)}${F("Categoría",`<input name="categoria" list="cats" required placeholder="Noticias, Música…" value="${e(p.categoria)}"><datalist id="cats">${D.categorias.map(c=>`<option value="${e(c)}">`).join("")}</datalist>`)}</div>
 ${F("Código del programa",`<input name="codigo" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="bezmi-sessions" value="${e(p.titulo?code(p):"")}" data-man="${i==null?"":1}">`,"Dirección de su página: /programas/código/. Se rellena desde el título.")}
 ${F("Descripción",`<textarea name="descripcion" required rows="3">${e(p.descripcion)}</textarea>`)}
 <div class="g2">${F("Imagen",`<input type="file" name="imagen" accept="image/*">`,"Cuadrada, 1000 × 1000 px (mínimo 800). JPG, PNG o WebP."+(i==null?"":" Si no eliges otra, se mantiene la actual."))}${F("Audio .mp3",`<input type="file" name="audio" accept=".mp3,audio/mpeg">`,i==null?"Obligatorio.":"Si no eliges otro, se mantiene el actual.")}</div>
 <div class="fld"><span>¿Es un videopodcast?</span><div class="checks"><label><input type="radio" name="vp" value="no"${p.video?"":" checked"}> No</label><label><input type="radio" name="vp" value="si"${p.video?" checked":""}> Sí</label></div></div>
 <div id="cv"${p.video?"":" hidden"}>${F("Enlace de YouTube",`<input type="url" name="video" placeholder="https://www.youtube.com/watch?v=…" value="${e(p.video)}">`,"El vídeo se verá dentro de la página del programa.")}</div>
 <div class="fld"><span>Equipo que lo ha realizado</span><div class="checks">${all.length?all.map(n=>`<label><input type="checkbox" name="eq" value="${e(n)}"${eq.includes(n)?" checked":""}> ${e(n)}</label>`).join(""):"Añade antes personas en la sección Equipo."}</div></div>
 ${F("Invitados (opcional)",`<input name="invitados" placeholder="Alu42, Profe3" value="${e((p.invitados||[]).join(", "))}">`,"Separados por comas.")}`,
 "Guardar programa",async f=>{
  const s=slug(f.codigo.value),a=f.audio.files[0],im=f.imagen.files[0],old=i==null?null:D.programas[i],si=f.vp.value==="si",video=si?f.video.value.trim():"";
  if(si&&!YT.test(video)){toast("Pon un enlace válido de YouTube (youtube.com o youtu.be).","err");return false}
  if(si&&!yt(video)){toast("No reconozco el vídeo. Copia el enlace completo desde la barra de direcciones de YouTube.","err");return false}
  if(!s||D.programas.some(x=>x!==old&&code(x)===s)){toast(`Ya existe un programa con el código «${s}». Elige otro.`,"err");return false}
  if(!old&&!a){toast("Falta el archivo .mp3.","err");return false}
  if(im&&window.createImageBitmap){try{const bm=await createImageBitmap(im),w=bm.width,h=bm.height;if(bm.close)bm.close();
   if((w/h<.98||w/h>1.02||w<800)&&!await ask(`La imagen mide ${w}×${h} px. Lo ideal es 1000×1000 px; si no, se recortará al mostrarse. ¿Subirla igualmente?`,"Subir igualmente"))return false}catch{}}
  let audio=old?old.audio:`audios/${s}.mp3`,img=old?old.imagen:"";
  if(a){audio=`audios/${s}.mp3`;await write(audio,a)}
  if(im){img=`imagenes/${s}.${im.name.split(".").pop().toLowerCase()}`;await write(img,im)}
  const c=f.categoria.value.trim();if(!D.categorias.includes(c))D.categorias.push(c);
  const p2={titulo:f.titulo.value.trim(),codigo:s,descripcion:f.descripcion.value.trim(),categoria:c,imagen:img,audio,video,equipo:[...f.querySelectorAll("[name=eq]:checked")].map(x=>x.value),invitados:f.invitados.value.split(",").map(x=>x.trim()).filter(Boolean)};
  let del="";if(old){if(code(old)!==s)del=code(old);D.programas[i]=p2}else D.programas.unshift(p2);
  await hecho(old?"Cambios guardados":"Programa guardado",del);
 });
}
function formM(s,i){
 const m=i==null?{}:D.equipo[s][i];
 modal(i==null?"Añadir persona":"Editar persona",`<div class="g2">${F("Nombre",`<input name="nombre" required value="${e(m.nombre)}">`)}${F("Sección",`<select name="seccion">${SECC.map(([k,t])=>`<option value="${k}"${k===s?" selected":""}>${t}</option>`).join("")}</select>`)}</div>${F("Curso (opcional)",`<input name="rol" value="${e(m.rol)}">`)}`,"Guardar",async f=>{
  const n=f.nombre.value.trim(),ns=f.seccion.value,nuevo={nombre:n,rol:f.rol.value.trim()};
  if(i==null)D.equipo[ns].push(nuevo);
  else{D.equipo[s].splice(i,1);if(ns===s)D.equipo[s].splice(i,0,nuevo);else D.equipo[ns].push(nuevo);
   if(m.nombre!==n)D.programas.forEach(p=>p.equipo=(p.equipo||[]).map(x=>x===m.nombre?n:x))}
  await hecho("Persona guardada");
 });
}
function formF(i){
 const x=i==null?{abierto:true}:D.formularios[i];
 modal(i==null?"Nuevo formulario":"Editar formulario",`${F("Título",`<input name="titulo" required value="${e(x.titulo)}">`)}${F("Descripción",`<textarea name="descripcion" rows="2">${e(x.descripcion)}</textarea>`,"Una o dos frases.")}${F("Enlace del formulario",`<input type="url" name="url" required placeholder="https://forms.gle/…" value="${e(x.url)}">`,"Google Forms, Microsoft Forms o cualquier otro servicio.")}
 <div class="g2">${F("Dirigido a (opcional)",`<input name="para" placeholder="Alumnado de 1º ESO" value="${e(x.para)}">`)}${F("Fecha límite (opcional)",`<input type="date" name="limite" value="${e(x.limite)}">`)}</div>
 <div class="fld checks"><label><input type="checkbox" name="abierto"${x.abierto?" checked":""}> Abierto: se puede rellenar desde la web</label></div>`,"Guardar formulario",async f=>{
  if(!/^https?:\/\//i.test(f.url.value.trim())){toast("El enlace debe empezar por http:// o https://","err");return false}
  const n={titulo:f.titulo.value.trim(),descripcion:f.descripcion.value.trim(),url:f.url.value.trim(),abierto:f.abierto.checked,limite:f.limite.value,para:f.para.value.trim()};
  if(i==null)D.formularios.push(n);else D.formularios[i]=n;
  await hecho("Formulario guardado");
 });
}

/* ---------- Eventos ---------- */
document.addEventListener("click",async ev=>{
 const b=ev.target.closest("[data-a]");if(!b)return;const a=b.dataset.a,i=b.dataset.i;
 if(a==="nav"){view=i;draw();if(i==="archivos"){FILES=null;draw();cargarArchivos()}}
 else if(a==="cerrar")$("#dlg").close();
 else if(a==="conectar")conectar();
 else if(a==="reconectar"){try{if(await stored.requestPermission({mode:"readwrite"})==="granted")conectar(stored)}catch{conectar()}}
 else if(a==="copiar"){try{await navigator.clipboard.writeText('git add .\ngit commit -m "Actualiza contenido"\ngit push');toast("Comandos copiados. Pégalos en la terminal, dentro de la carpeta de la web.")}catch{toast("No se ha podido copiar.","err")}}
 else if(a==="p-new")formP();
 else if(a==="p-edit")formP(+i);
 else if(a==="p-del"){const p=D.programas[+i];if(await ask(`¿Eliminar «${p.titulo}»? Se quita de la web, pero sus archivos de audio e imagen se quedan: puedes quitarlos en Archivos.`)){const c=code(D.programas.splice(+i,1)[0]);await hecho("Programa eliminado",c)}}
 else if(a==="p-up"||a==="p-down"){const n=+i+(a==="p-up"?-1:1),L=D.programas;[L[+i],L[n]]=[L[n],L[+i]];await hecho("Orden actualizado")}
 else if(a==="a-del"){if(await ask(`¿Eliminar ${i}? Ningún programa lo usa. No se puede deshacer.`)){const[d,n]=i.split("/");await(await dir(d)).removeEntry(n);dirty=true;toast("Archivo eliminado");recargar()}}
 else if(a==="a-sin"){const uso=new Set(D.programas.flatMap(p=>[p.audio,p.imagen]).filter(Boolean)),L=FILES.filter(f=>!uso.has(f.path));
  if(await ask(`¿Eliminar ${L.length} archivos que ningún programa usa? No se puede deshacer.`,"Eliminar todos")){for(const f of L)await(await dir(f.d)).removeEntry(f.n);dirty=true;toast(`${L.length} archivos eliminados`);recargar()}}
 else if(a==="m-up"||a==="m-down"){const[s,n]=i.split(":"),L=D.equipo[s],k=+n+(a==="m-up"?-1:1);[L[+n],L[k]]=[L[k],L[+n]];await hecho("Orden actualizado")}
 else if(a==="m-new")formM(i);
 else if(a==="m-edit"){const[s,n]=i.split(":");formM(s,+n)}
 else if(a==="m-del"){const[s,n]=i.split(":"),m=D.equipo[s][+n];if(await ask(`¿Eliminar a ${m.nombre} del equipo?`)){D.equipo[s].splice(+n,1);await hecho("Persona eliminada")}}
 else if(a==="f-new")formF();
 else if(a==="f-edit")formF(+i);
 else if(a==="f-del"){if(await ask(`¿Eliminar el formulario «${D.formularios[+i].titulo}»?`)){D.formularios.splice(+i,1);await hecho("Formulario eliminado")}}
 else if(a==="f-toggle"){const f=D.formularios[+i];f.abierto=!f.abierto;await hecho(f.abierto?"Formulario abierto":"Formulario cerrado")}
 else if(a==="f-up"||a==="f-down"){const n=+i+(a==="f-up"?-1:1),L=D.formularios;[L[+i],L[n]]=[L[n],L[+i]];await hecho("Orden actualizado")}
 else if(a==="c-del"){D.categorias=D.categorias.filter(c=>c!==i);await hecho("Categoría quitada")}
});
document.addEventListener("submit",async ev=>{
 const f=ev.target;if(!f.dataset.f)return;ev.preventDefault();
 if(f.dataset.f==="url")D.formularioUrl=f.u.value.trim(),await hecho("Enlace guardado");
 else{const c=f.c.value.trim();if(c&&!D.categorias.includes(c)){D.categorias.push(c);await hecho("Categoría añadida")}}
});
document.addEventListener("input",ev=>{
 const t=ev.target;
 if(t.id==="q"){q=t.value;draw();const s=$("#q");s.focus();s.setSelectionRange(q.length,q.length)}
 else if(t.name==="titulo"&&t.form&&t.form.codigo&&!t.form.codigo.dataset.man)t.form.codigo.value=t.value?slug(t.value):"";
 else if(t.name==="codigo")t.dataset.man=t.value?"1":"";
});
document.addEventListener("change",ev=>{
 const t=ev.target;if(t.name!=="vp")return;
 $("#cv").hidden=t.value!=="si";if(t.value!=="si")t.form.video.value="";
});
window.addEventListener("unhandledrejection",ev=>toast("Error: "+(ev.reason&&ev.reason.message||ev.reason),"err"));
(async()=>{
 try{stored=await kv("get","h")}catch{}
 if(stored){try{if(await stored.queryPermission({mode:"readwrite"})==="granted"){await conectar(stored);return}}catch{}}
 draw();
})();
