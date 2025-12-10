/* ========================================
   Docterbee Journey - Main JavaScript
   ======================================== */

// ==================== DATA MODEL ====================

const UNITS = [
  {
    id: "u1",
    title: "Unit 1 · 24 Jam Sehari",
    color: "text-amber-500",
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
    color: "text-emerald-500",
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
    color: "text-sky-500",
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
    color: "text-fuchsia-500",
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
    color: "text-rose-500",
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
    color: "text-amber-500",
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

  const mobileNavPointsEl = document.getElementById("mobileNavPoints");
  if (mobileNavPointsEl) {
    mobileNavPointsEl.textContent = _getPoints();
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
      const statusText = isAnswered ? "Terpenuhi" : "Belum melakukan";

      return `
      <div class="question-card">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-semibold">${escapeHtml(item.q)}</div>
            <div class="text-xs text-slate-900 mt-1 font-medium">${escapeHtml(
              item.dalil
            )}</div>
          </div>
          <div class="text-xs ${
            unit.color
          } font-semibold">Dalil · Sains · NBSN</div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button class="btn-yes ${
            isAnswered ? "selected" : ""
          }" data-unit="${unitId}" data-key="${
        item.key
      }" data-value="1">Ya</button>
          <button class="btn-no ${
            !isAnswered && answers[item.key] === 0 ? "selected" : ""
          }" data-unit="${unitId}" data-key="${
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

  // Update status text
  if (value === 1) {
    element.textContent = "Terpenuhi";
    element.className = "status-answered";
    addPoints(1);
  } else {
    element.textContent = "Belum melakukan";
    element.className = "status-unanswered";
  }

  // Update button selected states
  const yesBtn = document.querySelector(
    `.btn-yes[data-unit="${unitId}"][data-key="${key}"]`
  );
  const noBtn = document.querySelector(
    `.btn-no[data-unit="${unitId}"][data-key="${key}"]`
  );

  if (yesBtn && noBtn) {
    if (value === 1) {
      yesBtn.classList.add("selected");
      noBtn.classList.remove("selected");
    } else {
      yesBtn.classList.remove("selected");
      noBtn.classList.add("selected");
    }
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
    // Animate counter from 0 to score
    if (score > 0) {
      animateCounter(scoreElement, 0, score, 1200);
    } else {
      scoreElement.textContent = score;
    }
  }

  // Add bonus points
  const bonusPoints = Math.floor(score / 20);
  if (bonusPoints > 0) {
    addPoints(bonusPoints);
  }
}

/**
 * Animate counter from start to end value
 * @param {HTMLElement} element - Element to animate
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Animation duration in milliseconds
 */
function animateCounter(element, start, end, duration) {
  if (!element) return;

  // Add counting class for CSS animation
  element.classList.add("counting");

  const startTime = performance.now();
  const range = end - start;

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(start + range * easeOut);

    element.textContent = currentValue;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      // Remove counting class when animation completes
      setTimeout(() => {
        element.classList.remove("counting");
      }, 500);
    }
  }

  requestAnimationFrame(updateCounter);
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
    if (isNaN(total) || total === 0) {
      totalScoreElement.textContent = total === 0 ? "0" : "—";
    } else {
      // Animate counter from 0 to total score
      animateCounter(totalScoreElement, 0, total, 1500);
    }
  }

  // Add bonus points
  const bonusPoints = Math.floor(total / 25);
  if (bonusPoints > 0) {
    addPoints(bonusPoints);
  }
}

// ==================== MOBILE MENU ====================

/**
 * Initialize mobile menu functionality
 */
// Flag to prevent multiple initializations
let mobileMenuInitialized = false;

function initMobileMenu() {
  // Prevent multiple initializations
  if (mobileMenuInitialized) return;

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
  const closeMobileMenu = document.getElementById("closeMobileMenu");

  if (!hamburgerBtn || !mobileMenu || !mobileMenuOverlay) return;

  // Open mobile menu
  hamburgerBtn.addEventListener("click", () => {
    mobileMenu.classList.add("open");
    mobileMenuOverlay.classList.remove("hidden");
    mobileMenuOverlay.classList.add("show");
    document.body.style.overflow = "hidden"; // Prevent scrolling
  });

  // Close mobile menu
  const closeMobileMenuHandler = () => {
    mobileMenu.classList.remove("open");
    mobileMenuOverlay.classList.remove("show");
    setTimeout(() => {
      mobileMenuOverlay.classList.add("hidden");
    }, 300);
    document.body.style.overflow = ""; // Restore scrolling
  };

  if (closeMobileMenu) {
    closeMobileMenu.addEventListener("click", closeMobileMenuHandler);
  }

  mobileMenuOverlay.addEventListener("click", closeMobileMenuHandler);

  // Close menu when clicking on a nav link
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setTimeout(closeMobileMenuHandler, 200);
    });
  });

  // Mark as initialized
  mobileMenuInitialized = true;
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

  // Initialize mobile menu
  initMobileMenu();

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
  serviceName: null,
  validatedCoupon: null,
  price: 0,
  discountAmount: 0,
  finalPrice: 0,
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
 * Format date to Indonesian format
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
function formatDateIndo(dateStr) {
  if (!dateStr) return "";

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const date = new Date(dateStr + "T00:00:00");
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${month} ${year}`;
}

/**
 * Update booking summary display
 */
function updateBookingSummary() {
  const summaryEl = document.getElementById("summary");
  if (!summaryEl) return;

  const branch = document.getElementById("branch")?.value || "";
  const practitioner = document.getElementById("pract")?.value || "";
  const dateRaw = document.getElementById("date")?.value || "";
  const dateFormatted = dateRaw ? formatDateIndo(dateRaw) : "(belum dipilih)";
  const mode = document.getElementById("mode")?.value || "";
  const time = bookingState.selectedTime || "(belum dipilih)";
  const service = bookingState.serviceName || "(belum dipilih)";

  summaryEl.innerHTML = `
    <div class="grid md:grid-cols-2 gap-3">
      <div class="summary-card">
        <b>Layanan</b>
        <div class="opacity-80">${escapeHtml(service)}</div>
      </div>
      <div class="summary-card">
        <b>Mode</b>
        <div class="opacity-80">${escapeHtml(mode)}</div>
      </div>
      <div class="summary-card">
        <b>Cabang</b>
        <div class="opacity-80">${escapeHtml(branch)}</div>
      </div>
      <div class="summary-card">
        <b>Tanggal</b>
        <div class="opacity-80">${dateFormatted}</div>
      </div>
      <div class="summary-card">
        <b>Praktisi</b>
        <div class="opacity-80">${escapeHtml(practitioner)}</div>
      </div>
      <div class="summary-card">
        <b>Jam</b>
        <div class="opacity-80">${time}</div>
      </div>
    </div>
  `;
}

/**
 * Confirm booking and save to database
 */
async function confirmBooking() {
  updateBookingSummary();

  // Validasi data pribadi
  const customerName = document.getElementById("customerName")?.value.trim();
  const customerPhone = document.getElementById("customerPhone")?.value.trim();
  const customerAge = document.getElementById("customerAge")?.value;
  const customerGender = document.getElementById("customerGender")?.value;
  const customerAddress = document
    .getElementById("customerAddress")
    ?.value.trim();

  if (
    !customerName ||
    !customerPhone ||
    !customerAge ||
    !customerGender ||
    !customerAddress
  ) {
    alert(
      "⚠️ Mohon lengkapi semua data pribadi yang bertanda * (wajib diisi)."
    );
    return;
  }

  // Validasi nomor HP format Indonesia
  const phoneRegex = /^(08|\+?628)[0-9]{8,13}$/;
  if (!phoneRegex.test(customerPhone.replace(/[\s-]/g, ""))) {
    alert(
      "⚠️ Format nomor HP tidak valid. Gunakan format: 08xx-xxxx-xxxx atau +628xx-xxxx-xxxx"
    );
    return;
  }

  // Validasi umur
  if (customerAge < 1 || customerAge > 150) {
    alert("⚠️ Umur tidak valid. Masukkan umur antara 1-150 tahun.");
    return;
  }

  // Validasi data booking
  const dateRaw = document.getElementById("date")?.value;
  if (!dateRaw || !bookingState.selectedTime) {
    alert("⚠️ Pilih tanggal dan jam terlebih dahulu.");
    return;
  }

  // Get form values
  const branch = document.getElementById("branch")?.value || "";
  const practitioner = document.getElementById("pract")?.value || "";
  const mode = document.getElementById("mode")?.value || "";
  const time = bookingState.selectedTime;
  const service = bookingState.serviceName || "";
  const promoCode =
    document.getElementById("promoCode")?.value.trim().toUpperCase() || "";

  // Save to database
  const saved = await saveBookingToDatabase();

  if (saved) {
    alert(
      `✅ Booking berhasil disimpan!\n\n` +
        `Halo ${customerName},\n` +
        `Booking Anda untuk ${service} telah tersimpan.\n\n` +
        `Admin kami akan segera menghubungi Anda di ${customerPhone} untuk konfirmasi jadwal.\n\n` +
        `Terima kasih! 🙏`
    );

    // Reset form setelah sukses
    resetBookingForm();

    // Clear data pribadi
    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("customerAge").value = "";
    document.getElementById("customerGender").value = "";
    document.getElementById("customerAddress").value = "";
    document.getElementById("promoCode").value = "";

    // Hide promo result
    const promoResult = document.getElementById("promoResult");
    if (promoResult) {
      promoResult.classList.add("hidden");
    }
  } else {
    alert(
      `❌ Gagal menyimpan booking.\n\n` +
        `Mohon coba lagi atau hubungi admin kami jika masalah berlanjut.`
    );
  }
}

// Validate promo code
async function validatePromoCode() {
  const promoCodeInput = document.getElementById("promoCode");
  const promoResult = document.getElementById("promoResult");
  const code = promoCodeInput?.value.trim();

  if (!code) {
    promoResult.className = "text-sm text-slate-400";
    promoResult.textContent = "Masukkan kode promo terlebih dahulu";
    promoResult.classList.remove("hidden");
    return;
  }

  promoResult.className = "text-sm text-slate-400";
  promoResult.textContent = "Memvalidasi...";
  promoResult.classList.remove("hidden");

  try {
    const response = await fetch("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.toUpperCase() }),
    });

    const result = await response.json();

    if (result.success && result.valid) {
      promoResult.className =
        "text-sm text-emerald-400 bg-emerald-900/20 p-3 rounded-lg";
      promoResult.innerHTML = `
        <div class="flex items-center gap-2 mb-1">
          <i data-lucide="check-circle" class="w-4 h-4"></i>
          <b>Kode promo valid!</b>
        </div>
        <div class="text-xs opacity-80">${escapeHtml(
          result.data.description || ""
        )}</div>
        <div class="mt-1">
          Diskon: <b>${
            result.data.discountType === "percentage"
              ? result.data.discountValue + "%"
              : "Rp " + result.data.discountValue.toLocaleString()
          }</b>
        </div>
      `;

      // Refresh icons
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }

      // Store validated coupon
      bookingState.validatedCoupon = result.data;

      // Update price display with discount
      updatePriceDisplay();
    } else {
      promoResult.className =
        "text-sm text-red-400 bg-red-900/20 p-3 rounded-lg";
      promoResult.innerHTML = `
        <div class="flex items-center gap-2">
          <i data-lucide="x-circle" class="w-4 h-4"></i>
          <span>${escapeHtml(result.error || "Kode promo tidak valid")}</span>
        </div>
      `;

      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }

      bookingState.validatedCoupon = null;

      // Update price display (remove discount)
      updatePriceDisplay();
    }
  } catch (error) {
    console.error("Error validating promo:", error);
    promoResult.className = "text-sm text-red-400 bg-red-900/20 p-3 rounded-lg";
    promoResult.textContent =
      "Gagal memvalidasi kode promo. Pastikan server backend berjalan.";
    bookingState.validatedCoupon = null;

    // Update price display (remove discount)
    updatePriceDisplay();
  }

  promoResult.classList.remove("hidden");
}

