(() => {
  const KEY = 'muse-crm-universal-template-v2';
  const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const today = new Date().toISOString().slice(0, 10);
  const seed = {
    contacts: [],
    deals: [],
    transactions: [],
    tasks: [],
    notes: [],
    activity: []
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  function get() { try { const saved = JSON.parse(localStorage.getItem(KEY)); return saved ? { ...clone(seed), ...saved } : clone(seed); } catch { return clone(seed); } }
  function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); window.dispatchEvent(new CustomEvent('muse:data-changed')); return data; }
  function add(collection, record) { const data=get(); const item={id:uid(collection.slice(0,-1)), createdAt:today, updatedAt:today, ...record}; data[collection].unshift(item); data.activity.unshift({id:uid('activity'),text:`Added ${item.name||item.title||'a record'}`,date:today}); save(data); return item; }
  function update(collection,id,changes) { const data=get(); const index=data[collection].findIndex(x=>x.id===id); if(index<0)return null; data[collection][index]={...data[collection][index],...changes,updatedAt:today}; save(data); return data[collection][index]; }
  function remove(collection,id) { const data=get(); data[collection]=data[collection].filter(x=>x.id!==id); save(data); }
  function reset() { localStorage.removeItem(KEY); location.reload(); }
  function exportData() { const blob=new Blob([JSON.stringify(get(),null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`muse-crm-export-${today}.json`; a.click(); URL.revokeObjectURL(a.href); }
  function importData(file) { return file.text().then(text=>{ const incoming=JSON.parse(text); if(!incoming.contacts||!incoming.deals) throw Error('This file is not a Muse CRM export.'); save({...clone(seed),...incoming}); location.reload(); }); }
  const esc = value => String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(value)||0);
  const qs = selector => document.querySelector(selector);
  function toast(text) { let el=qs('.crm-toast'); if(!el){el=document.createElement('div');el.className='crm-toast';document.body.appendChild(el)} el.textContent=text;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2400); }
  window.MuseCRM={KEY,get,save,add,update,remove,reset,exportData,importData,esc,money,qs,toast,today};

  function dashboard() {
    if(!qs('[data-crm-dashboard]')) return;
    const render=()=>{const d=get(); const open=d.deals.filter(x=>x.status==='open'); const outstanding=d.transactions.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0); const hot=d.contacts.filter(x=>x.status==='hot').length; const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value}; set('crmContactCount',d.contacts.length);set('crmHotCount',hot);set('crmPipelineValue',money(open.reduce((s,x)=>s+x.amount,0)));set('crmExpenseValue',money(outstanding));set('crmTaskCount',d.tasks.filter(x=>!x.done).length); const navCount=qs('[data-nav-contacts]');if(navCount)navCount.textContent=d.contacts.length; const list=qs('[data-live-queue]');if(list)list.innerHTML=d.tasks.filter(x=>!x.done).slice(0,4).map(t=>{const c=d.contacts.find(x=>x.id===t.contactId);return `<div class="queue-item"><div class="queue-mark ${t.priority==='high'?'amber':''}">↗</div><div class="queue-content"><div class="queue-title"><b>${esc(t.title)}</b><span class="tag ${t.priority==='high'?'review-tag':'hot-tag'}">${esc(t.priority.toUpperCase())}</span></div><p>${c?esc(c.name):'No contact linked'} · due ${esc(t.due||'later')}</p></div><button class="row-action" data-complete-task="${t.id}">Done <span>✓</span></button></div>`}).join('')||'<p class="empty-state">Your workspace is ready. Capture your first contact or task.</p>';}; render(); window.addEventListener('muse:data-changed',render); document.addEventListener('click',e=>{const id=e.target.closest('[data-complete-task]')?.dataset.completeTask;if(id){MuseCRM.update('tasks',id,{done:true});MuseCRM.toast('Task completed')}});
  }
  function wireGlobal() { document.addEventListener('click',e=>{const action=e.target.closest('[data-crm-action]')?.dataset.crmAction;if(action==='export')exportData();if(action==='reset'&&confirm('Reset this browser to an empty workspace?'))reset();}); }
  dashboard(); wireGlobal();
})();
