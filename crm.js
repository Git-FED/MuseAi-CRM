(() => {
  const KEY = 'muse-crm-data-v1';
  const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const today = new Date().toISOString().slice(0, 10);
  const seed = {
    contacts: [
      { id:'c_rhea', name:'Rhea Studio', person:'Rhea Morgan', email:'hello@rheastudio.co', phone:'', company:'Rhea Studio', stage:'Proposal', value:12800, status:'hot', tags:['design','proposal'], note:'Opened the proposal four times. Follow up with the revised scope.', createdAt:'2026-09-08', updatedAt:'2026-09-14' },
      { id:'c_northstar', name:'Northstar Labs', person:'Maya Chen', email:'maya@northstarlabs.io', phone:'', company:'Northstar Labs', stage:'Qualified', value:7200, status:'quiet', tags:['saas'], note:'Muse drafted a nudge after 11 days without a reply.', createdAt:'2026-08-22', updatedAt:'2026-09-13' },
      { id:'c_field', name:'Field Notes Co.', person:'Jon Bell', email:'jon@fieldnotes.co', phone:'', company:'Field Notes Co.', stage:'New', value:2400, status:'active', tags:['referral'], note:'New referral. Needs a discovery call.', createdAt:'2026-09-12', updatedAt:'2026-09-12' }
    ],
    deals: [
      { id:'d_rhea', contactId:'c_rhea', title:'Rhea Studio — brand system', amount:12800, stage:'Proposal', due:'2026-09-20', status:'open', note:'Revised scope sent.' },
      { id:'d_northstar', contactId:'c_northstar', title:'Northstar Labs — product sprint', amount:7200, stage:'Qualified', due:'2026-09-24', status:'open', note:'Waiting for technical review.' }
    ],
    transactions: [
      { id:'t_1', type:'income', title:'Stripe payout', amount:1280, date:'2026-09-14', category:'Income', note:'Receipt matched.' },
      { id:'t_2', type:'expense', title:'Figma subscription', amount:180, date:'2026-09-12', category:'Software', note:'Monthly software.' }
    ],
    tasks: [
      { id:'task_1', title:'Follow up with Rhea Studio', contactId:'c_rhea', due:'2026-09-16', priority:'high', done:false },
      { id:'task_2', title:'Approve Northstar nudge', contactId:'c_northstar', due:'2026-09-17', priority:'normal', done:false }
    ],
    notes: [],
    activity: [{ id:'a_1', text:'Workspace initialized with sample records', date:today }]
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
    const render=()=>{const d=get(); const open=d.deals.filter(x=>x.status==='open'); const outstanding=d.transactions.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0); const hot=d.contacts.filter(x=>x.status==='hot').length; const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value}; set('crmContactCount',d.contacts.length);set('crmHotCount',hot);set('crmPipelineValue',money(open.reduce((s,x)=>s+x.amount,0)));set('crmExpenseValue',money(outstanding));set('crmTaskCount',d.tasks.filter(x=>!x.done).length); const navCount=qs('[data-nav-contacts]');if(navCount)navCount.textContent=d.contacts.length; const list=qs('[data-live-queue]');if(list)list.innerHTML=d.tasks.filter(x=>!x.done).slice(0,4).map(t=>{const c=d.contacts.find(x=>x.id===t.contactId);return `<div class="queue-item"><div class="queue-mark ${t.priority==='high'?'amber':''}">↗</div><div class="queue-content"><div class="queue-title"><b>${esc(t.title)}</b><span class="tag ${t.priority==='high'?'review-tag':'hot-tag'}">${esc(t.priority.toUpperCase())}</span></div><p>${c?esc(c.name):'No contact linked'} · due ${esc(t.due||'later')}</p></div><button class="row-action" data-complete-task="${t.id}">Done <span>✓</span></button></div>`}).join('')||'<p class="empty-state">No open tasks. Capture the next signal.</p>';}; render(); window.addEventListener('muse:data-changed',render); document.addEventListener('click',e=>{const id=e.target.closest('[data-complete-task]')?.dataset.completeTask;if(id){MuseCRM.update('tasks',id,{done:true});MuseCRM.toast('Task completed')}});
  }
  function wireGlobal() { document.addEventListener('click',e=>{const action=e.target.closest('[data-crm-action]')?.dataset.crmAction;if(action==='export')exportData();if(action==='reset'&&confirm('Reset local CRM data to the sample workspace?'))reset();}); }
  dashboard(); wireGlobal();
})();