// Save booking to database
async function saveBookingToDatabase() {
  // Get customer data
  const customerName =
    document.getElementById("customerName")?.value.trim() || "";
  const customerPhone =
    document.getElementById("customerPhone")?.value.trim() || "";
  const customerAge = document.getElementById("customerAge")?.value;
  const customerGender = document.getElementById("customerGender")?.value || "";
  const customerAddress =
    document.getElementById("customerAddress")?.value.trim() || "";

  // Get booking data
  const dateRaw = document.getElementById("date")?.value;
  const branch = document.getElementById("branch")?.value || "";
  const practitioner = document.getElementById("pract")?.value || "";
  const mode = document.getElementById("mode")?.value || "";
  const promoCode =
    document.getElementById("promoCode")?.value.trim().toUpperCase() || null;
  const time = bookingState.selectedTime;
  const service = bookingState.serviceName || "";

  if (
    !dateRaw ||
    !time ||
    !customerName ||
    !customerPhone ||
    !customerAge ||
    !customerGender ||
    !customerAddress
  ) {
    return false;
  }

  // Extract mode value (remove text in parentheses)
  const modeValue = mode.toLowerCase().includes("online")
    ? "online"
    : "offline";

  try {
    const response = await fetch("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceName: service,
        branch: branch,
        practitioner: practitioner,
        date: dateRaw,
        time: time,
        mode: modeValue,
        promoCode: promoCode,
        customerName: customerName,
        customerPhone: customerPhone,
        customerAge: parseInt(customerAge),
        customerGender: customerGender,
        customerAddress: customerAddress,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Booking berhasil disimpan ke database:", result.data);
      return true;
    } else {
      console.error("❌ Gagal menyimpan booking:", result.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Error saat menyimpan booking:", error);
    return false;
  }
}

/**
 * Reset booking form
 */
// Load service price from API
async function loadServicePrice(serviceName) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/bookings/prices/${encodeURIComponent(
        serviceName
      )}`
    );
    const result = await response.json();

    if (result.success) {
      bookingState.price = result.data.price;
      updatePriceDisplay();
    } else {
      console.error("Failed to load price:", result.error);
      bookingState.price = 0;
    }
  } catch (error) {
    console.error("Error loading service price:", error);
    bookingState.price = 0;
  }
}

// Update price display with discount calculation
function updatePriceDisplay() {
  const priceSummary = document.getElementById("priceSummary");
  const displayPrice = document.getElementById("displayPrice");
  const discountRow = document.getElementById("discountRow");
  const displayDiscount = document.getElementById("displayDiscount");
  const displayFinalPrice = document.getElementById("displayFinalPrice");

  if (!bookingState.price || bookingState.price === 0) {
    priceSummary?.classList.add("hidden");
    return;
  }

  // Show price summary
  priceSummary?.classList.remove("hidden");

  // Format price
  const formattedPrice = new Intl.NumberFormat("id-ID").format(
    bookingState.price
  );
  displayPrice.textContent = `Rp ${formattedPrice}`;

  // Calculate discount if coupon is validated
  let discountAmount = 0;
  let finalPrice = bookingState.price;

  if (bookingState.validatedCoupon) {
    const coupon = bookingState.validatedCoupon;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round(
        (bookingState.price * coupon.discountValue) / 100
      );
    } else {
      discountAmount = coupon.discountValue;
    }
    finalPrice = Math.max(0, bookingState.price - discountAmount);

    // Show discount row
    discountRow?.classList.remove("hidden");
    const formattedDiscount = new Intl.NumberFormat("id-ID").format(
      discountAmount
    );
    displayDiscount.textContent = `- Rp ${formattedDiscount}`;
  } else {
    // Hide discount row
    discountRow?.classList.add("hidden");
  }

  // Display final price
  const formattedFinalPrice = new Intl.NumberFormat("id-ID").format(finalPrice);
  displayFinalPrice.textContent = `Rp ${formattedFinalPrice}`;

  // Store for later use
  bookingState.discountAmount = discountAmount;
  bookingState.finalPrice = finalPrice;
}

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
  // Read service parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get("service");
  if (serviceParam) {
    bookingState.serviceName = decodeURIComponent(serviceParam);

    // Show service indicator
    const serviceIndicator = document.getElementById("serviceIndicator");
    const serviceIndicatorText = document.getElementById(
      "serviceIndicatorText"
    );
    if (serviceIndicator && serviceIndicatorText) {
      serviceIndicatorText.textContent = bookingState.serviceName;
      serviceIndicator.classList.remove("hidden");
    }

    // Load and display price
    loadServicePrice(bookingState.serviceName);
  }

  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Initialize date picker with minimum date as today
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    dateInput.setAttribute("min", todayStr);

    // Set max date to 3 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const maxYear = maxDate.getFullYear();
    const maxMonth = String(maxDate.getMonth() + 1).padStart(2, "0");
    const maxDay = String(maxDate.getDate()).padStart(2, "0");
    const maxDateStr = `${maxYear}-${maxMonth}-${maxDay}`;

    dateInput.setAttribute("max", maxDateStr);
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

  // Validate promo button
  const validatePromoBtn = document.getElementById("btnValidatePromo");
  if (validatePromoBtn) {
    validatePromoBtn.addEventListener("click", validatePromoCode);
  }

  // Update summary when form fields change
  const formFields = ["branch", "pract", "date", "mode"];
  formFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("change", updateBookingSummary);
    }
  });

  // Initialize mobile menu
  initMobileMenu();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

// ==================== EVENTS PAGE FUNCTIONS ====================

/**
 * Events data
 */
const EVENTS_DATA = [
  {
    title: "Cara Hidup Rasulullah – Pagi Sehat",
    mode: "online",
    topic: "quranic",
    date: "2025-11-05 19:30",
    host: "Ust. Malik & dr. Aisyah",
    brief: "Ritme ibadah, tidur, hidrasi, dan sarapan Qur'ani.",
  },
  {
    title: "Cold-Pressed & Biomolekul Antioksidan",
    mode: "offline",
    topic: "nutrition",
    date: "2025-11-09 10:00",
    host: "Praktisi Docterbee",
    brief: "Praktik memilih bahan lokal & demo pressing.",
  },
  {
    title: "Puasa, Autofagi, & Metabolisme",
    mode: "online",
    topic: "science",
    date: "2025-11-12 19:30",
    host: "dr. Fawwaz",
    brief: "Efek puasa pada perbaikan sel & sensitivitas insulin.",
  },
  {
    title: "Parenting Qur'ani Anti-Stres",
    mode: "offline",
    topic: "parenting",
    date: "2025-11-16 09:00",
    host: "Psikolog Docterbee",
    brief: "Emotional regulation & rutinitas keluarga.",
  },
  {
    title: "Produktivitas & Shalat Tepat Waktu",
    mode: "online",
    topic: "productivity",
    date: "2025-11-19 20:00",
    host: "Coach Docterbee",
    brief: "Timeboxing, fokus, dan dzikir kerja.",
  },
];

/**
 * Render events based on filters
 */
async function renderEvents() {
  const modeFilter = document.getElementById("eventMode")?.value || "all";
  const topicFilter = document.getElementById("eventTopic")?.value || "all";
  const eventsContainer = document.getElementById("events");

  if (!eventsContainer) return;

  eventsContainer.innerHTML =
    '<div class="col-span-2 text-center text-slate-400 p-6">Loading events...</div>';

  try {
    // Build query params
    let url = "http://localhost:3000/api/events?limit=50";
    if (modeFilter !== "all") {
      url += `&mode=${modeFilter}`;
    }
    if (topicFilter !== "all") {
      url += `&topic=${topicFilter}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    if (!result.success || result.data.length === 0) {
      eventsContainer.innerHTML =
        '<div class="col-span-2 text-center text-slate-400 p-6">Belum ada event tersedia</div>';
      return;
    }

    eventsContainer.innerHTML = "";

    result.data.forEach((event) => {
      const card = document.createElement("div");
      card.className = "event-card";

      // Format registration fee
      const feeText =
        event.registration_fee && event.registration_fee > 0
          ? `Rp ${new Intl.NumberFormat("id-ID").format(
              event.registration_fee
            )}`
          : "GRATIS";

      // Format registration deadline
      let deadlineText = "";
      if (event.registration_deadline) {
        const deadline = new Date(event.registration_deadline);
        deadlineText = `
          <div class="text-xs text-slate-900 mt-1 flex items-center gap-1">
            <i data-lucide="clock" class="w-3 h-3"></i>
            Daftar sebelum: ${deadline.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        `;
      }

      // Format location for offline events
      let locationText = "";
      if (event.mode === "offline" && event.location) {
        locationText = `
          <div class="text-xs text-slate-900 mt-1 flex items-center gap-1">
            <i data-lucide="map-pin" class="w-3 h-3 text-amber-400"></i>
            ${escapeHtml(event.location)}
          </div>
        `;
      }

      card.innerHTML = `
        <div class="text-lg font-semibold">${escapeHtml(event.title)}</div>
        <div class="text-xs text-amber-300 mt-1">${escapeHtml(
          event.mode.toUpperCase()
        )} · ${escapeHtml(event.topic)}</div>
        <div class="text-sm text-slate-900 mt-1 flex items-center gap-1">
          <i data-lucide="calendar" class="w-3 h-3"></i>
          ${formatEventDate(event.event_date)}
        </div>
        ${
          event.speaker
            ? `
          <div class="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <i data-lucide="user" class="w-3 h-3"></i>
            Pemateri: ${escapeHtml(event.speaker)}
          </div>
        `
            : ""
        }
        ${locationText}
        ${deadlineText}
        <div class="text-sm font-semibold text-amber-400 mt-2">${feeText}</div>
        <p class="text-sm text-slate-900 mt-2">${escapeHtml(
          event.description || "Event kesehatan Islami bersama Docterbee"
        )}</p>
        <div class="mt-3 flex gap-2">
          <a href="booking.html?service=${encodeURIComponent(
            event.title
          )}" class="btn-primary-sm">Daftar</a>
          ${
            event.link
              ? `<a href="${escapeHtml(
                  event.link
                )}" target="_blank" class="btn-secondary-sm">Info</a>`
              : ""
          }
        </div>
      `;
      eventsContainer.appendChild(card);

      // Re-initialize Lucide icons for the newly added card
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    });
  } catch (error) {
    console.error("Error loading events:", error);
    eventsContainer.innerHTML =
      '<div class="col-span-2 text-center text-red-400 p-6">Gagal memuat events. Pastikan server backend berjalan.</div>';
  }
}

// Helper to format event date
function formatEventDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Initialize events page
 */
function initEvents() {
  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Render events
  renderEvents();

  // Attach filter listeners
  const modeSelect = document.getElementById("eventMode");
  const topicSelect = document.getElementById("eventTopic");

  if (modeSelect) {
    modeSelect.addEventListener("change", renderEvents);
  }

  if (topicSelect) {
    topicSelect.addEventListener("change", renderEvents);
  }

  // Initialize mobile menu
  initMobileMenu();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

// ==================== INSIGHT PAGE FUNCTIONS ====================

/**
 * Insight articles data
 */
const INSIGHT_DATA = [
  {
    title: "Madu 3–5mm & Autofagi",
    tag: "Sains · Nutrisi",
    brief:
      "Bagaimana komponen bioaktif madu mikro mendukung proses perbaikan sel.",
  },
  {
    title: "Puasa Senin-Kamis & Metabolisme",
    tag: "Ibadah · Sains",
    brief: "Efek puasa terhadap sensitivitas insulin & hormon lapar.",
  },
  {
    title: "Shalat Tepat Waktu & Stres",
    tag: "Ibadah · Kebiasaan",
    brief: "Hubungan ritme ibadah dan stabilitas sistem limbik.",
  },
  {
    title: "Batasi Gula Tambahan",
    tag: "Nutrisi · Kebiasaan",
    brief: "Mengapa gula rafinasi menaikkan inflamasi sistemik.",
  },
];

/**
 * Render insight articles
 */
async function renderInsightArticles() {
  const articlesContainer = document.getElementById("articles");
  if (!articlesContainer) return;

  articlesContainer.innerHTML =
    '<div class="col-span-3 text-center text-slate-400 p-6">Loading articles...</div>';

  try {
    const response = await fetch("http://localhost:3000/api/insight?limit=20");
    const result = await response.json();

    if (!result.success || result.data.length === 0) {
      articlesContainer.innerHTML =
        '<div class="col-span-3 text-center text-slate-400 p-6">Belum ada artikel tersedia</div>';
      return;
    }

    articlesContainer.innerHTML = "";

    result.data.forEach((article) => {
      const card = document.createElement("div");
      card.className = "article-card";
      card.innerHTML = `
        <div class="text-lg font-semibold">${escapeHtml(article.title)}</div>
        <div class="text-xs text-amber-500 mt-1 font-medium">${escapeHtml(
          article.tags || "Article"
        )}</div>
        <p class="text-sm text-slate-900 mt-2">${escapeHtml(
          article.excerpt || article.content.substring(0, 150) + "..."
        )}</p>
        <div class="mt-3 flex gap-2">
          <button onclick="summarizeArticleById('${escapeHtml(
            article.slug
          )}')" class="btn-primary-sm">Ringkas & Rekomendasi</button>
        </div>
      `;
      articlesContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading articles:", error);
    articlesContainer.innerHTML =
      '<div class="col-span-3 text-center text-red-400 p-6">Gagal memuat articles. Pastikan server backend berjalan.</div>';
  }
}

/**
 * Summarize article with NBSN recommendations
 * @param {number} index - Article index
 */
function summarizeArticle(index) {
  const article = INSIGHT_DATA[index];
  const resultContainer = document.getElementById("insightResult");

  if (!resultContainer) return;

  const nbsnHTML = `
    <div class="grid md:grid-cols-2 gap-4">
      <div class="nbsn-card">
        <div class="font-semibold mb-1">Ringkasan</div>
        <p class="text-slate-200/85">${escapeHtml(article.brief)}</p>
      </div>
      <div class="nbsn-card">
        <div class="font-semibold mb-1">Rekomendasi NBSN</div>
        <ul class="list-disc pl-5 text-slate-200/85">
          <li><b>Neuron:</b> catat emosi & syukur harian.</li>
          <li><b>Biomolekul:</b> madu murni 1–2 sdm/hari, hidrasi cukup.</li>
          <li><b>Sensorik:</b> tidur 7–8 jam, paparan matahari pagi.</li>
          <li><b>Nature:</b> puasa sunnah & kurangi gula rafinasi.</li>
        </ul>
      </div>
    </div>
  `;

  resultContainer.innerHTML = nbsnHTML;

  // Add points for reading insight
  addPoints(2);
}

// Summarize article by slug (load from API)
async function summarizeArticleById(slug) {
  const resultContainer = document.getElementById("insightResult");

  if (!resultContainer) return;

  resultContainer.innerHTML =
    '<p class="text-slate-400">Loading article...</p>';

  try {
    const response = await fetch(`http://localhost:3000/api/insight/${slug}`);
    const result = await response.json();

    if (!result.success) {
      resultContainer.innerHTML =
        '<p class="text-red-400">Artikel tidak ditemukan</p>';
      return;
    }

    const article = result.data;

    const nbsnHTML = `
      <div class="grid md:grid-cols-2 gap-4">
        <div class="nbsn-card">
          <div class="font-semibold mb-1">Ringkasan</div>
          <p class="text-slate-200/85">${markdownToHtml(
            article.excerpt || article.content.substring(0, 300) + "..."
          )}</p>
        </div>
        <div class="nbsn-card">
          <div class="font-semibold mb-1">Rekomendasi NBSN</div>
          <ul class="list-disc pl-5 text-slate-200/85">
            <li><b>Neuron:</b> catat emosi & syukur harian.</li>
            <li><b>Biomolekul:</b> madu murni 1–2 sdm/hari, hidrasi cukup.</li>
            <li><b>Sensorik:</b> tidur 7–8 jam, paparan matahari pagi.</li>
            <li><b>Nature:</b> puasa sunnah & kurangi gula rafinasi.</li>
          </ul>
        </div>
      </div>
    `;

    resultContainer.innerHTML = nbsnHTML;

    // Add points for reading insight
    addPoints(2);
  } catch (error) {
    console.error("Error loading article:", error);
    resultContainer.innerHTML =
      '<p class="text-red-400">Gagal memuat artikel</p>';
  }
}

