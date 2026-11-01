let root,D;const $=id=>document.getElementById(id);
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const slug=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||String(Date.now());
async function dir(path,create){let h=root;for(const p of path.split("/").filter(Boolean))h=await h.getDirectoryHandle(p,{create});return h}
async function write(path,data){const ps=path.split("/"),n=ps.pop(),d=await dir(ps.join("/"),true),w=await(await d.getFileHandle(n,{create:true})).createWritable();await w.write(data);await w.close()}
const save=()=>write("data/data.js","window.RB_DATA = "+JSON.stringify(D,null,2)+";");
const DOM="https://www.radiobezmiliana.es";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const code=p=>p.codigo||slug(p.titulo);
const pagina=p=>`<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${esc(p.titulo)} | Radio Bezmiliana</title>
        <meta name="description" content="${esc(p.descripcion)}">
        <link rel="canonical" href="${DOM}/programas/${code(p)}/">
        <meta property="og:title" content="${esc(p.titulo)} | Radio Bezmiliana">
        <meta property="og:description" content="${esc(p.descripcion)}">
        <meta property="og:type" content="website">
        <meta property="og:url" content="${DOM}/programas/${code(p)}/">
        <link rel="icon" href="../../assets/icons/favicon.ico">
        <link rel="apple-touch-icon" href="../../assets/icons/apple-touch-icon.png">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Inter:wght@400;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap">
        <link rel="stylesheet" href="../../style.css">
    </head>
    <body data-page="programa" data-root="../../" data-codigo="${code(p)}">
        <main id="programa">
            <noscript><p class="container">${esc(p.titulo)}: ${esc(p.descripcion)}</p></noscript>
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
const msg=t=>{$("msg").textContent=t;setTimeout(()=>$("msg").textContent="",4000)};
if(!window.showDirectoryPicker)$("aviso").hidden=false;
$("conectar").onclick=async()=>{
 root=await showDirectoryPicker({mode:"readwrite"});
 try{const f=await(await(await dir("data")).getFileHandle("data.js")).getFile(),t=await f.text();D=JSON.parse(t.slice(t.indexOf("{"),t.lastIndexOf("}")+1))}
 catch{alert("No encuentro data/data.js. Elige la carpeta raíz de la web (donde está index.html).");return}
 $("panel").hidden=false;draw();
};
function draw(){
 const all=[...D.equipo.coordinacion,...D.equipo.alumnado].map(m=>m.nombre);
 $("cats").innerHTML=D.categorias.map(c=>`<option value="${e(c)}">`).join("");
 $("eq").innerHTML=all.length?all.map(n=>`<label><input type="checkbox" name="eq" value="${e(n)}"> ${e(n)}</label>`).join(""):"Añade antes miembros del equipo.";
 $("lp").innerHTML=D.programas.map((p,i)=>`<div class="row"><span><b>${e(p.titulo)}</b> · ${e(p.categoria)}</span><button class="btn btn-secondary btn-sm" data-p="${i}">Eliminar</button></div>`).join("")||"Sin programas.";
 $("lm").innerHTML=["coordinacion","alumnado"].flatMap(s=>D.equipo[s].map((m,i)=>`<div class="row"><span><b>${e(m.nombre)}</b> · ${s}${m.rol?" · "+e(m.rol):""}</span><button class="btn btn-secondary btn-sm" data-m="${s}:${i}">Eliminar</button></div>`)).join("")||"Sin miembros.";
}
document.addEventListener("click",async ev=>{
 const b=ev.target.closest("button[data-p],button[data-m]");if(!b||!confirm("¿Eliminar?"))return;
 let del="";if(b.dataset.p)del=code(D.programas.splice(+b.dataset.p,1)[0]);else{const[s,i]=b.dataset.m.split(":");D.equipo[s].splice(+i,1)}
 await save();await paginas(del);draw();msg("Eliminado ✓");
});
$("fp").onsubmit=async ev=>{ev.preventDefault();const f=ev.target,m=f.elements,s=slug(m.titulo.value),a=m.audio.files[0],i=m.imagen.files[0];
 await write(`audios/${s}.mp3`,a);let img="";
 if(i){img=`imagenes/${s}.${i.name.split(".").pop().toLowerCase()}`;await write(img,i)}
 const c=m.categoria.value.trim();if(!D.categorias.includes(c))D.categorias.push(c);
 D.programas.unshift({titulo:m.titulo.value.trim(),codigo:s,descripcion:m.descripcion.value.trim(),categoria:c,imagen:img,audio:`audios/${s}.mp3`,equipo:[...f.querySelectorAll("[name=eq]:checked")].map(x=>x.value)});
 await save();await paginas();f.reset();draw();msg("Programa guardado ✓");
};
$("fm").onsubmit=async ev=>{ev.preventDefault();const m=ev.target.elements;
 D.equipo[m.seccion.value].push({nombre:m.nombre.value.trim(),rol:m.rol.value.trim()});
 await save();ev.target.reset();draw();msg("Miembro guardado ✓");
};
