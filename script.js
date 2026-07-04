// ----- DATA DUMMY (MOCK API) -----
const db = {
  PLN: {"123456789012":{nama:"Budi Santoso",detail:"Tagihan Juli 2026",pokok:250000,denda:0},"112233445566":{nama:"Ani Marlina",detail:"Tagihan Juli 2026",pokok:125000,denda:10000},"998877665544":{nama:"Toko Makmur",detail:"Tagihan Juli 2026",pokok:890000,denda:0}},
  PDAM: {"987654321012":{nama:"Andi Saputra",detail:"Pemakaian 25m3",pokok:85000,denda:0},"223344556677":{nama:"Rini Wati",detail:"Pemakaian 15m3",pokok:45000,denda:0}},
  Internet: {"192837465012":{nama:"IndiHome 30Mbps",detail:"Bulan Berjalan",pokok:315000,denda:0},"123123123123":{nama:"Biznet Home",detail:"Bulan Berjalan",pokok:350000,denda:0}},
  Seminar: {"SEM-WEB-001":{nama:"Webinar Web Dev",detail:"Tiket Reguler",pokok:75000,denda:0},"SEM-AI-002":{nama:"AI Conference",detail:"Tiket VIP",pokok:250000,denda:0}},
  SPP: {
    "221011450504":{nama:"Bryan Pratama",prodi:"Teknik Informatika",tagihan:[{id:"C1",desc:"SPP Sem Ganjil - Cicil 1",amount:1500000,lunas:true},{id:"C2",desc:"SPP Sem Ganjil - Cicil 2",amount:1500000,lunas:false},{id:"C3",desc:"SPP Sem Ganjil - Cicil 3",amount:1500000,lunas:false},{id:"C4",desc:"SPP Sem Ganjil - Cicil 4",amount:1500000,lunas:false}]},
    "221011450505":{nama:"Bunga Citra",prodi:"Sistem Informasi",tagihan:[{id:"C1",desc:"SPP Sem Ganjil - Cicil 1",amount:1200000,lunas:false},{id:"C2",desc:"SPP Sem Ganjil - Cicil 2",amount:1200000,lunas:false},{id:"C3",desc:"SPP Sem Ganjil - Cicil 3",amount:1200000,lunas:false},{id:"C4",desc:"SPP Sem Ganjil - Cicil 4",amount:1200000,lunas:false}]}
  },
  Provider: [
    {prefix:['0811','0812','0813','0821','0822','0823','0852','0853'],name:'Telkomsel'},
    {prefix:['0814','0815','0816','0855','0856','0857','0858'],name:'Indosat'},
    {prefix:['0817','0818','0819','0859','0877','0878'],name:'XL Axiata'},
    {prefix:['0895','0896','0897','0898','0899'],name:'Tri'},
    {prefix:['0881','0882','0883','0884','0885','0886','0887','0888','0889'],name:'Smartfren'},
    {prefix:['0831','0832','0833','0838'],name:'Axis'}
  ]
};

let state = { isLoggedIn: false, balance: 0, history: [], tempTx: null, darkMode: false };

function loadState() {
  const saved = localStorage.getItem('brystore_state_v3');
  if(saved) try { const p = JSON.parse(saved); state = {...state, ...p}; } catch(e){}
  applyDarkMode(); updateUIAuth();
}
function saveState() {
  localStorage.setItem('brystore_state_v3', JSON.stringify({ isLoggedIn: state.isLoggedIn, balance: state.balance, history: state.history, darkMode: state.darkMode }));
}

const formatRp = (angka) => 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const getEl = (id) => document.getElementById(id);
function showToast(msg, type='success') {
  const container = getEl('toast-container');
  const toast = document.createElement('div'); toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':'exclamation-triangle'}"></i> <span>${msg}</span>`;
  container.appendChild(toast); setTimeout(() => toast.remove(), 3500);
}
function toggleLoader(id, show) {
  const loader = getEl(id);
  if(show) { loader.classList.add('active'); loader.previousElementSibling.style.display='none'; }
  else { loader.classList.remove('active'); loader.previousElementSibling.style.display='inline-flex'; }
}

function switchScreen(targetId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  getEl(targetId).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const nav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
  if(nav) nav.classList.add('active');
  window.scrollTo(0,0);
}
document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', ()=> switchScreen(item.getAttribute('data-target'))));