/**
 * Initialize insight page
 */
function initInsight() {
  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Render articles
  renderInsightArticles();

  // Initialize mobile menu
  initMobileMenu();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

// ==================== MEDIA PAGE FUNCTIONS ====================

/**
 * Podcast data
 */
const PODCAST_DATA = [
  {
    title: "Cara Hidup Rasulullah – Subuh Routine",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "Tadabbur Al-Qur'an – QS. Al-Mulk",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    title: "Obat dalam Sunnah – Madu & Habbatussauda",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    title: "Science by Docterbee – Autofagi & Puasa",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
];

/**
 * Render podcast list
 */
function renderPodcastList() {
  const podcastList = document.getElementById("podcastList");
  if (!podcastList) return;

  podcastList.innerHTML = "";

  PODCAST_DATA.forEach((podcast) => {
    const button = document.createElement("button");
    button.className = "podcast-item";
    button.textContent = podcast.title;
    button.addEventListener("click", () =>
      playPodcast(podcast.title, podcast.url)
    );
    podcastList.appendChild(button);
  });
}

/**
 * Play podcast
 * @param {string} title - Podcast title
 * @param {string} url - Podcast URL
 */
function playPodcast(title, url) {
  // Update both nowPlaying displays (YouTube section and Podcast section)
  const nowPlaying = document.getElementById("nowPlaying");
  const nowPlayingPodcast = document.getElementById("nowPlayingPodcast");

  if (nowPlaying) {
    nowPlaying.textContent = title;
  }
  if (nowPlayingPodcast) {
    nowPlayingPodcast.textContent = title;
  }

  // Update both audio players (keep them in sync)
  const audioPlayer = document.getElementById("audioPlayer");
  const audioPlayerPodcast = document.getElementById("audioPlayerPodcast");

  if (audioPlayer) {
    audioPlayer.src = url;
    audioPlayer.play().catch(() => {
      console.log("Audio autoplay prevented");
    });
  }

  if (audioPlayerPodcast) {
    audioPlayerPodcast.src = url;
    audioPlayerPodcast.play().catch(() => {
      console.log("Audio autoplay prevented");
    });
  }
}

/**
 * Load YouTube video
 */
function loadYouTube() {
  const ytUrl = document.getElementById("ytUrl")?.value.trim();
  const ytPlayer = document.getElementById("ytPlayer");

  if (!ytPlayer) return;

  if (!ytUrl) {
    ytPlayer.innerHTML =
      '<div class="p-6 text-center text-slate-400">Masukkan URL YouTube terlebih dahulu.</div>';
    return;
  }

  // Extract video ID from URL
  const videoId = extractYouTubeId(ytUrl);

  if (!videoId) {
    ytPlayer.innerHTML =
      '<div class="p-6 text-center text-slate-400">URL tidak valid.</div>';
    return;
  }

  ytPlayer.innerHTML = `<iframe class="w-full h-full rounded-xl" src="https://www.youtube.com/embed/${escapeHtml(
    videoId
  )}" title="YouTube video" allowfullscreen></iframe>`;
}

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string} Video ID or empty string
 */
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return "";
}

