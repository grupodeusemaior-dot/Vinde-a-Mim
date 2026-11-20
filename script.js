const BOOKS = [
  {id:"vinde-volume-1",title:"Vinde a Mim — Volume 1",file:"./dados/vinde-volume-1.json",description:"Devocionais bíblicos"},
  {id:"vinde-volume-2",title:"Vinde a Mim — Volume 2",file:"./dados/vinde-volume-2.json",description:"Continuação dos devocionais"},
  {id:"samanta",title:"Samanta — Os caminhos da vida",file:"./dados/samanta.json",description:"Uma jornada de fé e amadurecimento"},
  {id:"caminhos-jose",title:"Os Caminhos de José",file:"./dados/caminhos-jose.json",description:"Uma jornada de fé, graça e esperança"}
];
const $ = id => document.getElementById(id);
const state={book:null,data:null,index:0,font:21,showPresentation:false};
const FONT_STEPS=[18,19,20,21,22,23,24,25,26,27,28,29,30];
let installPrompt=null;
const localDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const dayDiff=(a,b)=>{const [ay,am,ad]=a.split("-").map(Number),[by,bm,bd]=b.split("-").map(Number);return Math.floor((Date.UTC(by,bm-1,bd)-Date.UTC(ay,am-1,ad))/86400000)};
const safeRead=key=>{try{return JSON.parse(localStorage.getItem(key)||"{}")}catch{return {}}};
const safeWrite=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2800)}
function setActiveNav(id){["navHome","navRead","navCredits","navSite"].forEach(x=>$(x)?.classList.toggle("active",x===id))}
function renderBooks(){
  $("bookGrid").innerHTML="";
  BOOKS.forEach((book,i)=>{
    const b=document.createElement("button");b.className="book-card";
    b.innerHTML=`<span class="book-art">${["V1","V2","S","J"][i]}</span><span class="book-info"><strong>${book.title}</strong><small>${book.description}</small></span><span class="book-arrow">›</span>`;
    b.addEventListener("click",()=>openBook(book));$("bookGrid").appendChild(b);
  });
}
async function openBook(book){
  try{
    const response=await fetch(book.file);
    if(!response.ok)throw new Error("Não foi possível carregar este módulo.");
    state.data=await response.json();state.book=book;state.showPresentation=false;
    const progress=safeRead("rdm-progress");
    if(!progress[book.id]){
      progress[book.id]={startDate:localDate(),lastDate:localDate(),lastIndex:0};
      safeWrite("rdm-progress",progress);
    }
    const entry=progress[book.id],today=localDate();
    if(today>entry.lastDate)entry.lastDate=today;
    safeWrite("rdm-progress",progress);
    const unlocked=Math.min(state.data.capitulos.length-1,Math.max(0,dayDiff(entry.startDate,entry.lastDate)));
    state.index=Math.min(unlocked,Math.max(0,entry.lastIndex||0));
    $("homeView").hidden=true;$("readerView").hidden=false;setActiveNav("navRead");
    $("readerBookline").textContent=book.title.toUpperCase();
    $("presentationBtn").hidden=!state.data.apresentacao;
    renderReader();window.scrollTo({top:0,behavior:"smooth"});
  }catch(err){toast(err.message||"Erro ao abrir o módulo.")}
}
function currentUnlocked(){
  const progress=safeRead("rdm-progress"),entry=progress[state.book.id];
  if(!entry)return 0;
  const today=localDate();
  // Proteção local contra regressão da data. Sem backend, não há como impedir avanço manual do relógio.
  if(today>entry.lastDate){entry.lastDate=today;progress[state.book.id]=entry;safeWrite("rdm-progress",progress)}
  return Math.min(state.data.capitulos.length-1,Math.max(0,dayDiff(entry.startDate,entry.lastDate)));
}
function renderReader(){
  const unlocked=currentUnlocked(),content=$("readerContent");
  if(!state.showPresentation && (!state.data.capitulos[state.index] || state.index>unlocked))state.index=unlocked;
  const chapter=state.showPresentation?state.data.apresentacao:state.data.capitulos[state.index];
  content.innerHTML="";
  const label=document.createElement("div");label.className="day-label";
  label.textContent=state.showPresentation?"APRESENTAÇÃO":`DIA ${String(state.index+1).padStart(2,"0")}`;
  const h=document.createElement("h1");h.textContent=chapter.titulo;content.append(label,h);
  (chapter.paragrafos||[]).forEach(text=>{const p=document.createElement("p");p.textContent=text;content.appendChild(p)});
  document.documentElement.style.setProperty("--reader-size",state.font+"px");
  setTimeout(()=>{$("launchSplash")?.classList.add("hide")},1050);
  $("fontSizeLabel").textContent=state.font<=19?"Pequena":state.font<=23?"Grande":"Muito grande";
  $("chapterPosition").textContent=state.showPresentation?"Apresentação · não consome dia":`${state.index+1} de ${state.data.capitulos.length}`;
  $("previousBtn").disabled=state.showPresentation||state.index<=0;
  $("nextBtn").disabled=state.showPresentation||state.index>=state.data.capitulos.length-1;
  $("lockedMessage").hidden=true;
  const progress=safeRead("rdm-progress");
  if(progress[state.book.id]&&!state.showPresentation){progress[state.book.id].lastIndex=state.index;safeWrite("rdm-progress",progress)}
}
function goHome(){
  $("readerView").hidden=true;$("homeView").hidden=false;setActiveNav("navHome");
  state.book=null;state.data=null;state.showPresentation=false;
  window.scrollTo({top:0,behavior:"smooth"});
}
function navigate(delta){
  if(state.showPresentation){state.showPresentation=false;state.index=0;renderReader();return}
  const target=state.index+delta;
  if(target<0||target>=state.data.capitulos.length)return;
  state.index=target;renderReader();window.scrollTo({top:0,behavior:"smooth"});
}
function updateFont(delta){
  const current=FONT_STEPS.reduce((best,n)=>Math.abs(n-state.font)<Math.abs(best-state.font)?n:best,FONT_STEPS[0]);
  const idx=FONT_STEPS.indexOf(current);
  state.font=FONT_STEPS[Math.max(0,Math.min(FONT_STEPS.length-1,idx+delta))];
  try{localStorage.setItem("rdm-font",String(state.font))}catch{}
  if(state.data)renderReader();else document.documentElement.style.setProperty("--reader-size",state.font+"px");
}
function init(){
  try{state.font=Number(localStorage.getItem("rdm-font"))||21}catch{}
  renderBooks();
  $("backHome").addEventListener("click",goHome);$("homeBrand").addEventListener("click",goHome);
  $("navHome").addEventListener("click",()=>{goHome();setActiveNav("navHome")});
  $("navRead").addEventListener("click",()=>{if(state.book){$("readerView").hidden=false;$("homeView").hidden=true;setActiveNav("navRead")}else toast("Escolha um módulo para começar a leitura.")});
  $("navCredits").addEventListener("click",()=>$("creditsDialog").showModal());
  $("navSite").addEventListener("click",()=>setActiveNav("navSite"));

  $("previousBtn").addEventListener("click",()=>navigate(-1));$("nextBtn").addEventListener("click",()=>navigate(1));
  $("fontDown").addEventListener("click",()=>updateFont(-1));$("fontUp").addEventListener("click",()=>updateFont(1));
  $("presentationBtn").addEventListener("click",()=>{
    if(state.data&&state.data.apresentacao){state.showPresentation=true;renderReader();window.scrollTo({top:0,behavior:"smooth"})}
  });

  $("closeCredits").addEventListener("click",()=>$("creditsDialog").close());
  $("creditsOk").addEventListener("click",()=>$("creditsDialog").close());
  $("connectionLabel").textContent=navigator.onLine?"Leituras serão armazenadas para uso offline após o primeiro carregamento.":"Você está offline.";
  window.addEventListener("online",()=>$("connectionLabel").textContent="Conectado · conteúdo preparado para uso offline");
  window.addEventListener("offline",()=>$("connectionLabel").textContent="Modo offline");
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("installBtn").hidden=false});
  $("installBtn").addEventListener("click",async()=>{
    if(!installPrompt){toast("No iPhone: Safari → Compartilhar → Adicionar à Tela de Início. No Android: menu do navegador → Instalar aplicativo.");return}
    installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("installBtn").hidden=true;
  });
  if("serviceWorker" in navigator&&location.protocol!=="file:"){
    navigator.serviceWorker.register("./service-worker.js").then(()=>$("connectionLabel").textContent="Aplicativo pronto para uso offline após o primeiro carregamento.")
      .catch(()=>$("connectionLabel").textContent="Não foi possível ativar o modo offline neste endereço.");
  }else if(location.protocol==="file:")$("connectionLabel").textContent="Use Live Server ou GitHub Pages para testar instalação e modo offline.";
  document.documentElement.style.setProperty("--reader-size",state.font+"px");
  setTimeout(()=>{$("launchSplash")?.classList.add("hide")},1050);
}
document.addEventListener("DOMContentLoaded",init);
