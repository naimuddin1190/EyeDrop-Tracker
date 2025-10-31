const scheduleData = [
  ["8:00 AM", "Atrogen 1%", "১ম", "১ ফোঁটা"],
  ["8:05 AM", "Vigalon", "১ম", "১ ফোঁটা"],
  ["8:10 AM", "Neopred", "১ম", "১ ফোঁটা"],
  ["8:15 AM", "Nevan Ts", "১ম", "১ ফোঁটা"],
  ["9:30 AM", "Neopred", "২য়", "১ ফোঁটা"],
  ["9:35 AM", "Vigalon", "২য়", "১ ফোঁটা"],
  ["11:00 AM", "Neopred", "৩য়", "১ ফোঁটা"],
  ["11:05 AM", "Vigalon", "৩য়", "১ ফোঁটা"],
  ["12:30 PM", "Atrogen 1%", "২য়", "১ ফোঁটা"],
  ["12:35 PM", "Neopred", "৪র্থ", "১ ফোঁটা"],
  ["12:40 PM", "Nevan Ts", "২য়", "১ ফোঁটা"],
  ["12:45 PM", "Vigalon", "৪র্থ", "১ ফোঁটা"],
  ["2:30 PM", "Neopred", "৫ম", "১ ফোঁটা"],
  ["2:35 PM", "Vigalon", "৫ম", "১ ফোঁটা"],
  ["4:30 PM", "Neopred", "৬ষ্ঠ", "১ ফোঁটা"],
  ["4:35 PM", "Vigalon", "৬ষ্ঠ (শেষ)", "১ ফোঁটা"],
  ["6:00 PM", "Atrogen 1%", "৩য় (শেষ)", "১ ফোঁটা"],
  ["6:05 PM", "Neopred", "৭ম", "১ ফোঁটা"],
  ["6:10 PM", "Nevan Ts", "৩য় (শেষ)", "১ ফোঁটা"],
  ["7:30 PM", "Neopred", "৮ম", "১ ফোঁটা"],
  ["8:30 PM", "Neopred", "৯ম", "১ ফোঁটা"],
  ["9:30 PM", "Neopred", "১০ম (শেষ)", "১ ফোঁটা"]
];

const table = document.getElementById("schedule");
const completedList = document.getElementById("completedList");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

function loadSchedule() {
  const doneList = JSON.parse(localStorage.getItem("completedDrops")) || [];
  table.innerHTML = `<tr><th>সময়</th><th>ড্রপের নাম</th><th>ব্যবহার সংখ্যা</th><th>মন্তব্য</th><th>অবস্থা</th></tr>`;
  completedList.innerHTML = "";

  scheduleData.forEach((item) => {
    const key = item.join("-");
    const isDone = doneList.includes(key);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item[0]}</td>
      <td>${item[1]}</td>
      <td>${item[2]}</td>
      <td>${item[3]}</td>
      <td><button class="mark-btn ${isDone ? 'done' : ''}" data-key="${key}">
      ${isDone ? "✅ সম্পন্ন" : "⬜ অপেক্ষমাণ"}</button></td>
    `;
    table.appendChild(tr);

    if (isDone) {
      const li = document.createElement("li");
      li.textContent = `${item[0]} - ${item[1]} (${item[2]})`;
      completedList.appendChild(li);
    }
  });

  updateProgress(doneList.length);
  document.querySelectorAll(".mark-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleComplete(btn.dataset.key));
  });
}

function toggleComplete(key) {
  let doneList = JSON.parse(localStorage.getItem("completedDrops")) || [];
  if (doneList.includes(key)) {
    doneList = doneList.filter(item => item !== key);
  } else {
    doneList.push(key);
  }
  localStorage.setItem("completedDrops", JSON.stringify(doneList));
  loadSchedule();
}

function updateProgress(doneCount) {
  const total = scheduleData.length;
  const percent = Math.round((doneCount / total) * 100);
  progressBar.style.width = percent + "%";
  progressText.textContent = `আজকের অগ্রগতি: ${percent}%`;
}

loadSchedule();