/**
 * Load custom audio
 */
function loadCustomAudio() {
  const customUrl = document.getElementById("customAudioUrl")?.value.trim();

  if (!customUrl) {
    alert("Tempel URL .mp3 terlebih dahulu.");
    return;
  }

  playPodcast("Custom Audio", customUrl);
}

/**
 * Check if transcript is available for YouTube video
 */
async function checkTranscript() {
  const youtubeUrl = document.getElementById("ytUrl")?.value || "";
  const btnCheck = document.getElementById("btnCheckTranscript");
  const transcriptStatus = document.getElementById("transcriptStatus");

  if (!youtubeUrl) {
    alert("Masukkan URL YouTube terlebih dahulu.");
    return;
  }

  // Show loading
  if (btnCheck) {
    btnCheck.disabled = true;
    btnCheck.innerHTML =
      '<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Checking...';
    lucide.createIcons();
  }

  if (transcriptStatus) {
    transcriptStatus.innerHTML = `
      <div class="flex items-center gap-2 text-slate-400 text-sm">
        <i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>
        <span>Memeriksa ketersediaan transcript...</span>
      </div>
    `;
    lucide.createIcons();
  }

  try {
    const response = await fetch("http://localhost:3000/api/check-transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeUrl }),
    });

    const data = await response.json();

    if (transcriptStatus) {
      if (data.available) {
        // ✅ Transcript available
        transcriptStatus.innerHTML = `
          <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
            <div class="flex items-start gap-2">
              <i data-lucide="check-circle" class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5"></i>
              <div class="flex-1">
                <div class="font-medium text-emerald-300 mb-1">✅ Transcript Tersedia!</div>
                <div class="text-sm text-slate-300">${data.message}</div>
                <div class="text-xs text-slate-400 mt-1">
                  ${
                    data.segmentCount
                  } segmen • ${data.characterCount.toLocaleString()} karakter
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // ❌ Transcript not available
        transcriptStatus.innerHTML = `
          <div class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <div class="flex items-start gap-2">
              <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"></i>
              <div class="flex-1">
                <div class="font-medium text-amber-300 mb-1">⚠️ Transcript Tidak Tersedia</div>
                <div class="text-sm text-slate-300 whitespace-pre-line">${data.message}</div>
              </div>
            </div>
          </div>
        `;
      }
      lucide.createIcons();
    }
  } catch (error) {
    console.error("Error checking transcript:", error);
    if (transcriptStatus) {
      transcriptStatus.innerHTML = `
        <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div class="flex items-start gap-2">
            <i data-lucide="x-circle" class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"></i>
            <div class="flex-1">
              <div class="font-medium text-red-300 mb-1">❌ Error</div>
              <div class="text-sm text-slate-300">Gagal memeriksa transcript: ${error.message}</div>
            </div>
          </div>
        </div>
      `;
      lucide.createIcons();
    }
  } finally {
    // Reset button
    if (btnCheck) {
      btnCheck.disabled = false;
      btnCheck.innerHTML =
        '<i data-lucide="search" class="w-3 h-3"></i> Check Transcript';
      lucide.createIcons();
    }
  }
}

/**
 * Analyze media content with AI using Gemini API
 */
async function analyzeMedia() {
  const youtubeUrl = document.getElementById("ytUrl")?.value || "";
  const notes = document.getElementById("mediaNotes")?.value || "";
  const aiResult = document.getElementById("aiResult");
  const btnAnalyze = document.getElementById("btnAnalyze");
  const mediaNotes = document.getElementById("mediaNotes");

  if (!aiResult) return;

  // Validation
  if (!youtubeUrl && !notes) {
    alert("Masukkan URL YouTube atau catatan terlebih dahulu.");
    return;
  }

  // Auto-fetch transcript message
  if (youtubeUrl && !notes) {
    if (mediaNotes) {
      mediaNotes.value = "Mengambil transcript otomatis...";
      mediaNotes.disabled = true;
    }
  }

  // Show loading state
  if (btnAnalyze) {
    btnAnalyze.disabled = true;
    btnAnalyze.innerHTML =
      '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Menganalisis...';
    lucide.createIcons();
  }

  aiResult.innerHTML = `
    <div class="ai-analysis-card text-center">
      <i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400"></i>
      <p class="text-slate-300">
        ${
          youtubeUrl && !notes
            ? "Mengambil transcript YouTube..."
            : "Menganalisis dengan Gemini AI..."
        }
      </p>
      <p class="text-xs text-slate-500 mt-2">Mohon tunggu 5-15 detik</p>
    </div>
  `;
  lucide.createIcons();

  try {
    // Debug: Log what we're sending
    console.log("📤 Sending to backend:", {
      youtubeUrl: youtubeUrl || "(empty)",
      notes: notes ? notes.substring(0, 50) + "..." : "(empty)",
      notesLength: notes.length,
    });

    // Call backend API
    const response = await fetch("http://localhost:3000/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        youtubeUrl: youtubeUrl,
        notes: notes,
      }),
    });

    const data = await response.json();

    // Debug: Log response
    console.log("📥 Response from backend:", {
      ok: response.ok,
      status: response.status,
      hasTranscript: data.hasTranscript,
      source: data.source,
      transcriptLength: data.transcriptLength,
    });

    if (!response.ok) {
      // Re-enable textarea if transcript fetch failed
      if (mediaNotes) {
        mediaNotes.disabled = false;
        if (data.transcriptError) {
          mediaNotes.value = "";
          mediaNotes.placeholder =
            "⚠️ Transcript tidak tersedia untuk video ini. Silakan tulis catatan/ringkasan video secara manual...";

          // Show alert to user
          alert(
            "Transcript YouTube tidak tersedia untuk video ini.\n\n" +
              "Solusi:\n" +
              "1. Tonton video dan tulis ringkasan di kolom 'Catatan'\n" +
              "2. Atau cari video lain yang memiliki subtitle/CC\n\n" +
              "Error: " +
              data.transcriptError
          );
        }
      }
      throw new Error(data.error || "Gagal menganalisis konten");
    }

    // Re-enable textarea and show transcript source info
    if (mediaNotes) {
      mediaNotes.disabled = false;
      if (data.hasTranscript && !notes) {
        // If auto-transcript was used, show it in textarea
        mediaNotes.value = `✅ Transcript otomatis diambil (${data.transcriptLength} karakter)\n\nAnda bisa edit atau tambahkan catatan di sini...`;
      }
    }

    // Display AI summary with metadata
    const formattedSummary = formatAISummary(data.summary, data);
    aiResult.innerHTML = formattedSummary;

    // Re-initialize Lucide icons
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }

    // Add points for successful analysis
    addPoints(3);
  } catch (error) {
    console.error("Gemini API error:", error);

    // Check if it's a quota error
    const isQuotaError =
      error.message.includes("Kuota") ||
      error.message.includes("quota") ||
      error.message.includes("429");

    // Show error with troubleshooting
    aiResult.innerHTML = `
      <div class="ai-analysis-card border-${
        isQuotaError ? "amber" : "red"
      }-500/30">
        <div class="font-semibold mb-2 flex items-center gap-2 text-${
          isQuotaError ? "amber" : "red"
        }-400">
          <i data-lucide="${
            isQuotaError ? "clock" : "alert-triangle"
          }" class="w-5 h-5"></i>
          ${isQuotaError ? "Kuota API Tercapai" : "Gagal Menganalisis"}
        </div>
        <p class="text-slate-300 mb-3">${escapeHtml(error.message)}</p>
        <div class="text-sm text-slate-400">
          <p class="font-semibold mb-1">${
            isQuotaError ? "Solusi" : "Troubleshooting"
          }:</p>
          <ul class="list-disc pl-5 space-y-1">
            ${
              isQuotaError
                ? `
              <li><b>Tunggu 1-2 menit</b> lalu coba lagi (Free tier: 15 requests/menit)</li>
              <li>Refresh halaman ini setelah menunggu</li>
              <li>Atau upgrade ke <a href="https://ai.google.dev/pricing" target="_blank" class="text-amber-400 underline">paid plan</a> untuk quota lebih besar</li>
            `
                : `
              <li>Pastikan server backend berjalan: <code class="bg-slate-700 px-1 rounded">npm start</code></li>
              <li>Cek koneksi ke <code class="bg-slate-700 px-1 rounded">http://localhost:3000</code></li>
              <li>Periksa API key Gemini di file <code class="bg-slate-700 px-1 rounded">.env</code></li>
              <li>Lihat console browser (F12) untuk detail error</li>
            `
            }
          </ul>
        </div>
      </div>
    `;

    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  } finally {
    // Reset button state
    if (btnAnalyze) {
      btnAnalyze.disabled = false;
      btnAnalyze.innerHTML =
        '<i data-lucide="sparkles" class="w-4 h-4"></i> Analisis AI';
      lucide.createIcons();
    }

    // Re-enable textarea
    if (mediaNotes && mediaNotes.disabled) {
      mediaNotes.disabled = false;
    }
  }
}

/**
 * Format AI summary from Gemini API response to styled HTML
 */
/**
 * Convert markdown formatting to HTML
 */
function markdownToHtml(text) {
  if (!text) return "";

  // Escape HTML first
  let html = escapeHtml(text);

  // Convert **bold** to <strong>
  html = html.replace(
    /\*\*(.+?)\*\*/g,
    "<strong class='font-semibold text-slate-100'>$1</strong>"
  );

  // Convert *italic* to <em> (only if not part of **bold**)
  html = html.replace(
    /(?<!\*)\*([^*]+?)\*(?!\*)/g,
    "<em class='italic text-slate-200'>$1</em>"
  );

  // Convert `code` to <code>
  html = html.replace(
    /`(.+?)`/g,
    "<code class='px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 text-sm font-mono'>$1</code>"
  );

  return html;
}

function formatAISummary(text, metadata = {}) {
  if (!text) return "<p class='text-slate-400'>Tidak ada hasil analisis.</p>";

  // Add metadata badge if available
  let metadataBadge = "";
  if (metadata.source) {
    const sourceLabel =
      metadata.source === "auto-transcript"
        ? "✨ Auto Transcript"
        : "📝 User Notes";
    const sourceColor =
      metadata.source === "auto-transcript"
        ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-300"
        : "bg-sky-400/10 border-sky-400/30 text-sky-300";

    metadataBadge = `
      <div class="mb-4 inline-flex items-center gap-2 ${sourceColor} border rounded-lg px-3 py-1.5 text-xs">
        <i data-lucide="${
          metadata.source === "auto-transcript" ? "sparkles" : "file-text"
        }" class="w-3 h-3"></i>
        <span>${sourceLabel}</span>
        ${
          metadata.transcriptLength
            ? `<span class="opacity-70">(${metadata.transcriptLength} karakter)</span>`
            : ""
        }
      </div>
    `;
  }

  // Split into sections (assuming Gemini returns structured text)
  const lines = text.split("\n").filter((line) => line.trim());

  let html = metadataBadge + '<div class="space-y-4">';
  let currentSection = "";
  let currentList = [];

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Detect section headers (bold text with **)
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      // Close previous section
      if (currentList.length > 0) {
        html += `<ul class="list-disc pl-5 text-slate-200/85">${currentList.join(
          ""
        )}</ul>`;
        currentList = [];
      }

      // Add new section header
      const headerText = trimmed.replace(/\*\*/g, "");
      let iconName = "info";
      let iconColor = "text-sky-400";

      if (headerText.includes("Selaras") || headerText.includes("selaras")) {
        iconName = "check-circle";
        iconColor = "text-emerald-400";
      } else if (
        headerText.includes("Koreksi") ||
        headerText.includes("koreksi")
      ) {
        iconName = "alert-circle";
        iconColor = "text-amber-400";
      } else if (headerText.includes("Sains") || headerText.includes("sains")) {
        iconName = "flask-conical";
        iconColor = "text-sky-400";
      } else if (headerText.includes("NBSN")) {
        iconName = "brain";
        iconColor = "text-purple-400";
      }

      html += `
        <div class="ai-analysis-card">
          <div class="font-semibold mb-2 flex items-center gap-2">
            <i data-lucide="${iconName}" class="w-4 h-4 ${iconColor}"></i>
            ${escapeHtml(headerText)}
          </div>
      `;
      currentSection = headerText;
    }
    // Detect numbered lists (1. 2. 3.)
    else if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s/, "");
      currentList.push(`<li>${markdownToHtml(content)}</li>`);
    }
    // Detect bullet points (- or *)
    else if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const content = trimmed.substring(1).trim();
      currentList.push(`<li>${markdownToHtml(content)}</li>`);
    }
    // Regular paragraph
    else if (trimmed) {
      if (currentList.length > 0) {
        html += `<ul class="list-disc pl-5 text-slate-200/85">${currentList.join(
          ""
        )}</ul>`;
        currentList = [];
      }
      html += `<p class="text-slate-200/85">${markdownToHtml(trimmed)}</p>`;
    }
  });

  // Close remaining list
  if (currentList.length > 0) {
    html += `<ul class="list-disc pl-5 text-slate-200/85">${currentList.join(
      ""
    )}</ul>`;
  }

  // Close last section
  if (currentSection) {
    html += "</div>";
  }

  html += "</div>";

  return html;
}

/**
 * Initialize media page
 */
/**
 * Switch between YouTube & AI and Podcast tabs
 */
function switchTab(tab) {
  const sectionYouTube = document.getElementById("sectionYouTube");
  const sectionPodcast = document.getElementById("sectionPodcast");
  const aiResultSection = document.getElementById("aiResultSection");
  const tabYouTube = document.getElementById("tabYouTube");
  const tabPodcast = document.getElementById("tabPodcast");

  if (tab === "youtube") {
    // Show YouTube & AI section
    sectionYouTube.classList.remove("hidden");
    aiResultSection.classList.remove("hidden");
    sectionPodcast.classList.add("hidden");

    // Update tab buttons - use .active class
    tabYouTube.classList.add("active");
    tabPodcast.classList.remove("active");
  } else if (tab === "podcast") {
    // Show Podcast section
    sectionYouTube.classList.add("hidden");
    aiResultSection.classList.add("hidden");
    sectionPodcast.classList.remove("hidden");

    // Update tab buttons - use .active class
    tabPodcast.classList.add("active");
    tabYouTube.classList.remove("active");
  }

  // Re-initialize Lucide icons after DOM changes
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

function initMedia() {
  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Render podcast list
  renderPodcastList();

  // Attach event listeners
  const btnLoadYT = document.getElementById("btnLoadYT");
  if (btnLoadYT) {
    btnLoadYT.addEventListener("click", loadYouTube);
  }

  const btnAnalyze = document.getElementById("btnAnalyze");
  if (btnAnalyze) {
    btnAnalyze.addEventListener("click", analyzeMedia);
  }

  const btnLoadCustomAudio = document.getElementById("btnLoadCustomAudio");
  if (btnLoadCustomAudio) {
    btnLoadCustomAudio.addEventListener("click", loadCustomAudio);
  }

  // Initialize mobile menu
  initMobileMenu();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

// ==================== SERVICES PAGE ====================

/**
 * Render services from API with filters
 */
async function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;

  // Get filter values
  const branchFilter = document.getElementById("branchFilter")?.value || "all";
  const modeFilter = document.getElementById("modeFilter")?.value || "all";

  try {
    // Build query params
    const params = new URLSearchParams();
    if (branchFilter !== "all") params.append("branch", branchFilter);
    if (modeFilter !== "all") params.append("mode", modeFilter);
    params.append("is_active", "1"); // Only show active services

    const response = await fetch(
      `http://localhost:3000/api/services?${params.toString()}`
    );
    const result = await response.json();

    if (!result.success) {
      grid.innerHTML = `
        <div class="md:col-span-2 text-center py-12">
          <p class="text-slate-400">Gagal memuat layanan</p>
        </div>
      `;
      return;
    }

    const services = result.data;

    if (services.length === 0) {
      grid.innerHTML = `
        <div class="md:col-span-2 text-center py-12">
          <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 text-slate-600"></i>
          <p class="text-slate-400">Tidak ada layanan yang sesuai dengan filter</p>
        </div>
      `;
      if (typeof lucide !== "undefined") lucide.createIcons();
      return;
    }

    // Render services
    grid.innerHTML = services
      .map((service) => {
        const categoryBadge = getCategoryBadgeHTML(service.category);
        const modeInfo = getModeInfoHTML(service.mode);
        const price = formatPrice(service.price);

        return `
          <div class="event-card">
            <div class="flex items-start justify-between mb-2">
              <div class="text-lg font-semibold text-slate-900">${escapeHtml(
                service.name
              )}</div>
              ${categoryBadge}
            </div>
            <p class="text-sm text-slate-900 mb-3">
              ${escapeHtml(service.description)}
            </p>
            ${
              service.practitioner
                ? `<div class="flex items-center gap-2 mb-2 text-xs text-slate-900">
                <i data-lucide="user-check" class="w-3.5 h-3.5"></i>
                <span>Praktisi: ${escapeHtml(service.practitioner)}</span>
              </div>`
                : ""
            }
            <div class="flex items-center gap-2 mb-2">
              <i data-lucide="tag" class="w-4 h-4 text-amber-400"></i>
              <span class="text-lg font-bold text-amber-500">${price}</span>
            </div>
            <div class="flex items-center gap-2 mb-2 text-xs text-slate-900">
              <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
              <span>${escapeHtml(service.branch)}</span>
            </div>
            ${modeInfo}
            <a
              href="booking.html?service=${encodeURIComponent(service.name)}"
              class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2 text-sm font-semibold hover:from-amber-500 hover:to-amber-600 transition-all shadow-sm hover:shadow-md mt-3"
            >
              <i data-lucide="calendar" class="w-4 h-4"></i>
              Booking Sekarang
            </a>
          </div>
        `;
      })
      .join("");

    // Reinitialize Lucide icons
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  } catch (error) {
    console.error("Error loading services:", error);
    grid.innerHTML = `
      <div class="md:col-span-2 text-center py-12">
        <p class="text-slate-400">Gagal memuat layanan. Silakan coba lagi.</p>
      </div>
    `;
  }
}

