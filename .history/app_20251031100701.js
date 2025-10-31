const schedule = [
  { time: "8:00 AM", name: "Atrogen 1%", count: 1 },
  { time: "8:05 AM", name: "Vigalon", count: 1 },
  { time: "8:10 AM", name: "Neopred", count: 1 },
  { time: "8:15 AM", name: "Nevan Ts", count: 1 },
  { time: "9:30 AM", name: "Neopred", count: 2 },
  { time: "9:35 AM", name: "Vigalon", count: 2 },
  { time: "11:00 AM", name: "Neopred", count: 3 },
  { time: "11:05 AM", name: "Vigalon", count: 3 },
  { time: "12:30 PM", name: "Atrogen 1%", count: 2 },
  { time: "12:35 PM", name: "Neopred", count: 4 },
  { time: "12:40 PM", name: "Nevan Ts", count: 2 },
  { time: "12:45 PM", name: "Vigalon", count: 4 },
  { time: "2:30 PM", name: "Neopred", count: 5 },
  { time: "2:35 PM", name: "Vigalon", count: 5 },
  { time: "4:30 PM", name: "Neopred", count: 6 },
  { time: "4:35 PM", name: "Vigalon", count: 6 },
  { time: "6:00 PM", name: "Atrogen 1%", count: 3 },
  { time: "6:05 PM", name: "Neopred", count: 7 },
  { time: "6:10 PM", name: "Nevan Ts", count: 3 },
  { time: "7:30 PM", name: "Neopred", count: 8 },
  { time: "8:30 PM", name: "Neopred", count: 9 },
  { time: "9:30 PM", name: "Neopred", count: 10 }
];

const table = document.getElementById("schedule");
const resetBtn = document.getElementById("reset");
const downloadBtn = document.getElementById("downloadPdf");

function loadSchedule() {
  const saved = JSON.parse(localStorage.getItem("eyeDrops")) || {};
  table.innerHTML = "<tr><th>সময়</th><th>ড্রপের নাম</th><th>ব্যবহার</th><th>অবস্থা</th></tr>";

  schedule.forEach(entry => {
    const key = `${entry.time}-${entry.name}`;
    const done = saved[key];
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.time}</td>
      <td>${entry.name}</td>
      <td>${entry.count}ম</td>
      <td><button class="mark-btn" data-key="${key}">
        ${done ? "✅ নেওয়া হয়েছে" : "⬜ নেওয়া বাকি"}
      </button></td>`;
    table.appendChild(row);
  });

  document.querySelectorAll(".mark-btn").forEach(btn =>
    btn.addEventListener("click", () => toggleDrop(btn.dataset.key))
  );
  updateProgress();
}

function toggleDrop(key) {
  const saved = JSON.parse(localStorage.getItem("eyeDrops")) || {};
  saved[key] = !saved[key];
  localStorage.setItem("eyeDrops", JSON.stringify(saved));
  loadSchedule();
}

function updateProgress() {
  const saved = JSON.parse(localStorage.getItem("eyeDrops")) || {};
  const counts = { "Atrogen 1%": 0, "Vigalon": 0, "Neopred": 0, "Nevan Ts": 0 };

  Object.keys(saved).forEach(key => {
    if (saved[key]) {
      const drop = key.split("-")[1];
      if (counts[drop] !== undefined) counts[drop]++;
    }
  });

  document.getElementById("atrogenProgress").value = counts["Atrogen 1%"];
  document.getElementById("vigalonProgress").value = counts["Vigalon"];
  document.getElementById("neopredProgress").value = counts["Neopred"];
  document.getElementById("nevanProgress").value = counts["Nevan Ts"];
}

resetBtn.addEventListener("click", () => {
  if (confirm("সব রেকর্ড মুছে ফেলতে চাও?")) {
    localStorage.removeItem("eyeDrops");
    loadSchedule();
  }
});

downloadBtn.addEventListener("click", () => {
  const content = document.querySelector(".container").innerText;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "EyeDrop_Progress.txt";
  a.click();
});

function showDateTime() {
  const now = new Date();
  document.getElementById("datetime").innerText =
    now.toLocaleString("bn-BD", { dateStyle: "full", timeStyle: "medium" });
}
setInterval(showDateTime, 1000);

loadSchedule();
showDateTime();
