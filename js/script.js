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
            <div class="text-xs text-slate-400 mt-1">${escapeHtml(
              item.dalil
            )}</div>
          </div>
          <div class="text-xs ${unit.color}">Dalil · Sains · NBSN</div>
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
function initMobileMenu() {
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
    }
  } catch (error) {
    console.error("Error validating promo:", error);
    promoResult.className = "text-sm text-red-400 bg-red-900/20 p-3 rounded-lg";
    promoResult.textContent =
      "Gagal memvalidasi kode promo. Pastikan server backend berjalan.";
    bookingState.validatedCoupon = null;
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
      card.innerHTML = `
        <div class="text-lg font-semibold">${escapeHtml(event.title)}</div>
        <div class="text-xs text-amber-300 mt-1">${escapeHtml(
          event.mode.toUpperCase()
        )} · ${escapeHtml(event.topic)}</div>
        <div class="text-sm text-slate-400 mt-1">${formatEventDate(
          event.event_date
        )}</div>
        <p class="text-sm text-slate-300/85 mt-2">${escapeHtml(
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
                )}" target="_blank" class="btn-secondary-sm">Link</a>`
              : ""
          }
        </div>
      `;
      eventsContainer.appendChild(card);
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
        <div class="text-xs text-amber-300 mt-1">${escapeHtml(
          article.tags || "Article"
        )}</div>
        <p class="text-sm text-slate-300/85 mt-2">${escapeHtml(
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
          <p class="text-slate-200/85">${escapeHtml(
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
  const nowPlaying = document.getElementById("nowPlaying");
  const audioPlayer = document.getElementById("audioPlayer");

  if (nowPlaying) {
    nowPlaying.textContent = title;
  }

  if (audioPlayer) {
    audioPlayer.src = url;
    audioPlayer.play().catch(() => {
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
 * Analyze media content with AI using Gemini API
 */
async function analyzeMedia() {
  const youtubeUrl = document.getElementById("ytUrl")?.value || "";
  const notes = document.getElementById("mediaNotes")?.value || "";
  const aiResult = document.getElementById("aiResult");
  const btnAnalyze = document.getElementById("btnAnalyze");

  if (!aiResult) return;

  // Validation
  if (!youtubeUrl && !notes) {
    alert("Masukkan URL YouTube atau catatan terlebih dahulu.");
    return;
  }

  if (!notes) {
    alert("Tuliskan catatan terlebih dahulu.");
    return;
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
      <p class="text-slate-300">Menghubungi Gemini AI...</p>
    </div>
  `;
  lucide.createIcons();

  try {
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

    if (!response.ok) {
      throw new Error(data.error || "Gagal menganalisis konten");
    }

    // Display AI summary
    const formattedSummary = formatAISummary(data.summary);
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
  }
}

/**
 * Format AI summary from Gemini API response to styled HTML
 */
function formatAISummary(text) {
  if (!text) return "<p class='text-slate-400'>Tidak ada hasil analisis.</p>";

  // Split into sections (assuming Gemini returns structured text)
  const lines = text.split("\n").filter((line) => line.trim());

  let html = '<div class="space-y-4">';
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
      currentList.push(`<li>${escapeHtml(content)}</li>`);
    }
    // Detect bullet points (- or *)
    else if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const content = trimmed.substring(1).trim();
      currentList.push(`<li>${escapeHtml(content)}</li>`);
    }
    // Regular paragraph
    else if (trimmed) {
      if (currentList.length > 0) {
        html += `<ul class="list-disc pl-5 text-slate-200/85">${currentList.join(
          ""
        )}</ul>`;
        currentList = [];
      }
      html += `<p class="text-slate-200/85">${escapeHtml(trimmed)}</p>`;
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
  } else {
    init();
  }
}