/**
 * Get category badge HTML
 */
function getCategoryBadgeHTML(category) {
  const badges = {
    manual:
      '<span class="text-xs rounded-full bg-amber-400/10 border border-amber-400/40 px-2 py-1 text-amber-300">Manual</span>',
    klinis:
      '<span class="text-xs rounded-full bg-sky-400/10 border border-sky-400/40 px-2 py-1 text-sky-300">Klinis</span>',
    konsultasi:
      '<span class="text-xs rounded-full bg-purple-400/10 border border-purple-400/40 px-2 py-1 text-purple-300">Konsultasi</span>',
    perawatan:
      '<span class="text-xs rounded-full bg-emerald-400/10 border border-emerald-400/40 px-2 py-1 text-emerald-300">Perawatan</span>',
  };
  return badges[category] || "";
}

/**
 * Get mode info HTML
 */
function getModeInfoHTML(mode) {
  const icons = {
    online: "video",
    offline: "home",
    both: "video",
  };
  const labels = {
    online: "Online",
    offline: "Offline",
    both: "Online & Offline",
  };

  return `
    <div class="flex items-center gap-2 mb-3 text-xs text-slate-900">
      <i data-lucide="${
        icons[mode] || "video"
      }" class="w-3.5 h-3.5 text-emerald-400"></i>
      <span>${labels[mode] || mode}</span>
    </div>
  `;
}

