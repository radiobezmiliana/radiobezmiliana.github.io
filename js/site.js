(function(){
const D=window.RB_DATA||{categorias:[],equipo:{},programas:[]},B=document.body,cur=B.dataset.page,R=B.dataset.root||"",$=id=>document.getElementById(id);
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const slug=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const code=p=>p.codigo||slug(p.titulo);
const url=p=>`${R}programas/${encodeURIComponent(code(p))}/`;
const pages=[["index","Inicio"],["programas","Programas"],["equipo","Equipo"],["contacto","Contacto"],["inscribete","Inscríbete"]];
const here=cur=="programa"?"programas":cur;
document.body.insertAdjacentHTML("afterbegin",`<header class="site-header"><nav class="nav container"><a class="brand" href="${R}index.html"><img src="${R}assets/logo-radio-bezmiliana.png" alt="Logo de Radio Bezmiliana"><span>Radio Bezmiliana</span></a><button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false">☰</button><div class="nav-links">${pages.map(([p,t])=>`<a href="${R}${p}.html"${p==here?' aria-current="page"':""}>${t}</a>`).join("")}</div></nav></header>`);
document.body.insertAdjacentHTML("beforeend",`<footer><div class="container footer-inner"><div>IES Bezmiliana (Rincón de la Victoria, Málaga).</div><span class="copyright">© 2026 Radio Bezmiliana</span></div></footer>`);
const nl=document.querySelector(".nav-links"),nt=document.querySelector(".nav-toggle");
nt.onclick=()=>nt.setAttribute("aria-expanded",nl.classList.toggle("open"));
const cover=p=>p.imagen?`<img src="${R}${e(p.imagen)}" alt="" loading="lazy">`:`<span>${e(p.titulo[0])}</span>`;
const card=p=>`<article class="program-card"><a class="cover" href="${url(p)}" aria-label="Ver ${e(p.titulo)}">${cover(p)}</a><span class="tag">${e(p.categoria)}</span>${/^https?:\/\//.test(p.video||"")?`<span class="badge-video">Vídeo-podcast</span>`:""}<h3><a href="${url(p)}">${e(p.titulo)}</a></h3><p>${e(p.descripcion)}</p>${p.equipo&&p.equipo.length?`<p class="crew"><b>Equipo:</b> ${p.equipo.map(n=>e(n)).join(", ")}</p>`:""}${p.invitados&&p.invitados.length?`<p class="crew"><b>Invitados:</b> ${p.invitados.map(n=>e(n)).join(", ")}</p>`:""}<div class="player"><audio controls controlsList="nodownload" oncontextmenu="return false" preload="none" src="${R}${e(p.audio)}"></audio></div><a class="card-link" href="${url(p)}">Ver programa →</a></article>`;
if(cur=="index"&&$("ultimos"))$("ultimos").innerHTML=D.programas.slice(0,3).map(card).join("");
if(cur=="programas"){
 const cats=[...new Set([...D.categorias,...D.programas.map(p=>p.categoria)])];let act="Todas";
 const draw=()=>{
  $("filtros").innerHTML=["Todas",...cats].map(c=>`<button class="chip" aria-pressed="${c==act}">${e(c)}</button>`).join("");
  $("filtros").querySelectorAll("button").forEach(b=>b.onclick=()=>{act=b.textContent;draw()});
  const ps=D.programas.filter(p=>act=="Todas"||p.categoria==act);
  $("lista").innerHTML=ps.length?ps.map(card).join(""):"<p>Todavía no hay programas en esta categoría.</p>";
 };draw();
}
if(cur=="programa"){
 const p=D.programas.find(x=>code(x)==B.dataset.codigo),m=$("programa");
 if(!p)m.innerHTML=`<section class="page-hero"><div class="container"><h1>Programa <span>no encontrado</span></h1><p>Este programa no existe o ya no está disponible.</p><a class="btn btn-primary" href="${R}programas.html">Ver todos los programas</a></div></section>`;
 else{
  document.title=`${p.titulo} | Radio Bezmiliana`;
  const otros=D.programas.filter(x=>x!==p).slice(0,3);
  m.innerHTML=`<section class="page-hero"><div class="container"><a class="back-link" href="${R}programas.html">← Todos los programas</a><span class="tag">${e(p.categoria)}</span><h1>${e(p.titulo)}</h1><p>${e(p.descripcion)}</p></div></section>
<section class="section" style="padding-top:0"><div class="container program-detail"><div class="detail-cover">${cover(p)}</div><div class="detail-body">${/^https?:\/\//.test(p.video||"")?`<a class="btn-videopodcast" href="${e(p.video)}" target="_blank" rel="noopener"><span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span><span><small>Videopodcast en YouTube</small>Ver el videopodcast</span></a>`:""}<h2>Escucha el programa</h2><div class="player"><audio controls controlsList="nodownload" oncontextmenu="return false" preload="metadata" src="${R}${e(p.audio)}"></audio></div>${p.equipo&&p.equipo.length?`<h2>Equipo</h2><ul class="detail-crew">${p.equipo.map(n=>`<li>${e(n)}</li>`).join("")}</ul>`:""}${p.invitados&&p.invitados.length?`<h2>Invitados</h2><ul class="detail-crew">${p.invitados.map(n=>`<li>${e(n)}</li>`).join("")}</ul>`:""}</div></div></section>
${otros.length?`<section class="section" style="padding-top:0"><div class="container"><div class="section-heading"><h2>Más programas</h2><a class="btn btn-secondary" href="${R}programas.html">Ver todos</a></div><div class="program-grid">${otros.map(card).join("")}</div></div></section>`:""}`;
 }
}
if(cur=="equipo")[["profesorado","eq-prof"],["coordinacion","eq-coord"],["miembros","eq-miembros"]].forEach(([k,id])=>{const E=D.equipo||{},l=E[k]||(k=="miembros"?E.alumnado:null)||[];
 $(id).classList.toggle("few",l.length>0&&l.length<4);
 $(id).innerHTML=l.length?l.map(m=>`<article class="team-card"><div class="avatar">${e(m.nombre[0])}</div><div><h3>${e(m.nombre)}</h3><p>${e(m.rol||"")}</p></div></article>`).join(""):"<p>Próximamente.</p>"});
if(cur=="inscribete"){
 $("abrir").onclick=()=>D.formularioUrl?window.open(D.formularioUrl,"_blank","noopener"):$("dlg").showModal();
 $("cerrar").onclick=()=>$("dlg").close();
}
})();
