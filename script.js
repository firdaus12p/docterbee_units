/* ========================================
   Docterbee Journey - Main JavaScript
   ======================================== */

// ==================== DATA MODEL ====================

const UNITS = [
  {
    id: "u1",
    title: "Unit 1 · 24 Jam Sehari",
    color: "text-amber-300",
    items: [
      {
        key: "subuh",
        q: "Sudah shalat Subuh tepat waktu & terkena cahaya fajar 5–10 menit?",
        dalil: "QS 7:205; adab Subuh",
        sains:
          "Cahaya fajar → sirkadian → dopamin/serotonin → semangat & fokus",
        nbsn: 'Neuron: niat & syukur. Sensorik: cahaya pagi. Biomolekul: madu + air hangat. Nature: napas 2"',
      },
      {
        key: "quranPagi",
        q: "Apakah membaca Al-Qur'an pagi ini?",
        dalil: "Keutamaan membaca Qur'an",
        sains: "Fokus & regulasi emosi meningkat",
        nbsn: "Neuron: fokus 5 menit",
      },
      {
        key: "zuhur",
        q: "Zuhur tepat waktu & istirahat 2–3 menit dari layar?",
        dalil: "QS 62:10 – seimbang kerja & ibadah",
        sains: "Microbreak mencegah decision fatigue",
        nbsn: "Sensorik: peregangan",
      },
      {
        key: "ashar",
        q: "Menjaga mata/gadget di waktu Ashar (tidak berlebihan)?",
        dalil: "Amanah menjaga tubuh",
        sains: "Paparan layar berlebih → kelelahan",
        nbsn: "Sensorik: 20–20–20",
      },
      {
        key: "maghrib",
        q: "Maghrib tepat waktu & menenangkan rumah?",
        dalil: "HR Bukhari – adab Maghrib",
        sains: "Ritme sosial & emosi stabil",
        nbsn: "Neuron: syukur sore",
      },
      {
        key: "isya",
        q: "Isya tepat waktu & tidur lebih awal?",
        dalil: "HR Muslim – tidur awal",
        sains: "Hormon pemulihan di malam",
        nbsn: "Nature: gelapkan kamar",
      },
    ],
  },
  {
    id: "u2",
    title: "Unit 2 · Bersosialisasi",
    color: "text-emerald-300",
    items: [
      {
        key: "senyum",
        q: "Hari ini memberi salam/senyum pada keluarga/teman?",
        dalil: "HR Tirmidzi – senyum sedekah",
        sains: "Oksitosin ↓ stres",
        nbsn: "Neuron: niat ihsan",
      },
      {
        key: "lidah",
        q: "Menghindari kata menyakitkan/ghibah?",
        dalil: "HR Bukhari – berkata baik/diam",
        sains: "Menghindari konflik → emosi stabil",
        nbsn: "Neuron: tafakur 1 menit",
      },
      {
        key: "doa",
        q: "Mendoakan orang lain diam-diam?",
        dalil: "Doa untuk saudara",
        sains: "Empati tingkatkan well-being",
        nbsn: "Nature: rasa syukur",
      },
    ],
  },
  {
    id: "u3",
    title: "Unit 3 · Mencari Rezeki",
    color: "text-sky-300",
    items: [
      {
        key: "niatKerja",
        q: "Berniat kerja untuk ridha Allah & amanah?",
        dalil: "QS 62:10 – bertebaran cari karunia",
        sains: "Niat → motivasi intrinsik",
        nbsn: "Neuron: tujuan kerja harian",
      },
      {
        key: "jujur",
        q: "Menjaga kejujuran & catatan transaksi?",
        dalil: "Amanah dagang",
        sains: "Kepercayaan sosial → produktivitas",
        nbsn: "Nature: disiplin waktu",
      },
      {
        key: "recharge",
        q: "Istirahat singkat + dzikir saat lelah?",
        dalil: "Dzikir menenangkan hati",
        sains: "Microrest pulihkan prefrontal",
        nbsn: 'Sensorik: napas 2–3"',
      },
    ],
  },
  {
    id: "u4",
    title: "Unit 4 · Makan & Minum",
    color: "text-fuchsia-300",
    items: [
      {
        key: "porsi",
        q: "Makan sebelum lapar, berhenti sebelum kenyang?",
        dalil: "HR Tirmidzi – sepertiga",
        sains: "Cegah lonjakan insulin",
        nbsn: "Biomolekul: porsi seimbang",
      },
      {
        key: "halal",
        q: "Memilih makanan halal-thayyib?",
        dalil: "QS 2:168",
        sains: "Higienitas & kualitas nutrisi",
        nbsn: "Nature: bahan segar lokal",
      },
      {
        key: "minumDuduk",
        q: "Minum sambil duduk & tidak terburu-buru?",
        dalil: "Adab minum",
        sains: "Hindari aspirasi/ketidaknyamanan",
        nbsn: "Sensorik: mindful sip",
      },
    ],
  },
  {
    id: "u5",
    title: "Unit 5 · Saat Sakit",
    color: "text-rose-300",
    items: [
      {
        key: "sabar",
        q: "Sabar & berobat dengan cara halal?",
        dalil: "QS 26:80 – Allah menyembuhkan",
        sains: "Stres rendah → imun meningkat",
        nbsn: "Nature: tidur & hidrasi",
      },
      {
        key: "doaSembuh",
        q: "Berdoa memohon kesembuhan?",
        dalil: "Doa Nabi – syifa",
        sains: "Relaksasi → pemulihan",
        nbsn: "Neuron: harapan positif",
      },
      {
        key: "madu",
        q: "Mengambil ikhtiar madu/kurma sesuai anjuran?",
        dalil: "QS 16:69 – syifa",
        sains: "Enzim & flavonoid",
        nbsn: "Biomolekul: dosis wajar",
      },
    ],
  },
  {
    id: "u6",
    title: "Unit 6 · Menjaga Pancaindra",
    color: "text-amber-200",
    items: [
      {
        key: "pandangan",
        q: "Menjaga pandangan dari yang haram?",
        dalil: "QS 24:30",
        sains: "Hindari dopamin instan",
        nbsn: "Neuron: kontrol diri",
      },
      {
        key: "pendengaran",
        q: "Memilih konten bermanfaat untuk didengar?",
        dalil: "Adab mendengar",
        sains: "Konten positif → fokus",
        nbsn: "Sensorik: kurasi audio",
      },
      {
        key: "ucapan",
        q: "Menjaga ucapan (baik/diam)?",
        dalil: "HR Bukhari",
        sains: "Hindari konflik",
        nbsn: "Neuron: jeda 3 detik",
      },
    ],
  },
];