/**
 * Format price to Indonesian Rupiah
 */
function formatPrice(price) {
  return `Rp ${parseInt(price).toLocaleString("id-ID")}`;
}

/**
 * Initialize services page
 */
function initServices() {
  // Set current year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Render services
  renderServices();

  // Attach filter listeners
  const branchFilter = document.getElementById("branchFilter");
  const modeFilter = document.getElementById("modeFilter");

  if (branchFilter) {
    branchFilter.addEventListener("change", renderServices);
  }

  if (modeFilter) {
    modeFilter.addEventListener("change", renderServices);
  }

  // Initialize mobile menu
  initMobileMenu();

  // Initialize Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  // Refresh navigation points
  refreshNav();
}

// ==================== STORE / POINTS / WELLNESS PAGE ====================

// ========================================
// STORE PAGE - DOCTERBEE HEALTH STORE & CAFÉ
// ========================================

// Product catalog dengan 16 items across 8 categories
// Products data - will be loaded from API
let PRODUCTS = [];

// Location data untuk 3 branches
const LOCATIONS = [
  {
    id: "kolaka",
    name: "Docterbee Kolaka ZE Center",
    address: "Jl. DI Panjaitan No. 88, Kolaka",
    phone: "0821-8808-0688",
    hours: "08:00 - 20:00 WIB",
  },
  {
    id: "makassar",
    name: "Docterbee Makassar Pettarani",
    address: "Jl. A.P. Pettarani No. 45, Makassar",
    phone: "0821-8808-0689",
    hours: "08:00 - 21:00 WITA",
  },
  {
    id: "kendari",
    name: "Docterbee Kendari ByPass",
    address: "Jl. By Pass No. 123, Kendari",
    phone: "0821-8808-0690",
    hours: "08:00 - 20:00 WITA",
  },
];

