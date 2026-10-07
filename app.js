const $ = s => document.querySelector(s);
let servers = [], selected = new Set();

function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function avatar(s){
  if(s.icon) return `<img src="${esc(s.icon)}" alt="">`;
  return esc((s.name||"?").trim().slice(0,1).toUpperCase());
}
function normalize(data){
  if(!Array.isArray(data)) throw new Error("O JSON precisa ser uma lista.");
  return data.map((x,i)=>({
    id:String(x.id??x.guild_id??i),
    name:String(x.name??x.server_name??`Servidor ${i+1}`),
    icon:x.icon_url||x.icon||""
  }));
}
function render(){
  const q=$("#search").value.toLowerCase().trim();
  const list=servers.filter(s=>s.name.toLowerCase().includes(q)||s.id.includes(q));
  $("#serverList").innerHTML=list.map(s=>`
    <label class="server ${selected.has(s.id)?"sel":""}">
      <input type="checkbox" data-id="${esc(s.id)}" ${selected.has(s.id)?"checked":""}>
      <div class="avatar">${avatar(s)}</div>
      <div style="min-width:0"><div class="name">${esc(s.name)}</div><div class="id">${esc(s.id)}</div></div>
    </label>`).join("");
  $("#empty").hidden=list.length!==0;
  $("#count").textContent=servers.length;
  $("#selected").textContent=selected.size;
  $("#barCount").textContent=selected.size;
  $("#selectedBar").hidden=selected.size===0;
  document.querySelectorAll(".server input").forEach(cb=>cb.onchange=()=>{
    cb.checked?selected.add(cb.dataset.id):selected.delete(cb.dataset.id); render();
  });
}
function load(data){
  servers=normalize(data); selected.clear(); $("#setup").hidden=true; $("#dashboard").hidden=false; render();
}
$("#fileInput").onchange=async e=>{
  const f=e.target.files[0]; if(!f)return;
  try{
    if(f.name.toLowerCase().endsWith(".csv")){
      const rows=(await f.text()).trim().split(/\r?\n/).slice(1);
      load(rows.map(r=>{const [id,name,icon]=r.split(",");return{id,name,icon}}));
    }else load(JSON.parse(await f.text()));
  }catch(err){alert("Não consegui ler o arquivo: "+err.message)}
};
$("#demoBtn").onclick=()=>load([
  {id:"111111111111111111",name:"Meu servidor principal"},
  {id:"222222222222222222",name:"Comunidade Gaming"},
  {id:"333333333333333333",name:"Servidor antigo"},
  {id:"444444444444444444",name:"Projeto Discord"},
  {id:"555555555555555555",name:"Memes & Games"}
]);
$("#search").oninput=render;
$("#clear").onclick=()=>{selected.clear();render()};
$("#selectAll").onclick=()=>{
  const q=$("#search").value.toLowerCase().trim();
  servers.filter(s=>s.name.toLowerCase().includes(q)||s.id.includes(q)).forEach(s=>selected.add(s.id)); render();
};
$("#export").onclick=()=>{
  const out=servers.filter(s=>selected.has(s.id));
  const blob=new Blob([JSON.stringify(out,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="discord-selection.json";a.click();
};
$("#openSelected").onclick=()=>{
  const chosen=servers.filter(s=>selected.has(s.id));
  if(chosen.length>10 && !confirm(`Você selecionou ${chosen.length} servidores. Abrir muitas abas pode ser inconveniente. Continuar?`))return;
  chosen.forEach((s,i)=>setTimeout(()=>window.open(`https://discord.com/channels/${s.id}`,"_blank"),i*180));
};
$("#themeBtn").onclick=()=>{
  document.documentElement.style.setProperty("--bg",getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()==="#0b0d10"?"#eef1f5":"#0b0d10");
  document.documentElement.style.setProperty("--text",getComputedStyle(document.documentElement).getPropertyValue("--text").trim()==="#f2f5f8"?"#11151b":"#f2f5f8");
  document.documentElement.style.setProperty("--card",getComputedStyle(document.documentElement).getPropertyValue("--card").trim()==="#12161c"?"#fff":"#12161c");
};
