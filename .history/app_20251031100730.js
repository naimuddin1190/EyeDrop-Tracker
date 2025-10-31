/* app.js — সম্পূর্ণ বাংলা UI logic */
/* Features:
   - per-date schedule (select date top)
   - colored med badges
   - save completed items in localStorage keyed by date
   - progress bar
   - auto PDF download when progress reaches 100% (only once per date)
   - manual PDF export button
*/

const scheduleData = [
  ["8:00 AM", "Atrogen 1%", "১ম", "১ ফোঁটা", "atrogen"],
  ["8:05 AM", "Vigalon", "১ম", "১ ফোঁটা", "vigalon"],
  ["8:10 AM", "Neopred", "১ম", "১ ফোঁটা", "neopred"],
  ["8:15 AM", "Nevan Ts", "১ম", "১ ফোঁটা", "nevan"],
  ["9:30 AM", "Neopred", "২য়", "১ ফোঁটা", "neopred"],
  ["9:35 AM", "Vigalon", "২য়", "১ ফোঁটা", "vigalon"],
  ["11:00 AM", "Neopred", "৩য়", "১ ফোঁটা", "neopred"],
  ["11:05 AM", "Vigalon", "৩য়", "১ ফোঁটা", "vigalon"],
  ["12:30 PM", "Atrogen 1%", "২য়", "১ ফোঁটা", "atrogen"],
  ["12:35 PM", "Neopred", "৪র্থ", "১ ফোঁটা", "neopred"],
  ["12:40 PM", "Nevan Ts", "২য়", "১ ফোঁটা", "nevan"],
  ["12:45 PM", "Vigalon", "৪র্থ", "১ ফোঁটা", "vigalon"],
  ["2:30 PM", "Neopred", "৫ম", "১ ফোঁটা", "neopred"],
  ["2:35 PM", "Vigalon", "৫ম", "১ ফোঁটা", "vigalon"],
  ["4:30 PM", "Neopred", "৬ষ্ঠ", "১ ফোঁটা", "neopred"],
  ["4:35 PM", "Vigalon", "৬ষ্ঠ (শেষ)", "১ ফোঁটা", "vigalon"],
  ["6:00 PM", "Atrogen 1%", "৩য় (শেষ)", "১ ফোঁটা", "atrogen"],
  ["6:05 PM", "Neopred", "৭ম", "১ ফোঁটা", "neopred"],
  ["6:10 PM", "Nevan Ts", "৩য় (শেষ)", "১ ফোঁটা", "nevan"],
  ["7:30 PM", "Neopred", "৮ম", "১ ফোঁটা", "neopred"],
  ["8:30 PM", "Neopred", "৯ম", "১ ফোঁটা", "neopred"],
  ["9:30 PM", "Neopred", "১০ম (শেষ)", "১ ফোঁটা", "neopred"]
];

// element refs
const scheduleBody = document.getElementById('scheduleBody');
const completedList = document.getElementById('completedList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const viewDate = document.getElementById('viewDate');
const todayBtn = document.getElementById('todayBtn');
const liveTime = document.getElementById('liveTime');
const exportPdfBtn = document.getElementById('exportPdf');
const exportPdfManual = document.getElementById('exportPdfManual');
const clearAll = document.getElementById('clearAll');
const pdfContainer = document.getElementById('pdfContainer');

const TOTAL = scheduleData.length;

// init date picker to today
function isoToday(d = new Date()){
  return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);
}
viewDate.value = isoToday();

// live clock
function updateClock(){
  const now = new Date();
  const t = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
  const d = now.toLocaleDateString('bn-BD', {year:'numeric', month:'short', day:'numeric'});
  liveTime.textContent = `${d}  •  ${t}`;
}
setInterval(updateClock,1000);
updateClock();

// storage helpers (per date)
function keyFor(dateStr){ return 'eyedrop_'+dateStr; }
function exportedKey(dateStr){ return 'eyedrop_exported_'+dateStr; }

function loadDay(dateStr){
  const raw = localStorage.getItem(keyFor(dateStr));
  if(!raw){
    // initialize with not-taken flags
    const obj = scheduleData.map((row, idx)=>({
      idx,
      time: row[0],
      med: row[1],
      count: row[2],
      note: row[3],
      tag: row[4],
      taken: false,
      ts: null
    }));
    localStorage.setItem(keyFor(dateStr), JSON.stringify(obj));
    return obj;
  }
  return JSON.parse(raw);
}
function saveDay(dateStr, arr){
  localStorage.setItem(keyFor(dateStr), JSON.stringify(arr));
}

// render
function render(){
  const dateStr = viewDate.value;
  const day = loadDay(dateStr);
  scheduleBody.innerHTML = '';
  completedList.innerHTML = '';

  day.forEach(item => {
    const tr = document.createElement('tr');
    // left cells: time, med (with color)
    const medBadge = `<span class="med-badge ${medClass(item.tag)}">${item.med.split(' ')[0]}</span>`;
    tr.innerHTML = `
      <td>${item.time}</td>
      <td>${medBadge} <div style="font-weight:600;margin-top:6px">${item.med}</div></td>
      <td>${item.count}</td>
      <td>${item.note}</td>
      <td><button class="mark-btn ${item.taken ? 'done' : ''}" data-idx="${item.idx}">${item.taken ? '✅ সম্পন্ন' : '⬜ অপেক্ষমাণ'}</button></td>
    `;
    scheduleBody.appendChild(tr);

    if(item.taken){
      const li = document.createElement('li');
      li.textContent = `${item.time} — ${item.med} (${item.count})`;
      completedList.appendChild(li);
    }
  });

  // attach handlers
  document.querySelectorAll('.mark-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = parseInt(btn.dataset.idx, 10);
      toggleTaken(dateStr, idx);
    });
  });

  updateProgressUI(day);
}