// LocalStorage helpers for store
function _storeGet(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function _storeSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Tab switching untuk 4 sections
function showStoreTab(tabName) {
  // Hide all sections
  const sections = ["page-store", "page-dinein", "page-points", "page-locator"];
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });

  // Remove active styles dari semua tabs
  const tabs = ["tabStore", "tabDineIn", "tabPoints", "tabLocator"];
  tabs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("bg-amber-400", "text-slate-900");
      el.classList.add("bg-slate-800", "text-slate-300");
    }
  });

  // Show selected section
  const sectionMap = {
    store: "page-store",
    dinein: "page-dinein",
    points: "page-points",
    locator: "page-locator",
  };

  const tabMap = {
    store: "tabStore",
    dinein: "tabDineIn",
    points: "tabPoints",
    locator: "tabLocator",
  };

  const targetSection = document.getElementById(sectionMap[tabName]);
  const targetTab = document.getElementById(tabMap[tabName]);

  if (targetSection) targetSection.classList.remove("hidden");
  if (targetTab) {
    targetTab.classList.remove("bg-slate-800", "text-slate-300");
    targetTab.classList.add("bg-amber-400", "text-slate-900");
  }
}

// Fetch products from API
async function loadProductsFromAPI() {
  try {
    const response = await fetch("http://localhost:3000/api/products");
    const result = await response.json();

    if (result.success && result.data) {
      // Transform API data to match existing structure
      PRODUCTS = result.data.map((product) => ({
        id: product.id,
        name: product.name,
        cat: product.category, // API uses "category" field
        price: parseFloat(product.price),
        description: product.description,
        image: product.image_url,
        stock: product.stock,
      }));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error loading products:", error);
    return false;
  }
}

// Filter products by category
async function filterStoreCategory(category) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  // Show loading state
  grid.innerHTML =
    '<div class="col-span-full text-center text-slate-400 py-8">Loading products...</div>';

  // Load products if not already loaded
  if (PRODUCTS.length === 0) {
    const loaded = await loadProductsFromAPI();
    if (!loaded) {
      grid.innerHTML =
        '<div class="col-span-full text-center text-red-400 py-8">Failed to load products. Please try again.</div>';
      return;
    }
  }

  let filtered = PRODUCTS;
  if (category && category !== "all") {
    filtered = PRODUCTS.filter((p) => p.cat === category);
  }

  if (filtered.length === 0) {
    grid.innerHTML =
      '<div class="col-span-full text-center text-slate-400 py-8">Belum ada produk di kategori ini</div>';
    return;
  }

  grid.innerHTML = filtered
    .map(
      (p) => `
    <div class="event-card overflow-hidden space-y-0 p-0">
      ${
        p.image
          ? `<img src="${escapeHtml(p.image)}" 
               alt="${escapeHtml(p.name)}" 
               class="w-full h-48 object-cover"
               onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">`
          : `<div class="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-400">
               <i data-lucide="image-off" class="w-12 h-12"></i>
             </div>`
      }
      <div class="p-4 space-y-3">
        <div>
          <div class="text-xs uppercase tracking-wider text-amber-500 mb-1 font-semibold">${getCategoryLabel(
            p.cat
          )}</div>
          <div class="font-semibold text-slate-900 text-lg">${escapeHtml(
            p.name
          )}</div>
          ${
            p.description
              ? `<p class="text-sm text-slate-600 mt-1 line-clamp-2">${escapeHtml(
                  p.description
                )}</p>`
              : ""
          }
        </div>
        <div class="flex items-center justify-between">
          <div class="text-amber-500 font-bold text-lg">Rp ${p.price.toLocaleString(
            "id-ID"
          )}</div>
          ${
            p.stock > 0
              ? `<button class="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-2 text-sm font-semibold hover:from-amber-500 hover:to-amber-600 transition-all shadow-sm hover:shadow-md" onclick="addToCart('${p.id}')">
                  <i data-lucide="plus" class="w-3 h-3"></i>
                  Tambah
                </button>`
              : `<span class="text-xs text-red-500 font-semibold">Stok Habis</span>`
          }
        </div>
      </div>
    </div>
  `
    )
    .join("");

  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

function getCategoryLabel(cat) {
  const labels = {
    "Zona Sunnah": "🌙 Zona Sunnah",
    "1001 Rempah": "🧂 1001 Rempah",
    "Zona Honey": "🍯 Zona Honey",
    "Cold Pressed": "🥤 Cold Pressed",
    // Legacy support for old category names
    "zona-sunnah": "🌙 Zona Sunnah",
    rempah: "🧂 1001 Rempah",
    honey: "🍯 Zona Honey",
    "cold-pressed": "🥤 Cold Pressed",
    coffeebee: "☕ CoffeeBee",
    teabee: "🍵 TeaBee",
    "susu-kurma": "🥛 Susu Kurma",
    "buah-lokal": "🍊 Buah Lokal",
  };
  return labels[cat] || cat;
}

// Add product to cart (Updated to use store-cart.js)
function addToCart(productId) {
  // Convert productId to number if it's a string
  const numId = typeof productId === 'string' ? parseInt(productId) : productId;
  
  // Try to find product with both number and string comparison
  const product = PRODUCTS.find((p) => p.id === numId || p.id === productId || p.id == productId);
  
  // Debug log
  console.log('Looking for product ID:', productId, 'converted to:', numId);
  console.log('Product found:', product);
  console.log('PRODUCTS array:', PRODUCTS);
  console.log('Product IDs in array:', PRODUCTS.map(p => ({ id: p.id, type: typeof p.id })));
  
  if (!product) {
    console.error('Product not found with ID:', productId);
    alert('Product tidak ditemukan. ID: ' + productId);
    return;
  }

  // Call the new addToStoreCart from store-cart.js
  if (typeof window.addToStoreCart === 'function') {
    window.addToStoreCart(product.id, product.name, product.price, product.image);
  } else {
    console.error('addToStoreCart function not found');
  }

  // Show feedback
  const btn = event.target.closest("button");
  if (btn) {
    const original = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="check" class="w-3 h-3"></i> OK';
    btn.classList.add("bg-emerald-600");
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove("bg-emerald-600");
      if (typeof lucide !== "undefined" && lucide.createIcons) {
        lucide.createIcons();
      }
    }, 800);
  }
}

// Update cart display in locator section
function updateCartDisplay() {
  const cartContainer = document.getElementById("cartList");
  if (!cartContainer) return;

  const cart = _storeGet("db_cart", []);
  const cartCount = document.getElementById("cartCount");

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.classList.toggle("hidden", totalItems === 0);
  }

  if (cart.length === 0) {
    cartContainer.innerHTML =
      '<div class="text-sm text-slate-400">Keranjang masih kosong</div>';
    return;
  }

  let total = 0;
  const rows = cart
    .map((item) => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      return `
      <div class="flex items-center justify-between text-sm border-b border-slate-800 pb-2">
        <div class="flex-1">
          <div class="font-medium text-slate-200">${escapeHtml(item.name)}</div>
          <div class="text-xs text-slate-400">${
            item.qty
          } × Rp ${item.price.toLocaleString("id-ID")}</div>
        </div>
        <div class="font-semibold text-amber-300">Rp ${subtotal.toLocaleString(
          "id-ID"
        )}</div>
      </div>
    `;
    })
    .join("");

  cartContainer.innerHTML = `
    <div class="space-y-2">
      ${rows}
      <div class="flex items-center justify-between pt-2 font-bold">
        <span class="text-slate-300">Total</span>
        <span class="text-amber-300">Rp ${total.toLocaleString("id-ID")}</span>
      </div>
    </div>
  `;
}

// Update points display
function updatePointsView() {
  const data = _db("db_points");
  const points = data.value || 0;

  // Update big display in points section
  const bigPoints = document.getElementById("pointsBig");
  if (bigPoints) bigPoints.textContent = points;

  // Update mobile nav badge (cart count)
  const cart = _storeGet("db_cart", []);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const mobileBadge = document.querySelector(".mobile-cart-badge");
  if (mobileBadge) {
    mobileBadge.textContent = totalItems;
    mobileBadge.classList.toggle("hidden", totalItems === 0);
  }
}

// Add demo points for testing
function addDemoPoints(amount) {
  const data = _db("db_points");
  const newValue = (data.value || 0) + amount;
  _db("db_points", { value: newValue });
  addPoints(0); // Trigger nav refresh
  updatePointsView();
}

// Redeem rewards
function redeemReward(cost, rewardName) {
  const data = _db("db_points");
  const current = data.value || 0;

  if (current < cost) {
    alert(
      `Points kamu belum cukup. Butuh ${cost} points untuk redeem ${rewardName}.`
    );
    return;
  }

  const newValue = current - cost;
  _db("db_points", { value: newValue });
  addPoints(0); // Trigger nav refresh
  updatePointsView();
  alert(
    `Selamat! Kamu berhasil redeem ${rewardName}. Points tersisa: ${newValue}`
  );
}

// Render locations
function renderLocations() {
  const grid = document.getElementById("locationGrid");
  if (!grid) return;

  grid.innerHTML = LOCATIONS.map(
    (loc) => `
    <div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 hover:border-amber-400/50 transition-all">
      <div class="flex items-start gap-3">
        <div class="mt-1">
          <i data-lucide="map-pin" class="w-5 h-5 text-amber-500"></i>
        </div>
        <div class="flex-1">
          <div class="font-semibold text-slate-900 mb-1">${escapeHtml(
            loc.name
          )}</div>
          <div class="text-xs text-slate-900 mb-2">${escapeHtml(
            loc.address
          )}</div>
          <div class="text-xs text-slate-700 space-y-1">
            <div><i data-lucide="phone" class="w-3 h-3 inline"></i> ${escapeHtml(
              loc.phone
            )}</div>
            <div><i data-lucide="clock" class="w-3 h-3 inline"></i> ${escapeHtml(
              loc.hours
            )}</div>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn-secondary-sm flex-1" onclick="checkIn('${loc.id}')">
          <i data-lucide="map-pin-check" class="w-3 h-3"></i>
          Check-in
        </button>
        <button class="btn-primary-sm flex-1" onclick="setPickup('${loc.id}')">
          <i data-lucide="shopping-bag" class="w-3 h-3"></i>
          Pickup
        </button>
      </div>
    </div>
  `
  ).join("");

  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

// Check-in at location (earn points)
function checkIn(locationId) {
  const loc = LOCATIONS.find((l) => l.id === locationId);
  if (!loc) return;

  // Tambah 5 points untuk check-in
  addDemoPoints(5);
  alert(`Check-in berhasil di ${loc.name}! +5 points`);
}

// Set pickup location
function setPickup(locationId) {
  const loc = LOCATIONS.find((l) => l.id === locationId);
  if (!loc) return;

  _storeSet("db_pickup", loc);

  const pickupInfo = document.getElementById("pickupLocation");
  if (pickupInfo) {
    pickupInfo.innerHTML = `
      <div class="text-sm space-y-1">
        <div class="flex items-center gap-2 text-emerald-300">
          <i data-lucide="check-circle" class="w-4 h-4"></i>
          <span class="font-semibold">Pickup dipilih</span>
        </div>
        <div class="text-slate-300">${escapeHtml(loc.name)}</div>
        <div class="text-xs text-slate-400">${escapeHtml(loc.address)}</div>
      </div>
    `;
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  alert(`Lokasi pickup diset ke ${loc.name}`);
}

// Initialize store page
function initStorePage() {
  // Set tahun footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Event listener untuk category filter
  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", (e) => {
      filterStoreCategory(e.target.value);
    });
  }

  // Render initial data
  filterStoreCategory("all"); // Show all products
  renderLocations();
  updateCartDisplay();
  updatePointsView();
  showStoreTab("store"); // Default tab

  // Init mobile menu
  initMobileMenu();

  // Init Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

// ==================== APP STARTUP ====================

// Initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // Check which page we're on
    if (document.getElementById("slots")) {
      initBooking();
    } else if (document.getElementById("events")) {
      initEvents();
    } else if (document.getElementById("articles")) {
      initInsight();
    } else if (document.getElementById("ytPlayer")) {
      initMedia();
    } else if (document.getElementById("storePageRoot")) {
      initStorePage();
    } else if (document.getElementById("servicesGrid")) {
      initServices();
    } else {
      init();
    }
  });
} else {
  // Check which page we're on
  if (document.getElementById("slots")) {
    initBooking();
  } else if (document.getElementById("events")) {
    initEvents();
  } else if (document.getElementById("articles")) {
    initInsight();
  } else if (document.getElementById("ytPlayer")) {
    initMedia();
  } else if (document.getElementById("page-store")) {
    initStorePage();
  } else if (document.getElementById("servicesGrid")) {
    initServices();
  } else {
    init();
  }
}