function updateUIAuth() {
  if(state.isLoggedIn) {
    getEl('main-header').style.display='flex'; getEl('main-nav').style.display='flex';
    getEl('dash-balance').innerText = formatRp(state.balance); renderHistory(); switchScreen('screen-dashboard');
  } else {
    getEl('main-header').style.display='none'; getEl('main-nav').style.display='none'; switchScreen('screen-login');
  }
}

function setupSelectionGroup(sel) {
  document.querySelectorAll(sel).forEach(item => item.addEventListener('click', function() {
    document.querySelectorAll(sel).forEach(i => i.classList.remove('selected','active'));
    this.classList.add(this.classList.contains('pm-item')?'selected':'active');
    const radio = this.querySelector('input[type="radio"]'); if(radio) radio.checked = true;
  }));
}
setupSelectionGroup('#pm-tagihan .pm-item'); setupSelectionGroup('#pm-spp .pm-item'); setupSelectionGroup('#pm-topup .pm-item');

function applyDarkMode() {
  const app = document.getElementById('app-container');
  if(state.darkMode) { app.classList.add('dark-mode'); getEl('dark-toggle').innerHTML='<i class="fas fa-sun"></i>'; }
  else { app.classList.remove('dark-mode'); getEl('dark-toggle').innerHTML='<i class="fas fa-moon"></i>'; }
}
getEl('dark-toggle').addEventListener('click', ()=>{ state.darkMode = !state.darkMode; applyDarkMode(); saveState(); });

getEl('btn-do-login').addEventListener('click', ()=>{
  if(getEl('login-id').value==='admin' && getEl('login-pin').value==='123456') { state.isLoggedIn=true; saveState(); updateUIAuth(); showToast('Login berhasil!'); }
  else showToast('Username/PIN salah.', 'error');
});
getEl('btn-logout').addEventListener('click', ()=>{ state.isLoggedIn=false; saveState(); updateUIAuth(); });

