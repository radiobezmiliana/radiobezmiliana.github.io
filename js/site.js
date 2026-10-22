(function(){
const D=window.RB_DATA||{categorias:[],equipo:{},programas:[]},cur=document.body.dataset.page,$=id=>document.getElementById(id);
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pages=[["index","Inicio"],["programas","Programas"],["equipo","Equipo"],["contacto","Contacto"],["inscribete","Inscríbete"]];
document.body.insertAdjacentHTML("afterbegin",`<header class="site-header"><nav class="nav container"><a class="brand" href="index.html"><img src="assets/logo-radio-bezmiliana.png" alt="Logo de Radio Bezmiliana"><span>Radio Bezmiliana</span></a><button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false">☰</button><div class="nav-links">${pages.map(([p,t])=>`<a href="${p}.html"${p==cur?' aria-current="page"':""}>${t}</a>`).join("")}</div></nav></header>`);
document.body.insertAdjacentHTML("beforeend",`<footer><div class="container footer-inner"><div><strong>Radio Bezmiliana.</strong> IES Bezmiliana (Rincón de la Victoria, Málaga).</div><span class="copyright">© 2026 Radio Bezmiliana</span></div></footer>`);
const nl=document.querySelector(".nav-links"),nt=document.querySelector(".nav-toggle");
nt.onclick=()=>nt.setAttribute("aria-expanded",nl.classList.toggle("open"));
const card=p=>`<article class="program-card"><div class="cover">${p.imagen?`<img src="${e(p.imagen)}" alt="" loading="lazy">`:`<span>${e(p.titulo[0])}</span>`}</div><span class="tag">${e(p.categoria)}</span><h3>${e(p.titulo)}</h3><p>${e(p.descripcion)}</p>${p.equipo&&p.equipo.length?`<p class="crew"><b>Equipo:</b> ${p.equipo.map(n=>e(n)).join(", ")}</p>`:""}<div class="player"><audio controls preload="none" src="${e(p.audio)}"></audio></div></article>`;
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
if(cur=="equipo")[["coordinacion","eq-coord"],["alumnado","eq-alum"]].forEach(([k,id])=>{const l=(D.equipo||{})[k]||[];
 $(id).innerHTML=l.length?l.map(m=>`<article class="team-card"><div class="avatar">${e(m.nombre[0])}</div><div><h3>${e(m.nombre)}</h3><p>${e(m.rol||"")}</p></div></article>`).join(""):"<p>Próximamente.</p>"});
if(cur=="inscribete"){
 $("abrir").onclick=()=>D.formularioUrl?window.open(D.formularioUrl,"_blank","noopener"):$("dlg").showModal();
 $("cerrar").onclick=()=>$("dlg").close();
}
})();