// map tag -> css class
function medClass(tag){
  switch(tag){
    case 'atrogen': return 'med-atrogen';
    case 'vigalon': return 'med-vigalon';
    case 'neopred': return 'med-neopred';
    case 'nevan': return 'med-nevan';
    default: return '';
  }
}

// toggle taken flag
function toggleTaken(dateStr, idx){
  const day = loadDay(dateStr);
  const item = day.find(it=>it.idx===idx);
  if(!item) return;
  item.taken = !item.taken;
  item.ts = item.taken? new Date().toISOString() : null;
  saveDay(dateStr, day);
  render();
  // if 100% and not exported, call autoExport
  checkAutoExport(dateStr);
}

// update progress
function updateProgressUI(day){
  const done = day.filter(d=>d.taken).length;
  const percent = Math.round((done / TOTAL) * 100);
  progressBar.style.width = percent + '%';
  progressText.textContent = `আজকের অগ্রগতি: ${percent}%`;
}

// auto-export once per date when reaches 100%
function checkAutoExport(dateStr){
  const day = loadDay(dateStr);
  const done = day.filter(d=>d.taken).length;
  if(done === TOTAL){
    // check exported flag
    const already = localStorage.getItem(exportedKey(dateStr));
    if(!already){
      // generate PDF automatically and mark exported
      generatePDF(dateStr, true);
      localStorage.setItem(exportedKey(dateStr), new Date().toISOString());
    }
  }
}

// generate printable HTML and call html2pdf
function generatePDF(dateStr, auto=false){
  const day = loadDay(dateStr);
  // build html for pdfContainer
  const patientHeading = `<h2 style="margin:0 0 6px 0">চোখের ড্রপ রিপোর্ট — Monowara Begum</h2>
    <div style="font-size:14px;color:#333;margin-bottom:6px">তারিখ: ${dateStr} • রোগীর বয়স: 75 • ডান চোখ (চানি অপারেশন: 29/10/2025)</div>
    <hr style="border:none;border-top:1px solid #eee;margin:8px 0">`;

  let tableHtml = `<table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead><tr><th style="text-align:left;padding:6px;border-bottom:1px solid #ddd">সময়</th>
    <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd">ড্রপ</th>
    <th style="padding:6px;border-bottom:1px solid #ddd">স্ট্যাটাস</th></tr></thead><tbody>`;

  day.forEach(it=>{
    tableHtml += `<tr>
      <td style="padding:6px;border-bottom:1px solid #f2f2f2">${it.time}</td>
      <td style="padding:6px;border-bottom:1px solid #f2f2f2">${it.med} (${it.count})</td>
      <td style="padding:6px;border-bottom:1px solid #f2f2f2">${it.taken ? 'নেওয়া — ' + (it.ts? new Date(it.ts).toLocaleTimeString(): '') : 'বাকি'}</td>
    </tr>`;
  });

  tableHtml += `</tbody></table>`;

  pdfContainer.innerHTML = `<div style="padding:18px;font-family:Inter, 'Noto Sans Bengali'">${patientHeading}${tableHtml}</div>`;
  const element = pdfContainer;

  // file name
  const fileName = `EyeDrop_${dateStr}_MonowaraBegum.pdf`;

  // html2pdf options
  const opt = {
    margin: 10,
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // generate and save
  html2pdf().set(opt).from(element).save().then(()=>{
    if(auto){
      // show subtle alert
      alert('অভিনন্দন! আজকের সব ডোজ সম্পন্ন হয়েছে — PDF ডাউনলোড করা হয়েছে।');
    }
  });
}

// handlers: top buttons
todayBtn.addEventListener('click', ()=>{
  viewDate.value = isoToday();
  render();
});

viewDate.addEventListener('change', ()=>{ render(); });

exportPdfBtn.addEventListener('click', ()=>{
  generatePDF(viewDate.value, false);
});

exportPdfManual.addEventListener('click', ()=>{
  generatePDF(viewDate.value, false);
});

// clear all data (confirm)
clearAll.addEventListener('click', ()=>{
  if(confirm('এই ব্রাউজারের সব EyeDrop ডাটা মুছে ফেলতে চাও? (পুরো অ্যাপের সব ডেটা মুছে যাবে)')){
    // remove keys starting with eyedrop_
    Object.keys(localStorage).forEach(k=>{
      if(k.startsWith('eyedrop_')) localStorage.removeItem(k);
    });
    render();
    alert('সব ডাটা ফাঁকা করা হয়েছে।');
  }
});

// initial render and check
render();
checkAutoExport(viewDate.value);

// accessibility: keyboard quick mark (numbers)
document.addEventListener('keydown',(e)=>{
  if(e.key>='1' && e.key<='9'){
    const day = loadDay(viewDate.value);
    const notTaken = day.filter(d=>!d.taken);
    const idx = parseInt(e.key,10)-1;
    if(notTaken[idx]) {
      notTaken[idx].taken = true;
      notTaken[idx].ts = new Date().toISOString();
      saveDay(viewDate.value, day);
      render();
      checkAutoExport(viewDate.value);
    }
  }
});