// ----- TOP UP -----
function navToTopup() {
  getEl('input-topup-custom').style.display='none'; getEl('input-topup-custom').value='';
  document.querySelectorAll('#topup-nominals .nom-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector('#topup-nominals .nom-btn[data-val="50000"]').classList.add('active');
  state.tempTx = { nominal: 50000 }; switchScreen('screen-topup');
}
document.querySelectorAll('#topup-nominals .nom-btn').forEach(btn=>btn.addEventListener('click', function(){
  document.querySelectorAll('#topup-nominals .nom-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');
  if(this.dataset.val==='custom') { getEl('input-topup-custom').style.display='block'; state.tempTx.nominal=0; }
  else { getEl('input-topup-custom').style.display='none'; state.tempTx.nominal=parseInt(this.dataset.val); }
}));
getEl('input-topup-custom').addEventListener('input', e=> state.tempTx.nominal = parseInt(e.target.value)||0);
getEl('btn-do-topup').addEventListener('click', ()=>{
  if(state.tempTx.nominal<10000) { showToast('Minimal Top Up Rp 10.000','error'); return; }
  const method = document.querySelector('input[name="val_pm_topup"]:checked').value;
  state.tempTx.tipe='Top Up Saldo'; state.tempTx.deskripsi=`Pengisian via ${method}`; state.tempTx.metode=method;
  openPaymentModal(method, state.tempTx);
});

// ----- TAGIHAN -----
let currentKategori = 'PLN';
function navToTagihan(kat) {
  currentKategori=kat; getEl('title-tagihan').innerText=`Tagihan ${kat}`;
  getEl('label-tagihan-input').innerText= kat==='Seminar'?'Kode Booking Tiket':`Nomor Pelanggan ${kat}`;
  getEl('input-tagihan-id').value=''; getEl('result-tagihan').style.display='none'; getEl('err-tagihan').style.display='none';
  switchScreen('screen-tagihan');
}
getEl('btn-cek-tagihan').addEventListener('click', ()=>{
  const id = getEl('input-tagihan-id').value.trim();
  const valid = currentKategori==='Seminar'? /^[A-Z0-9-]+$/.test(id) : /^[0-9]{8,12}$/.test(id);
  if(!valid) { getEl('err-tagihan').style.display='block'; return; }
  getEl('err-tagihan').style.display='none'; getEl('result-tagihan').style.display='none';
  toggleLoader('load-tagihan', true);
  setTimeout(()=>{
    toggleLoader('load-tagihan', false);
    const data = db[currentKategori][id];
    if(data) {
      const total = data.pokok+data.denda;
      getEl('res-tagihan-nama').innerText=data.nama; getEl('res-tagihan-detail').innerText=data.detail;
      getEl('res-tagihan-total').innerText=formatRp(total); getEl('result-tagihan').style.display='block';
      state.tempTx = { tipe:`Tagihan ${currentKategori}`, deskripsi:`${data.nama} - ${id}`, nominal:total };
    } else showToast('Nomor tidak terdaftar.','error');
  },1200);
});
getEl('btn-bayar-tagihan').addEventListener('click', ()=>{
  const method = document.querySelector('input[name="val_pm_tagihan"]:checked').value;
  state.tempTx.metode=method; openPaymentModal(method, state.tempTx);
});

// ----- SPP -----
function navToSpp() {
  getEl('input-spp-nim').value=''; getEl('result-spp').style.display='none'; getEl('err-spp').style.display='none';
  switchScreen('screen-spp');
}
getEl('btn-cek-spp').addEventListener('click', ()=>{
  const nim = getEl('input-spp-nim').value.trim();
  if(!/^[0-9]{12}$/.test(nim)) { getEl('err-spp').style.display='block'; return; }
  getEl('err-spp').style.display='none'; getEl('result-spp').style.display='none';
  toggleLoader('load-spp', true);
  setTimeout(()=>{
    toggleLoader('load-spp', false);
    const data = db.SPP[nim];
    if(data) {
      getEl('res-spp-nama').innerHTML = `${data.nama}<br><small style="font-weight:400; color: var(--text-muted);">${data.prodi}</small>`;
      getEl('res-spp-nimval').innerText = nim;
      const listContainer = getEl('spp-list-container'); listContainer.innerHTML='';
      data.tagihan.forEach((item, idx)=>{
        listContainer.innerHTML += `<label class="spp-item ${item.lunas?'paid':''}">
          <input type="checkbox" class="cb-spp" data-idx="${idx}" data-amount="${item.amount}" ${item.lunas?'checked disabled':''}>
          <div style="flex:1;"><div style="font-size:0.9rem; font-weight:700;">${item.desc}</div><div style="font-size:0.75rem; color:${item.lunas?'var(--primary)':'var(--text-muted)'}; font-weight:700;">${item.lunas?'SUDAH LUNAS':'Belum Lunas'}</div></div>
          <div class="font-bold text-primary">${formatRp(item.amount)}</div></label>`;
      });
      document.querySelectorAll('.cb-spp:not([disabled])').forEach(cb=>cb.addEventListener('change', hitungTotalSPP));
      hitungTotalSPP(); getEl('result-spp').style.display='block';
    } else showToast('NIM tidak ditemukan.','error');
  },1200);
});
function hitungTotalSPP() {
  let total=0, selected=[];
  document.querySelectorAll('.cb-spp:not([disabled]):checked').forEach(cb=>{ total+=parseInt(cb.dataset.amount); selected.push(cb.dataset.idx); });
  getEl('res-spp-total').innerText=formatRp(total); getEl('btn-bayar-spp').disabled = total===0;
  state.tempTx = { tipe:'Pembayaran SPP', deskripsi:`NIM: ${getEl('input-spp-nim').value} (${selected.length} Cicilan)`, nominal:total, nimRef:getEl('input-spp-nim').value, selectedIdx:selected };
}
getEl('btn-bayar-spp').addEventListener('click', ()=>{
  const method = document.querySelector('input[name="val_pm_spp"]:checked').value;
  state.tempTx.metode=method; openPaymentModal(method, state.tempTx);
});

// ----- PULSA -----
function navToPulsa() {
  getEl('input-pulsa-hp').value=''; getEl('provider-info').style.display='none';
  getEl('input-pulsa-custom').style.display='none'; document.querySelectorAll('#pulsa-nominals .nom-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector('#pulsa-nominals .nom-btn[data-val="10000"]').classList.add('active');
  state.tempTx = { nominal:10000 }; switchScreen('screen-pulsa');
}
getEl('input-pulsa-hp').addEventListener('input', e=>{
  const val=e.target.value; const provDiv=getEl('provider-info');
  if(val.length>=4) { const found=db.Provider.find(p=>p.prefix.includes(val.substring(0,4))); if(found){provDiv.style.display='flex'; getEl('provider-name').innerText=found.name;} else provDiv.style.display='none'; }
  else provDiv.style.display='none';
});
document.querySelectorAll('#pulsa-nominals .nom-btn').forEach(btn=>btn.addEventListener('click', function(){
  document.querySelectorAll('#pulsa-nominals .nom-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');
  if(this.dataset.val==='custom') { getEl('input-pulsa-custom').style.display='block'; state.tempTx.nominal=0; }
  else { getEl('input-pulsa-custom').style.display='none'; state.tempTx.nominal=parseInt(this.dataset.val); }
}));
getEl('input-pulsa-custom').addEventListener('input', e=> state.tempTx.nominal = parseInt(e.target.value)||0);
getEl('btn-bayar-pulsa').addEventListener('click', ()=>{
  const hp = getEl('input-pulsa-hp').value.trim();
  if(!/^08[0-9]{8,11}$/.test(hp)) { getEl('err-pulsa').style.display='block'; return; }
  getEl('err-pulsa').style.display='none';
  if(getEl('provider-info').style.display==='none') { showToast('Provider tidak dikenali.','error'); return; }
  if(state.tempTx.nominal<5000) { showToast('Minimal Rp 5.000','error'); return; }
  const method = getEl('pm-pulsa-select').value;
  state.tempTx.tipe='Isi Pulsa'; state.tempTx.deskripsi=`${getEl('provider-name').innerText} - ${hp}`; state.tempTx.metode=method;
  openPaymentModal(method, state.tempTx);
});

// ----- MODAL PEMBAYARAN & STRUK -----
let qrisTimer=null, qrCodeObj=null;
function openPaymentModal(method, txData) {
  if(method==='Saldo' && state.balance < txData.nominal) { showToast('Saldo tidak cukup!','error'); return; }
  const modal = getEl('modal-payment');
  getEl('modal-instruction').style.display='block'; getEl('modal-receipt').style.display='none';
  getEl('qrcode-box').style.display='none'; getEl('instruction-text').style.display='none';
  getEl('countdown-timer').innerText=''; clearInterval(qrisTimer); getEl('spin-bayar').style.display='none';
  getEl('btn-konfirmasi-bayar').disabled=false;

  if(method==='Saldo') { getEl('instruction-text').style.display='block'; getEl('instruction-text').innerHTML=`Potong Saldo BryStore<br><span style="font-size:1.6rem; color:var(--primary);">${formatRp(txData.nominal)}</span>`; }
  else if(method==='VA') { getEl('instruction-text').style.display='block'; const va='8801 '+Math.floor(1000+Math.random()*9000)+' '+Math.floor(1000+Math.random()*9000); getEl('instruction-text').innerHTML=`Transfer VA<br><span style="font-size:1.6rem; color:var(--primary);">${va}</span>`; }
  else if(method==='QRIS') {
    getEl('qrcode-box').style.display='flex'; getEl('qrcode-box').innerHTML='';
    qrCodeObj = new QRCode(getEl('qrcode-box'), { text:`QRIS-BRYSTORE-${Date.now()}-${txData.nominal}`, width:180, height:180, colorDark:"#0f766e", colorLight:"#ffffff" });
    let time=300; qrisTimer=setInterval(()=>{ let m=Math.floor(time/60), s=time%60; getEl('countdown-timer').innerText=`Sisa Waktu: ${m}:${s<10?'0'+s:s}`; time--; if(time<0){clearInterval(qrisTimer); getEl('countdown-timer').innerText='Waktu Habis!'; getEl('btn-konfirmasi-bayar').disabled=true;} },1000);
  } else if(method==='Teller') { getEl('instruction-text').style.display='block'; const ref='BRY'+Math.floor(100000+Math.random()*900000); getEl('instruction-text').innerHTML=`Tunjukkan Kode<br><span style="font-size:1.6rem; color:var(--primary);">${ref}</span>`; }
  modal.classList.add('show');
}

getEl('btn-konfirmasi-bayar').addEventListener('click', ()=>{
  const tx=state.tempTx; clearInterval(qrisTimer); getEl('spin-bayar').style.display='inline-block'; getEl('btn-konfirmasi-bayar').disabled=true;
  setTimeout(()=>{
    try {
      if(tx.tipe==='Top Up Saldo') state.balance += tx.nominal;
      else if(tx.metode==='Saldo') state.balance -= tx.nominal;
      if(tx.tipe==='Pembayaran SPP' && Array.isArray(tx.selectedIdx)) tx.selectedIdx.forEach(idx=> db.SPP[tx.nimRef].tagihan[idx].lunas=true);
      const now = new Date();
      const newHistory = { id:'BRY-'+now.getTime().toString().slice(-6), tanggal:now.toLocaleString('id-ID'), tipe:tx.tipe, deskripsi:tx.deskripsi, nominal:tx.nominal, status:'Sukses' };
      state.history.unshift(newHistory); saveState();
      getEl('modal-instruction').style.display='none';
      
      getEl('receipt-content').innerHTML = `
        <div style="border-bottom:2px dashed var(--border-light); padding-bottom:12px; margin-bottom:12px;">
          <div style="font-size:1.4rem; font-weight:800; color:var(--primary); text-align:center;">BryStore</div>
          <div class="text-muted" style="text-align:center;">Bukti Transaksi Digital</div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>No. Ref</span><span class="font-bold">${newHistory.id}</span></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Metode</span><span class="font-bold">${tx.metode}</span></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Layanan</span><span class="font-bold">${newHistory.tipe}</span></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:16px;"><span>Detail</span><span class="font-bold" style="text-align:right; max-width:60%;">${newHistory.deskripsi}</span></div>
        <div style="display:flex; justify-content:space-between; border-top:2px dashed var(--border-light); padding-top:12px; font-weight:800; font-size:1.2rem; color:var(--primary);">
          <span>Total Bayar</span><span>${formatRp(newHistory.nominal)}</span>
        </div>`;
      getEl('modal-receipt').style.display='block';
      getEl('dash-balance').innerText = formatRp(state.balance); renderHistory();
    } catch(e) { console.error(e); getEl('spin-bayar').style.display='none'; getEl('btn-konfirmasi-bayar').disabled=false; showToast('Terjadi kesalahan.','error'); }
  },1500);
});

function closeModal() { getEl('modal-payment').classList.remove('show'); clearInterval(qrisTimer); }
function resetForms() {
  getEl('input-tagihan-id').value=''; getEl('result-tagihan').style.display='none';
  getEl('input-spp-nim').value=''; getEl('result-spp').style.display='none';
  getEl('input-pulsa-hp').value=''; getEl('provider-info').style.display='none'; getEl('input-topup-custom').value='';
  switchScreen('screen-dashboard');
}

function renderHistory(filter='all') {
  const tbody = getEl('history-tbody'); tbody.innerHTML='';
  let filtered = state.history;
  if(filter!=='all') filtered = state.history.filter(h=>h.tipe.includes(filter));
  if(filtered.length===0) { tbody.innerHTML='<tr><td colspan="4" class="text-center text-muted p-4">Belum ada histori.</td></tr>'; return; }
  filtered.forEach(h=>{
    const isTopUp = h.tipe==='Top Up Saldo';
    tbody.innerHTML += `<tr>
      <td style="font-size:0.75rem; color:var(--text-muted);">${h.tanggal.split(' ')[0]}<br>${h.tanggal.split(' ')[1]}</td>
      <td><div class="font-bold">${h.tipe}</div><div style="font-size:0.75rem; color:var(--text-muted); max-width:130px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${h.deskripsi}</div></td>
      <td class="font-bold" style="color:${isTopUp?'var(--primary)':'var(--text-primary)'};">${isTopUp?'+':'-'} ${formatRp(h.nominal)}</td>
      <td><span class="badge badge-success">${h.status}</span></td></tr>`;
  });
}

getEl('filter-riwayat').addEventListener('change', e=> renderHistory(e.target.value));
getEl('btn-clear-history').addEventListener('click', ()=>{ if(confirm('Hapus semua riwayat?')) { state.history=[]; saveState(); renderHistory(); showToast('Riwayat dibersihkan.'); } });

loadState();