// ==================== STORAGE HELPERS ====================

/**
 * LocalStorage helper function
 * @param {string} name - Storage key name
 * @param {*} value - Value to store (optional)
 * @returns {*} Stored value if no value parameter provided
 */
function _db(name, value) {
  if (value === undefined) {
    try {
      return JSON.parse(localStorage.getItem(name) || "{}");
    } catch (e) {
      return {};
    }
  } else {
    localStorage.setItem(name, JSON.stringify(value));
  }
}

/**
 * Get current points from storage
 * @returns {number} Current points value
 */
function _getPoints() {
  const points = _db("db_points");
  return points.value || 0;
}

/**
 * Set points in storage
 * @param {number} value - Points value to set
 */
function _setPoints(value) {
  _db("db_points", { value: value });
}

/**
 * Add points and refresh display
 * @param {number} value - Points to add
 */
function addPoints(value) {
  let points = _getPoints();
  points += value;
  _setPoints(points);
  refreshNav();
}

/**
 * Refresh navigation points display
 */
function refreshNav() {
  const navPointsEl = document.getElementById("navPoints");
  if (navPointsEl) {
    navPointsEl.textContent = _getPoints();
  }
}

/**
 * Get user answers state
 * @returns {Object} User answers object
 */
function getState() {
  return _db("db_units");
}

/**
 * Set user answers state
 * @param {Object} state - State object to save
 */
function setState(state) {
  _db("db_units", state);
}

// ==================== UI RENDERING ====================

/**
 * Build and render tab navigation
 */
function buildTabs() {
  const tabsContainer = document.getElementById("tabs");
  if (!tabsContainer) return;

  tabsContainer.innerHTML = "";

  UNITS.forEach((unit, index) => {
    const button = document.createElement("button");
    button.className = "tab-button" + (index === 0 ? " active" : "");
    button.textContent = unit.title;
    button.addEventListener("click", () => showUnit(unit.id));
    tabsContainer.appendChild(button);
  });
}

/**
 * Show unit content
 * @param {string} unitId - Unit ID to display
 */
