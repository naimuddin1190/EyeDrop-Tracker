/* app.js — বাংলা UI + ৪টি ড্রপের প্রগ্রেস বার + সম্পন্ন তালিকা PDF + progress সম্পূর্ণ হলে বার্তা + সতর্কবার্তা সংযুক্ত */

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

const scheduleBody = document.getElementById('scheduleBody');
const completedList = document.getElementById('completedList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const liveTime = document.getElementById('liveTime');
const viewDate = document.getElementById('viewDate');
const todayBtn = document.getElementById('todayBtn');
const exportPdf = document.getElementById('exportPdf');
const exportPdfManual = document.getElementById('exportPdfManual');
const clearAll = document.getElementById('clearAll');
const pdfContainer = document.getElementById('pdfContainer');

// Individual progress bar references
const progBars = {
  atrogen: document.getElementById('prog-atrogen'),
  vigalon: document.getElementById('prog-vigalon'),
  neopred: document.getElementById('prog-neopred'),
  nevan: document.getElementById('prog-nevan')
};

const TOTAL = scheduleData.length;

// আজকের তারিখ
function isoToday(d = new Date()) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
viewDate.value = isoToday();

// সময় আপডেট
function updateClock() {
  const n = new Date();
  liveTime.textContent =
    n.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' }) +
    ' • ' +
    n.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// Storage
function keyFor(d) {
  return 'eyedrop_' + d;
}
function loadDay(d) {
  const raw = localStorage.getItem(keyFor(d));
  if (!raw) {
    const obj = scheduleData.map((r, i) => ({
      idx: i,
      time: r[0],
      med: r[1],
      count: r[2],
      note: r[3],
      tag: r[4],
      taken: false
    }));
    localStorage.setItem(keyFor(d), JSON.stringify(obj));
    return obj;
  }
  return JSON.parse(raw);
}
function saveDay(d, arr) {
  localStorage.setItem(keyFor(d), JSON.stringify(arr));
}

// Render Table + Completed List
function render() {
  const dateStr = viewDate.value;
  const day = loadDay(dateStr);
  scheduleBody.innerHTML = '';
  completedList.innerHTML = '';

  day.forEach(it => {
    const tr = document.createElement('tr');
    const medBadge = `<span class="med-badge med-${it.tag}">${it.med.split(' ')[0]}</span>`;
    tr.innerHTML = `
      <td>${it.time}</td>
      <td>${medBadge}</td>
      <td>${it.count}</td>
      <td>${it.note}</td>
      <td><button class="mark-btn ${it.taken ? 'done' : 'pending'}" data-idx="${it.idx}" data-drop="${it.tag}">
`;
    scheduleBody.appendChild(tr);

    if (it.taken) {
      const li = document.createElement('li');
      li.textContent = `${it.time} — ${it.med} (${it.count})`;
      completedList.appendChild(li);
    }
  });

  document.querySelectorAll('.mark-btn').forEach(btn => {
    btn.onclick = () => {
      toggleTaken(dateStr, parseInt(btn.dataset.idx));
    };
  });

  updateProgressUI(day);
}

// Toggle Taken (with warning)
function toggleTaken(d, idx) {
  const day = loadDay(d);
  const item = day.find(i => i.idx === idx);

  if (item.taken) {
    const confirmMsg = confirm("⚠️ আপনি কি ভুলে ক্লিক করেছেন?\nনাকি সত্যিই পেছনে ফিরবেন?");
    if (!confirmMsg) return; // Cancel করলে কিছু হবে না
  }

  item.taken = !item.taken;
  saveDay(d, day);
  render();
}

// Update Progress UI + messages
function updateProgressUI(day) {
  const done = day.filter(d => d.taken).length;
  const percent = Math.round((done / TOTAL) * 100);
  progressBar.style.width = percent + '%';
  progressText.textContent = `আজকের অগ্রগতি: ${percent}%`;

  let allComplete = true;

  ['atrogen', 'vigalon', 'neopred', 'nevan'].forEach(tag => {
    const total = day.filter(d => d.tag === tag).length;
    const done = day.filter(d => d.tag === tag && d.taken).length;
    const p = Math.round((done / total) * 100);
    progBars[tag].style.width = p + '%';

    let msgId = 'msg_' + tag;
    let existing = document.getElementById(msgId);
    if (p === 100) {
      if (!existing) {
        const msg = document.createElement('div');
        msg.id = msgId;
        msg.className = 'drop-complete-msg';
        msg.textContent = `✔️ ${tag.toUpperCase()} সম্পন্ন হয়েছে`;
        progBars[tag].parentElement.parentElement.appendChild(msg);
      }
    } else if (existing) {
      existing.remove();
      allComplete = false;
    }
    if (p < 100) allComplete = false;
  });

  // যদি সব ড্রপ সম্পন্ন হয়
  let doneMsg = document.getElementById('allDoneMsg');
  if (allComplete) {
    if (!doneMsg) {
      doneMsg = document.createElement('div');
      doneMsg.id = 'allDoneMsg';
      doneMsg.className = 'all-complete-banner';
      doneMsg.textContent = '🎉 আজকের সব ড্রপের শিডিউল সফলভাবে সম্পন্ন হয়েছে!';
      document.querySelector('.progress-wrap').appendChild(doneMsg);
    }
  } else if (doneMsg) {
    doneMsg.remove();
  }
}

// Buttons
todayBtn.onclick = () => {
  viewDate.value = isoToday();
  render();
};
viewDate.onchange = () => render();
clearAll.onclick = () => {
  if (confirm('সব ডাটা মুছে ফেলতে চাও?')) {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('eyedrop_')) localStorage.removeItem(k);
    });
    render();
  }
};

// PDF Export
function generateTablePDF() {
  const dateStr = viewDate.value;
  const day = loadDay(dateStr);

  let tableHtml = `
  <h2 style="margin:0 0 6px 0">চোখের ড্রপ রিপোর্ট</h2>
  <div style="font-size:14px;color:#333;margin-bottom:6px">তারিখ: ${dateStr}</div>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead>
      <tr>
        <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd">সময়</th>
        <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd">ড্রপ</th>
        <th style="padding:6px;border-bottom:1px solid #ddd">ব্যবহার সংখ্যা</th>
        <th style="padding:6px;border-bottom:1px solid #ddd">মন্তব্য</th>
        <th style="padding:6px;border-bottom:1px solid #ddd">অবস্থা</th>
      </tr>
    </thead>
    <tbody>`;

  day.forEach(it => {
    tableHtml += `
      <tr>
        <td style="padding:6px;border-bottom:1px solid #f2f2f2">${it.time}</td>
        <td style="padding:6px;border-bottom:1px solid #f2f2f2">${it.med}</td>
        <td style="padding:6px;border-bottom:1px solid #f2f2f2">${it.count}</td>
        <td style="padding:6px;border-bottom:1px solid #f2f2f2">${it.note}</td>
        <td style="padding:6px;border-bottom:1px solid #f2f2f2">${it.taken ? '✅ সম্পন্ন' : '⬜ অপেক্ষমাণ'}</td>
      </tr>`;
  });

  tableHtml += `</tbody></table>`;
  pdfContainer.innerHTML = tableHtml;

  const opt = {
    margin: 0.5,
    filename: `EyeDrop_${dateStr}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(pdfContainer).save();
}

exportPdf.onclick = generateTablePDF;
exportPdfManual.onclick = generateTablePDF;

// Initial Render
render();
