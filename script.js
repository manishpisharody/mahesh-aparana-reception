const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const intro=$("#intro"), body=document.body, music=$("#music"), musicBtn=$("#musicToggle"), toast=$("#toast");
window.addEventListener("load",()=>setTimeout(()=>$(".loader")?.remove(),1800));

// Decorative petals are generated once to keep animation lightweight.
const petals=$(".petals");
for(let i=0;i<16;i++){const p=document.createElement("span");p.style.setProperty("--x",`${Math.random()*100}%`);p.style.setProperty("--d",`${9+Math.random()*10}s`);p.style.setProperty("--delay",`${-Math.random()*15}s`);petals.append(p)}

function notify(message){toast.textContent=message;toast.classList.add("show");clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove("show"),2200)}
async function tryMusic(){
  if(!music.src){
    try{
      const response=await fetch(music.dataset.src,{method:"HEAD"});
      if(!response.ok)throw new Error("missing");
      music.src=music.dataset.src;
    }catch{notify("Add wedding-music.mp3 to assets/music to enable music.");return}
  }
  music.volume=.28;
  try{await music.play();musicBtn.classList.add("playing");musicBtn.setAttribute("aria-label","Pause background music")}
  catch{musicBtn.classList.remove("playing");notify("Add wedding-music.mp3 to assets/music to enable music.")}
}
function openInvitation(){
  intro.classList.add("opening");body.classList.remove("intro-open");
  setTimeout(()=>{intro.classList.add("hidden");$("#home").scrollIntoView()},1200);tryMusic()
}
$("#openInvitation").addEventListener("click",openInvitation);
$("#replay").addEventListener("click",()=>{intro.classList.remove("hidden","opening");body.classList.add("intro-open");window.scrollTo({top:0});});
music.addEventListener("error",()=>musicBtn.classList.add("unavailable"));
musicBtn.addEventListener("click",async()=>{if(music.paused)tryMusic();else{music.pause();musicBtn.classList.remove("playing");musicBtn.setAttribute("aria-label","Play background music")}});

const header=$("#siteHeader"), menu=$(".menu-toggle");
window.addEventListener("scroll",()=>header.classList.toggle("scrolled",scrollY>40),{passive:true});
menu.addEventListener("click",()=>{const open=header.classList.toggle("menu-open");menu.setAttribute("aria-expanded",open)});
$$("nav a").forEach(a=>a.addEventListener("click",()=>{header.classList.remove("menu-open");menu.setAttribute("aria-expanded","false")}));

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target)}}),{threshold:.12});
$$(".reveal").forEach(el=>observer.observe(el));

// 28 August 2026, 17:30 IST is 12:00 UTC.
const weddingTime=Date.UTC(2026,7,28,12,0,0);
function updateCountdown(){
  const remaining=weddingTime-Date.now();
  if(remaining<=0){$(".countdown-grid").hidden=true;$("#countdownMessage").textContent="Our Celebration Has Begun!";return}
  const units=[864e5,36e5,6e4,1e3],ids=["days","hours","minutes","seconds"];let rest=remaining;
  units.forEach((unit,i)=>{const value=Math.floor(rest/unit);rest%=unit;$("#"+ids[i]).textContent=String(value).padStart(2,"0")})
}
updateCountdown();setInterval(updateCountdown,1000);

function addCalendar(){
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Mahesh and Aparna//Wedding//EN","BEGIN:VEVENT","UID:mahesh-aparna-20260828@example.com","DTSTAMP:20260725T000000Z","DTSTART:20260828T120000Z","DTEND:20260828T153000Z","SUMMARY:Mahesh & Aparna Wedding Reception","LOCATION:PCK Auditorium\\, Vellangallur\\, Vadakkumkara","DESCRIPTION:Wedding reception of Mahesh and Aparna.","END:VEVENT","END:VCALENDAR"].join("\r\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));a.download="mahesh-aparna-wedding.ics";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)
}
$$(".calendarBtn").forEach(b=>b.addEventListener("click",addCalendar));

const galleryImages=$$(".gallery-item img").map(img=>({src:img.src,alt:img.alt})), lightbox=$("#lightbox"), lightboxImage=$("img",lightbox);let current=0,touchX=0;
function showImage(index){current=(index+galleryImages.length)%galleryImages.length;lightboxImage.src=galleryImages[current].src;lightboxImage.alt=galleryImages[current].alt}
$$(".gallery-item").forEach((b,i)=>b.addEventListener("click",()=>{showImage(i);lightbox.showModal()}));
$(".lightbox-close").onclick=()=>lightbox.close();$(".lightbox-prev").onclick=()=>showImage(current-1);$(".lightbox-next").onclick=()=>showImage(current+1);
lightbox.addEventListener("click",e=>{if(e.target===lightbox)lightbox.close()});lightbox.addEventListener("touchstart",e=>touchX=e.changedTouches[0].clientX,{passive:true});lightbox.addEventListener("touchend",e=>{const d=e.changedTouches[0].clientX-touchX;if(Math.abs(d)>50)showImage(current+(d<0?1:-1))},{passive:true});
document.addEventListener("keydown",e=>{if(!lightbox.open)return;if(e.key==="ArrowLeft")showImage(current-1);if(e.key==="ArrowRight")showImage(current+1)});

const shareMenu=$("#shareMenu"),shareText="With immense happiness, we invite you to celebrate the wedding reception of Mahesh and Aparna on Friday, 28 August 2026, at PCK Auditorium, Vellangallur. Your presence and blessings mean a lot to us.";
$("#shareToggle").onclick=()=>shareMenu.classList.toggle("open");
$("#whatsappShare").href=`https://wa.me/?text=${encodeURIComponent(shareText+" "+location.href)}`;
$("#copyLink").onclick=async()=>{await navigator.clipboard.writeText(location.href);shareMenu.classList.remove("open");notify("Invitation link copied")};
$("#nativeShare").onclick=async()=>{if(navigator.share)await navigator.share({title:"Mahesh & Aparna",text:shareText,url:location.href});else notify("Use WhatsApp or copy the invitation link.")};
document.addEventListener("click",e=>{if(!e.target.closest(".floating-controls"))shareMenu.classList.remove("open")});

if(matchMedia("(pointer:fine)").matches){const card=$("#tiltCard");card.addEventListener("mousemove",e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1100px) rotateX(${-y*2}deg) rotateY(${x*2}deg)`});card.addEventListener("mouseleave",()=>card.style.transform="")}