function showUnit(unitId) {
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit) return;

  const state = getState();
  const answers = state[unitId] || {};
  const unitWrap = document.getElementById("unitWrap");
  if (!unitWrap) return;

  // Generate question cards HTML
  const itemsHtml = unit.items
    .map((item) => {
      const isAnswered = answers[item.key] === 1;
      const statusClass = isAnswered ? "status-answered" : "status-unanswered";
      const statusText = isAnswered ? "Terpenuhi" : "Belum dicatat";

      return `
      <div class="question-card">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-semibold">${escapeHtml(item.q)}</div>
            <div class="text-xs text-slate-400 mt-1">${escapeHtml(
              item.dalil
            )}</div>
          </div>
          <div class="text-xs ${unit.color}">Dalil · Sains · NBSN</div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button class="btn-yes" data-unit="${unitId}" data-key="${
        item.key
      }" data-value="1">Ya</button>
          <button class="btn-no" data-unit="${unitId}" data-key="${
        item.key
      }" data-value="0">Belum</button>
          <button class="btn-info" data-unit="${unitId}" data-key="${
        item.key
      }">Lihat Penjelasan</button>
        </div>
        <div id="info_${unitId}_${item.key}" class="info-box hidden">
          <div><b>Dalil:</b> ${escapeHtml(item.dalil)}</div>
          <div><b>Sains:</b> ${escapeHtml(item.sains)}</div>
          <div><b>NBSN:</b> ${escapeHtml(item.nbsn)}</div>
        </div>
        <div class="${statusClass}" id="ans_${unitId}_${
        item.key
      }">${statusText}</div>
      </div>
    `;
    })
    .join("");

  // Render unit content
  unitWrap.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <div class="text-lg font-semibold">${escapeHtml(unit.title)}</div>
      <div class="flex items-center gap-2">
        <button class="btn-calc-unit" data-unit="${unitId}">Hitung Skor Unit</button>
        <span class="text-2xl font-bold text-amber-300" id="score_${unitId}">—</span>
      </div>
    </div>
    <div class="card-grid">
      ${itemsHtml}
    </div>
    <div class="mt-5 text-xs text-slate-400">
      *Jawaban disimpan di perangkat (demo). Dapatkan poin untuk jawaban "Ya".
    </div>
  `;

  // Attach event listeners
  attachUnitEventListeners(unitId);

  // Update active tab
  updateActiveTabs(unitId);
}

/**
 * Attach event listeners to unit buttons
 * @param {string} unitId - Current unit ID
 */
function attachUnitEventListeners(unitId) {
  // Answer buttons (Ya/Belum)
  const answerButtons = document.querySelectorAll(".btn-yes, .btn-no");
  answerButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const unit = this.getAttribute("data-unit");
      const key = this.getAttribute("data-key");
      const value = parseInt(this.getAttribute("data-value"));
      answer(unit, key, value);
    });
  });

  // Info toggle buttons
  const infoButtons = document.querySelectorAll(".btn-info");
  infoButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const unit = this.getAttribute("data-unit");
      const key = this.getAttribute("data-key");
      toggleInfo(unit, key);
    });
  });

  // Calculate unit score button
  const calcButton = document.querySelector(".btn-calc-unit");
  if (calcButton) {
    calcButton.addEventListener("click", function () {
      const unit = this.getAttribute("data-unit");
      calcUnit(unit);
    });
  }
}

/**
 * Update active tab styling
 * @param {string} activeUnitId - Currently active unit ID
 */
function updateActiveTabs(activeUnitId) {
  const tabs = document.querySelectorAll(".tab-button");
  tabs.forEach((tab, index) => {
    if (UNITS[index].id === activeUnitId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ==================== USER INTERACTIONS ====================

/**
 * Record user answer
 * @param {string} unitId - Unit ID
 * @param {string} key - Question key
 * @param {number} value - Answer value (0 or 1)
 */
function answer(unitId, key, value) {
  const state = getState();
  state[unitId] = state[unitId] || {};
  state[unitId][key] = value;
  setState(state);

  const element = document.getElementById("ans_" + unitId + "_" + key);
  if (!element) return;

  if (value === 1) {
    element.textContent = "Terpenuhi";
    element.className = "status-answered";
    addPoints(1);
  } else {
    element.textContent = "Belum dicatat";
    element.className = "status-unanswered";
  }
}

/**
 * Toggle information panel visibility
 * @param {string} unitId - Unit ID
 * @param {string} key - Question key
 */
function toggleInfo(unitId, key) {
  const element = document.getElementById("info_" + unitId + "_" + key);
  if (element) {
    element.classList.toggle("hidden");
  }
}

// ==================== SCORING CALCULATIONS ====================

/**
 * Calculate unit score
 * @param {string} unitId - Unit ID to calculate
 */
function calcUnit(unitId) {
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit) return;

  const state = getState();
  const answers = state[unitId] || {};

  const totalItems = unit.items.length;
  const yesCount = Object.values(answers).filter((v) => v === 1).length;
  const score = Math.round((yesCount / totalItems) * 100);

  const scoreElement = document.getElementById("score_" + unitId);
  if (scoreElement) {
    scoreElement.textContent = score;
  }

  // Add bonus points
  const bonusPoints = Math.floor(score / 20);
  if (bonusPoints > 0) {
    addPoints(bonusPoints);
  }
}

/**
 * Calculate total score across all units
 */
function calcAll() {
  let sum = 0;
  let count = 0;

  UNITS.forEach((unit) => {
    const state = getState();
    const answers = state[unit.id] || {};
    const totalItems = unit.items.length;
    const yesCount = Object.values(answers).filter((v) => v === 1).length;

    if (totalItems > 0) {
      sum += (yesCount / totalItems) * 100;
      count++;
    }
  });

  const total = count > 0 ? Math.round(sum / count) : 0;
  const totalScoreElement = document.getElementById("totalScore");

  if (totalScoreElement) {
    totalScoreElement.textContent = isNaN(total) ? "—" : total;
  }

  // Add bonus points
  const bonusPoints = Math.floor(total / 25);
  if (bonusPoints > 0) {
    addPoints(bonusPoints);
  }
}

// ==================== INITIALIZATION ====================

/**
 * Initialize application
 */
function init() {
  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Build tabs and show first unit
  buildTabs();
  showUnit(UNITS[0].id);

  // Attach calc all button listener
  const calcAllBtn = document.getElementById("btnCalcAll");
  if (calcAllBtn) {
    calcAllBtn.addEventListener("click", calcAll);
  }

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

// ==================== BOOKING PAGE FUNCTIONS ====================

/**
 * Booking state
 */
const bookingState = {
  selectedTime: null,
};

/**
 * Generate time slots for booking
 */
function generateSlots() {
  const slotsContainer = document.getElementById("slots");
  if (!slotsContainer) return;

  slotsContainer.innerHTML = "";
  const hours = [9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20];

  hours.forEach((hour) => {
    const button = document.createElement("button");
    button.className = "slot-button";
    button.textContent = (hour < 10 ? "0" : "") + hour + ":00";
    button.addEventListener("click", () => selectSlot(button.textContent));
    slotsContainer.appendChild(button);
  });
}

/**
 * Select a time slot
 * @param {string} time - Selected time slot
 */
function selectSlot(time) {
  bookingState.selectedTime = time;

  // Update slot buttons styling
  const slots = document.getElementById("slots");
  if (slots) {
    Array.from(slots.children).forEach((button) => {
      button.classList.remove("selected");
      if (button.textContent === time) {
        button.classList.add("selected");
      }
    });
  }

  updateBookingSummary();
}

/**
 * Update booking summary display
 */
function updateBookingSummary() {
  const summaryEl = document.getElementById("summary");
  if (!summaryEl) return;

  const branch = document.getElementById("branch")?.value || "";
  const practitioner = document.getElementById("pract")?.value || "";
  const date = document.getElementById("date")?.value || "";
  const mode = document.getElementById("mode")?.value || "";
  const time = bookingState.selectedTime || "(belum dipilih)";

  summaryEl.innerHTML = `
    <div class="grid md:grid-cols-2 gap-3">
      <div class="summary-card">
        <b>Cabang</b>
        <div class="opacity-80">${escapeHtml(branch)}</div>
      </div>
      <div class="summary-card">
        <b>Praktisi</b>
        <div class="opacity-80">${escapeHtml(practitioner)}</div>
      </div>
      <div class="summary-card">
        <b>Tanggal</b>
        <div class="opacity-80">${date || "(belum dipilih)"}</div>
      </div>
      <div class="summary-card">
        <b>Jam</b>
        <div class="opacity-80">${time}</div>
      </div>
      <div class="summary-card md:col-span-2">
        <b>Mode</b>
        <div class="opacity-80">${escapeHtml(mode)}</div>
      </div>
    </div>
  `;
}

/**
 * Confirm booking
 */
function confirmBooking() {
  updateBookingSummary();

  const date = document.getElementById("date")?.value;
  if (!date || !bookingState.selectedTime) {
    alert("Pilih tanggal dan jam terlebih dahulu.");
    return;
  }

  alert(
    "Terima kasih! Pemesanan Anda tercatat (demo). Kami akan menghubungi via WhatsApp."
  );
}

/**
 * Reset booking form
 */
function resetBookingForm() {
  const dateInput = document.getElementById("date");
  if (dateInput) {
    dateInput.value = "";
  }

  bookingState.selectedTime = null;
  generateSlots();
  updateBookingSummary();
}

/**
 * Initialize booking page
 */
function initBooking() {
  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Generate time slots
  generateSlots();
  updateBookingSummary();

  // Attach event listeners
  const confirmBtn = document.getElementById("btnConfirmBooking");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", confirmBooking);
  }

  const resetBtn = document.getElementById("btnResetForm");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetBookingForm);
  }

  // Update summary when form fields change
  const formFields = ["branch", "pract", "date", "mode"];
  formFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("change", updateBookingSummary);
    }
  });

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

// ==================== APP STARTUP ====================

// Initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // Check if on booking page
    if (document.getElementById("slots")) {
      initBooking();
    } else {
      init();
    }
  });
} else {
  // Check if on booking page
  if (document.getElementById("slots")) {
    initBooking();
  } else {
    init();
  }
}
