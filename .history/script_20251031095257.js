const drops = [
  { name: "Atrogen 1%", times: ["8:00", "14:00", "20:00"] },
  { name: "Vigalon", times: ["8:30", "11:30", "14:30", "17:30", "20:30", "22:00"] },
  { name: "Neopred", times: ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
  { name: "Nevan Ts", times: ["9:00", "15:00", "21:00"] }
];

const table = document.getElementById("schedule");
const resetBtn = document.getElementById("reset");

function loadSchedule() {
  const saved = JSON.parse(localStorage.getItem("eyeDrops")) || {};
  table.innerHTML = "<tr><th>ড্রপের নাম</th><th>সময়</th><th>অবস্থা</th></tr>";

  drops.forEach(drop => {
    drop.times.forEach(time => {
      const key = `${drop.name}-${time}`;
      const done = saved[key];
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${drop.name}</td>
        <td>${time}</td>
        <td>
          <button class="mark-btn" data-key="${key}">
            ${done ? "✅ নেওয়া হয়েছে" : "⬜ নেওয়া বাকি"}
          </button>
        </td>`;
      table.appendChild(row);
    });
  });

  document.querySelectorAll(".mark-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleDrop(btn.dataset.key));
  });
}

function toggleDrop(key) {
  const saved = JSON.parse(localStorage.getItem("eyeDrops")) || {};
  saved[key] = !saved[key];
  localStorage.setItem("eyeDrops", JSON.stringify(saved));
  loadSchedule();
}

resetBtn.addEventListener("click", () => {
  if (confirm("সব রেকর্ড মুছে ফেলতে চাও?")) {
    localStorage.removeItem("eyeDrops");
    loadSchedule();
  }
});

loadSchedule();
