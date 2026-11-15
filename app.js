const canvas = document.querySelector('#signal-field');
const ctx = canvas.getContext('2d');
let width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let t = 0;

function resize(){
  width = window.innerWidth; height = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width*dpr; canvas.height = height*dpr; canvas.style.width = width+'px'; canvas.style.height = height+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize', resize); resize();

const particles = Array.from({length: 75}, (_, i) => ({
  x: Math.random()*1600, y: Math.random()*1000, speed: .13+Math.random()*.42,
  size: .4+Math.random()*1.8, alpha: .15+Math.random()*.5, phase: Math.random()*Math.PI*2,
  tint: i%5===0 ? '102,226,230' : i%7===0 ? '169,148,255' : '200,255,90'
}));
function ribbon(y, amp, len, color, speed, offset){
  ctx.beginPath();
  for(let x=-30;x<=width+30;x+=12){
    const yy = y + Math.sin(x/len + t*speed + offset)*amp + Math.sin(x/83 - t*.11 + offset)*amp*.32;
    x===-30 ? ctx.moveTo(x,yy) : ctx.lineTo(x,yy);
  }
  ctx.strokeStyle=color; ctx.lineWidth=1; ctx.globalAlpha=.28; ctx.stroke();
  ctx.globalAlpha=.07; ctx.lineWidth=7; ctx.stroke(); ctx.globalAlpha=1;
}
function frame(){
  ctx.clearRect(0,0,width,height);
  const bg = ctx.createRadialGradient(width*.72,height*.2,0,width*.72,height*.2,Math.max(width,height)*.8);
  bg.addColorStop(0,'rgba(29,54,67,.23)'); bg.addColorStop(.42,'rgba(12,25,36,.12)'); bg.addColorStop(1,'rgba(4,7,12,0)');
  ctx.fillStyle=bg; ctx.fillRect(0,0,width,height);
  // Layered flowing ribbons: a signal stream, never a ring/orbit.
  ribbon(height*.22, 26, 210, 'rgba(102,226,230,.9)', .23, 0.5);
  ribbon(height*.34, 42, 290, 'rgba(200,255,90,.75)', -.17, 2.2);
  ribbon(height*.58, 54, 360, 'rgba(169,148,255,.65)', .14, 4.1);
  ribbon(height*.76, 31, 230, 'rgba(102,226,230,.55)', -.21, 1.7);
  // Sparse drifting signal particles.
  particles.forEach(p=>{
    p.x -= p.speed; p.y += Math.sin(t*.35+p.phase)*.12;
    if(p.x < -10) {p.x=width+10; p.y=Math.random()*height}
    const a=p.alpha*(.75+.25*Math.sin(t*.8+p.phase));
    ctx.fillStyle=`rgba(${p.tint},${a})`; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
    if(p.size>1.6){ctx.strokeStyle=`rgba(${p.tint},${a*.22})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-18,p.y+3);ctx.stroke()}
  });
  // A few horizontal scan traces create depth without looking orbital.
  ctx.globalAlpha=.16; for(let y=0;y<height;y+=70){let x=(t*18+y*1.7)%(width+160)-80;ctx.fillStyle='#c8ff5a';ctx.fillRect(x,y,42,1)} ctx.globalAlpha=1;
  t += reduceMotion.matches ? .002 : .008;
  requestAnimationFrame(frame);
}
frame();

// Build 02 uses real HTML routes rather than placeholder click-toasts.
// Keep this file focused on the animated signal field so every link remains a normal static-page navigation.
