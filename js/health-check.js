/**
 * DocterBee Health Check Module
 * Handles form submission, AI integration, and result rendering
 * @module health-check
 */



// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const HEALTH_CHECK_CONFIG = {
  API_ENDPOINT: "/api/health-check-ai",
  LOADING_MIN_TIME: 800, // Minimum loading time for better UX
  SCROLL_BEHAVIOR: "smooth",
};

// Dalil database for fallback algorithm
const DALIL_DATABASE = Object.freeze([
  {
    type: "Al-Qur'an",
    ref: "QS Al-Isra' 17:82",
    text: "Dan Kami turunkan dari Al-Qur'an suatu yang menjadi penawar dan rahmat bagi orang-orang yang beriman.",
    tags: ["healing", "quran", "rahmat"],
  },
  {
    type: "Hadis",
    ref: "HR. Bukhari & Muslim",
    text: "Di dalam tubuh ada segumpal daging, jika baik maka baiklah seluruh tubuh, jika rusak maka rusaklah seluruh tubuh. Ketahuilah ia adalah hati.",
    tags: ["heart", "health", "spiritual"],
  },
  {
    type: "Al-Qur'an",
    ref: "QS Al-A'raf 7:31",
    text: "Makan dan minumlah, dan janganlah berlebih-lebihan. Sesungguhnya Allah tidak menyukai orang-orang yang berlebih-lebihan.",
    tags: ["food", "balance", "moderation", "makan"],
  },
  {
    type: "Hadis",
    ref: "HR. Tirmidzi",
    text: "Puasa adalah perisai. Apabila salah seorang dari kamu berpuasa, janganlah ia berkata kotor dan berbuat bodoh.",
    tags: ["fasting", "discipline", "shield"],
  },
  {
    type: "Al-Qur'an",
    ref: "QS Al-Baqarah 2:183",
    text: "Hai orang-orang yang beriman, diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa.",
    tags: ["fasting", "taqwa", "worship"],
  },
  {
    type: "Hadis",
    ref: "HR. Bukhari",
    text: "Kesembuhan itu ada dalam tiga hal: minum madu, bekam, dan kay (sundut api). Dan aku melarang umatku dari kay.",
    tags: ["honey", "healing", "medicine", "madu"],
  },
  {
    type: "Al-Qur'an",
    ref: "QS An-Nahl 16:69",
    text: "Dari perut lebah itu keluar minuman yang bermacam-macam warnanya, di dalamnya terdapat obat yang menyembuhkan bagi manusia.",
    tags: ["honey", "healing", "nature", "madu"],
  },
  {
    type: "Hadis",
    ref: "HR. Tirmidzi",
    text: "Tidaklah turun suatu penyakit melainkan turun pula obatnya.",
    tags: ["healing", "medicine", "hope"],
  },
  {
    type: "Hadis",
    ref: "HR. Muslim",
    text: "Sepertiga untuk makanannya, sepertiga untuk minumannya, dan sepertiga untuk napasnya.",
    tags: ["food", "moderation", "stomach", "lambung"],
  },
  {
    type: "Al-Qur'an",
    ref: "QS Al-Furqan 25:47",
    text: "Dan Dialah yang menjadikan malam untukmu sebagai pakaian, dan tidur untuk istirahat, dan Dia menjadikan siang untuk bangkit berusaha.",
    tags: ["sleep", "rest", "night", "tidur"],
  },
]);

// ============================================
// DOM ELEMENTS
// ============================================

let formElements = null;
let resultElements = null;

/**
 * Initialize DOM element references
 * Called once when module loads
 */
function initDOMReferences() {
  formElements = {
    form: document.getElementById("hcForm"),
    submitBtn: document.getElementById("hcSubmitBtn"),
    submitBtnText: document.getElementById("hcSubmitBtnText"),
    submitBtnSpinner: document.getElementById("hcSubmitBtnSpinner"),
    resetBtn: document.getElementById("hcResetBtn"),
  };

  resultElements = {
    section: document.getElementById("hcResultsSection"),
  };
}

// ============================================
// FORM DATA COLLECTION
// ============================================

/**
 * Collect all form data including multi-select checkboxes
 * @returns {Object} Form data object
 */
function collectFormData() {
  const form = formElements.form;
  if (!form) return null;

  // Get select values
  const usia = form.elements["usia"]?.value || "";
  const gender = form.elements["gender"]?.value || "";

  // Get multi-select checkbox values
  const keluhan = getCheckedValues(form, "keluhan");
  const makan = getCheckedValues(form, "makan");
  const tidur = getCheckedValues(form, "tidur");
  const aktivitas = getCheckedValues(form, "aktivitas");
  const redflag = getCheckedValues(form, "redflag");

  return {
    usia,
    gender,
    keluhan,
    makan,
    tidur,
    aktivitas,
    redflag,
  };
}

/**
 * Get values of all checked checkboxes with given name
 * @param {HTMLFormElement} form - Form element
 * @param {string} name - Checkbox name attribute
 * @returns {string[]} Array of checked values
 */
function getCheckedValues(form, name) {
  const checkboxes = form.querySelectorAll(`input[name="${name}"]:checked`);
  return Array.from(checkboxes).map((cb) => cb.value);
}

/**
 * Validate form data
 * @param {Object} data - Form data object
 * @returns {Object} Validation result { valid: boolean, message: string }
 */
function validateFormData(data) {
  if (!data.usia) {
    return { valid: false, message: "Mohon pilih rentang usia Anda." };
  }
  if (!data.gender) {
    return { valid: false, message: "Mohon pilih jenis kelamin Anda." };
  }
  if (data.keluhan.length === 0) {
    return { valid: false, message: "Mohon pilih minimal satu keluhan utama." };
  }

  return { valid: true, message: "" };
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

/**
 * Set submit button loading state
 * @param {boolean} isLoading - Loading state
 */
function setSubmitButtonLoading(isLoading) {
  const btn = formElements.submitBtn;
  const text = formElements.submitBtnText;
  const spinner = formElements.submitBtnSpinner;

  if (!btn || !text || !spinner) return;

  if (isLoading) {
    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    text.textContent = "Menganalisis...";
    spinner.classList.remove("hidden");
  } else {
    btn.disabled = false;
    btn.removeAttribute("aria-busy");
    text.textContent = "Lihat Hasil Analisa";
    spinner.classList.add("hidden");
  }
}

/**
 * Show loading state in results section
 */
function showResultsLoading() {
  const section = resultElements.section;
  if (!section) return;

  section.classList.add("visible");
  section.style.display = "block";
  section.innerHTML = `
    <div class="hc-section-title">
      Hasil Analisa Awal
      <small>Sedang memproses...</small>
    </div>
    <div class="hc-card">
      <div class="hc-loading-overlay">
        <div class="hc-loading-spinner-lg"></div>
        <p class="hc-loading-text">AI sedang menganalisis kondisi Anda...</p>
        <p class="hc-loading-subtext">Mohon tunggu 5-15 detik</p>
      </div>
    </div>
  `;
}

/**
 * Show error message in results section
 * @param {string} message - Error message
 * @param {boolean} showFallback - Whether to show fallback message
 */
function showResultsError(message, showFallback = true) {
  const section = resultElements.section;
  if (!section) return;

  section.classList.add("visible");
  section.style.display = "block";
  
  const fallbackHtml = showFallback 
    ? `<p class="hc-loading-subtext" style="margin-top: 0.5rem;">Menggunakan algoritma lokal...</p>` 
    : "";
  
  section.innerHTML = `
    <div class="hc-section-title">
      Hasil Analisa Awal
      <small>Terjadi kesalahan</small>
    </div>
    <div class="hc-card">
      <div class="hc-error-box">
        <span class="icon">⚠️</span>
        <p>${escapeHtml(message)}</p>
      </div>
      ${fallbackHtml}
    </div>
  `;
}

// ============================================
// API INTEGRATION
// ============================================

/**
 * Send form data to AI API
 * @param {Object} formData - Form data object
 * @returns {Promise<Object>} API response
 */
async function sendToAI(formData) {
  const response = await fetch(HEALTH_CHECK_CONFIG.API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Gagal menganalisis kondisi");
  }

  return result;
}

// ============================================
// FALLBACK ALGORITHM
// ============================================

/**
 * Pick relevant dalil based on keywords
 * @param {string[]} keywords - Keywords to match
 * @returns {Object[]} Matching dalil entries
 */
function pickRelevantDalil(keywords) {
  const scored = DALIL_DATABASE.map((dalil) => {
    let score = 0;
    keywords.forEach((kw) => {
      const kwLower = kw.toLowerCase();
      if (dalil.tags.some((tag) => tag.includes(kwLower))) score += 2;
      if (dalil.text.toLowerCase().includes(kwLower)) score += 1;
    });
    return { dalil, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((s) => s.dalil);
}

/**
 * Analyze using local fallback algorithm
 * @param {Object} formData - Form data
 * @returns {Object} Analysis result
 */
function analyzeLocal(formData) {
  const { usia, keluhan, makan, tidur, aktivitas, redflag } = formData;
  const keywords = [];

  // Determine risk level
  let level = "green";
  let statusText = "RINGAN – Bisa dipantau di rumah";

  // Check for serious red flags
  const seriousRedFlags = ["nyeriDada", "sesakBerat", "pingsan", "darah"];
  const hasRedFlagSerius = redflag.some((r) => seriousRedFlags.includes(r));

  if (hasRedFlagSerius) {
    level = "red";
    statusText = "DARURAT – Segera ke fasilitas kesehatan";
  } else if (redflag.includes("demamTinggi")) {
    level = "yellow";
    statusText = "WASPADA – Pantau ketat 24–48 jam";
  } else {
    const keluhanBerat = keluhan.filter((k) =>
      ["sesak", "mualMuntah", "diare", "kulit"].includes(k)
    ).length;

    if (keluhanBerat >= 2 || keluhan.length >= 4) {
      level = "yellow";
      statusText = "WASPADA – Jaga baik-baik dan pantau gejala";
    }
  }

  // Build ringkasan based on keluhan
  let ringkasan = "";
  const hasLambung = keluhan.includes("lambung");
  const hasDemam = keluhan.includes("demam");
  const hasBatuk = keluhan.includes("batuk");
  const hasLemas = keluhan.includes("lemas");
  const hasTidurGanggu = keluhan.includes("tidur");

  if (keluhan.includes("tidakAda") && keluhan.length === 1) {
    ringkasan =
      "Saat ini Anda tidak menyebutkan keluhan spesifik. Ini waktu yang sangat bagus untuk mengecek dan memperbaiki pola makan, tidur, dan stres sebelum tubuh memberi sinyal sakit.";
  } else if (hasLambung) {
    ringkasan =
      "Keluhan Anda mengarah pada gangguan lambung dan pencernaan. Lambung perih, kembung, atau mual biasanya terkait dengan pola makan yang tidak teratur, porsi berlebih, atau makan larut malam.";
    keywords.push("lambung", "food", "moderation");
  } else if (hasDemam && hasBatuk) {
    ringkasan =
      "Keluhan demam disertai batuk/pilek mengarah pada infeksi saluran napas atas yang umumnya disebabkan virus. Tubuh sedang menaikkan suhu untuk melawan kuman dan mempercepat kerja sistem imun.";
    keywords.push("healing", "medicine");
  } else if (hasLemas && (makan.includes("manis") || makan.includes("gorengan"))) {
    ringkasan =
      "Rasa lemas dan cepat capek dengan pola makan tinggi gula atau gorengan mengarah pada inflamasi halus yang menumpuk di pembuluh darah dan organ penting seperti hati dan ginjal.";
    keywords.push("food", "balance");
  } else if (hasTidurGanggu) {
    ringkasan =
      "Gangguan tidur yang Anda alami membuat proses perbaikan sel, hormon, dan imun terganggu. Jika dibiarkan, ini bisa berpengaruh ke mood, lambung, dan daya tahan tubuh.";
    keywords.push("sleep", "rest", "tidur");
  } else {
    ringkasan =
      "Keluhan yang Anda sebutkan menunjukkan tubuh sedang memberi sinyal bahwa ada bagian yang kelelahan atau meradang. Dengan memperbaiki pola hidup dan memberi nutrisi yang tepat, tubuh bisa kembali lebih seimbang.";
    keywords.push("healing", "balance");
  }

  // Build akar masalah
  const akarMasalah = [];

  // Pola makan
  if (makan.includes("manis")) {
    akarMasalah.push(
      "Konsumsi gula dan minuman manis yang sering dapat meningkatkan radikal bebas, membebani pankreas, dan memicu peradangan di pembuluh darah."
    );
  }
  if (makan.includes("gorengan")) {
    akarMasalah.push(
      "Gorengan dan lemak jenuh berlebih membuat darah lebih kental, membebani hati, dan memicu kolesterol serta peradangan kronis."
    );
  }
  if (makan.includes("malam")) {
    akarMasalah.push(
      "Kebiasaan makan malam larut membuat lambung bekerja berat saat seharusnya tubuh beristirahat, sehingga memicu refluks, kembung, dan gangguan tidur."
    );
  }
  if (makan.includes("berlebih")) {
    akarMasalah.push(
      "Sering makan sampai sangat kenyang membuat lambung meregang berlebihan dan memaksa organ lain seperti hati dan pankreas bekerja ekstra."
    );
  }

  // Pola tidur
  if (tidur.includes("begadang")) {
    akarMasalah.push(
      "Begadang rutin menurunkan kualitas detoksifikasi alami tubuh di malam hari dan mengganggu keseimbangan hormon stres."
    );
    keywords.push("tidur");
  }
  if (tidur.includes("kurang")) {
    akarMasalah.push(
      "Tidur yang terlalu sedikit membuat proses perbaikan sel dan sistem imun tidak maksimal."
    );
  }
  if (tidur.includes("sulit")) {
    akarMasalah.push(
      "Sulit tidur atau sering terbangun menandakan tubuh dan pikiran sulit masuk fase istirahat dalam, yang penting untuk pemulihan organ."
    );
  }

  // Aktivitas
  if (aktivitas.includes("duduk")) {
    akarMasalah.push(
      "Banyak duduk dan jarang bergerak membuat aliran darah lambat, metabolisme menurun, dan tubuh lebih mudah lemas."
    );
  }
  if (aktivitas.includes("fisikBerat")) {
    akarMasalah.push(
      "Kerja fisik berat tanpa istirahat yang cukup membuat otot dan sendi mudah meradang dan memicu kelelahan kronis."
    );
  }
  if (aktivitas.includes("stres")) {
    akarMasalah.push(
      "Stres dan cemas berkepanjangan meningkatkan hormon stres (seperti kortisol) yang dapat mengganggu lambung, tidur, dan imun."
    );
    keywords.push("spiritual", "heart");
  }

  if (akarMasalah.length === 0) {
    akarMasalah.push(
      "Pola makan, tidur, dan stres adalah tiga pilar besar yang menentukan kesehatan. Menjaga keseimbangan ketiganya sangat penting."
    );
  }

  // Build dalil
  const relevantDalil = pickRelevantDalil(keywords);
  let dalilText = "";

  if (hasLambung) {
    dalilText =
      "Islam mengajarkan kita untuk tidak memenuhi perut berlebihan. Rasulullah ﷺ mencontohkan agar sepertiga untuk makanan, sepertiga untuk minum, dan sepertiga untuk udara. Sains menjelaskan bahwa makan berlebih dan sering makan malam memicu asam lambung naik dan peradangan di saluran cerna.";
  } else if (hasDemam || hasBatuk) {
    dalilText =
      "Demam adalah salah satu cara tubuh melawan infeksi. Dalam ajaran Islam kita dianjurkan bersabar dan berikhtiar dengan pengobatan yang halal dan baik, termasuk madu. Sains menjelaskan demam sebagai reaksi imun untuk memperlambat kuman dan mengaktifkan sel-sel pertahanan tubuh.";
  } else if (hasTidurGanggu || tidur.includes("begadang")) {
    dalilText =
      "Malam diciptakan untuk istirahat. Saat tidur, tubuh memperbaiki sel, menyeimbangkan hormon, dan membersihkan racun. Ketika kita sering begadang, proses ini terganggu dan dampaknya terasa pada lambung, mood, dan daya tahan tubuh.";
  } else {
    dalilText =
      "Allah memerintahkan kita untuk tidak berlebihan dalam segala hal. Ketika kita terlalu berlebihan dalam makan, minum, dan mengabaikan istirahat, sains menunjukkan munculnya inflamasi kronis dan gangguan metabolik yang pelan-pelan merusak organ.";
  }

  // Build solusi
  const solusi = [];

  if (hasLambung) {
    solusi.push(
      "Kurangi makanan pemicu lambung seperti pedas, asam berlebihan, gorengan, dan minuman bersoda selama beberapa hari."
    );
    solusi.push(
      "Biasakan makan porsi kecil tetapi lebih teratur, dan beri jeda minimal 3 jam sebelum tidur."
    );
    solusi.push(
      "Konsumsi madu Docterbee 3–5 mm 1 sendok makan pagi sebelum makan dan 1 sendok makan malam sebelum tidur dengan air hangat."
    );
  } else if (hasDemam || hasBatuk) {
    solusi.push(
      "Perbanyak minum air hangat dan istirahat. Hindari terlalu banyak minuman manis atau dingin."
    );
    solusi.push(
      "Konsumsi madu Docterbee 3–5 mm beberapa kali dalam sehari dalam dosis kecil untuk mendukung imun."
    );
    solusi.push(
      "Jika ada batuk berdahak, madu dapat membantu mengencerkan dahak dan menenangkan tenggorokan."
    );
  } else if (hasTidurGanggu || tidur.includes("begadang")) {
    solusi.push(
      "Tetapkan jam tidur dan bangun yang lebih teratur, usahakan tidur sebelum jam 23.00."
    );
    solusi.push(
      "Kurangi gadget dan makanan berat 1–2 jam sebelum tidur agar tubuh lebih mudah rileks."
    );
    solusi.push(
      "Konsumsi madu Docterbee 3–5 mm malam hari untuk membantu menghangatkan tubuh dan menenangkan pencernaan."
    );
  } else {
    solusi.push(
      "Pertahankan pola makan yang lebih sederhana: kurangi gula, tepung putih, dan gorengan setiap hari."
    );
    solusi.push(
      "Jaga tubuh tetap aktif dengan berjalan kaki atau gerak ringan minimal 20–30 menit per hari."
    );
    solusi.push(
      "Gunakan madu Docterbee 3–5 mm sebagai nutrisi harian untuk mendukung sistem imun dan perbaikan sel."
    );
  }

  if (aktivitas.includes("stres")) {
    solusi.push(
      "Luangkan waktu untuk tenangkan diri dengan zikir, tilawah, atau aktivitas yang mendekatkan diri kepada Allah agar stres menurun."
    );
  }

  // Build rekomendasi
  let rekomendasiText = "";
  const rekomendasiList = [];

  if (usia === "<12") {
    rekomendasiText =
      "Untuk anak, fokus utama adalah memperkuat pencernaan dan imun. Anda cocok dengan paket Anak Sehat & Cerdas.";
    rekomendasiList.push("🎯 Fokus: memperkuat pencernaan dan sistem imun anak");
    rekomendasiList.push("🍯 Kombinasi madu lebah kecil dengan dosis yang sesuai usia");
  } else if (aktivitas.includes("fisikBerat") || hasLemas) {
    rekomendasiText =
      "Kondisi Anda cocok dengan paket Pekerja Aktif yang membantu menjaga energi, mengurangi pegal, dan mendukung pemulihan setelah aktivitas berat.";
    rekomendasiList.push("🎯 Fokus: menjaga energi dan pemulihan otot");
    rekomendasiList.push("🍯 Kombinasi madu + minuman cold-pressed untuk vitamin alami");
  } else if (
    makan.includes("manis") ||
    makan.includes("gorengan") ||
    makan.includes("berlebih")
  ) {
    rekomendasiText =
      "Pola makan Anda menunjukkan perlunya paket Keluarga Sehat untuk mengurangi inflamasi kronis, menjaga lambung, dan melindungi organ vital.";
    rekomendasiList.push("🎯 Fokus: kurangi inflamasi, perkuat pencernaan");
    rekomendasiList.push("🍯 Kombinasi madu 3–5 mm + cuka apel Docterbee");
  } else {
    rekomendasiText =
      "Anda cocok dengan paket pencegahan ringan Docterbee yang fokus pada perbaikan pola hidup dan dukungan nutrisi madu lebah kecil.";
    rekomendasiList.push("🎯 Fokus: perbaikan pola hidup jangka panjang");
    rekomendasiList.push("🍯 Madu lebah kecil 3–5 mm sebagai support harian");
  }

  // Build warning text
  let warningText = "";
  if (level === "red") {
    warningText =
      "Jawaban Anda menunjukkan adanya tanda bahaya. Segera periksakan diri ke fasilitas kesehatan terdekat. Produk Docterbee bisa digunakan hanya sebagai pendukung setelah penanganan medis.";
  } else if (level === "yellow") {
    warningText =
      "Pantau kondisi Anda dalam 24–48 jam. Jika keluhan memburuk atau muncul tanda bahaya baru seperti nyeri dada berat, sesak berat, atau muntah darah, segera ke fasilitas kesehatan.";
  } else {
    warningText =
      "Jika keluhan Anda tidak berkurang, muncul rasa sakit yang mengganggu aktivitas, atau Anda ragu dengan kondisi, jangan ragu untuk berkonsultasi dengan tenaga kesehatan.";
  }

  return {
    level,
    statusText,
    ringkasan,
    akarMasalah,
    dalilText,
    dalilList: relevantDalil,
    solusi,
    rekomendasiText,
    rekomendasiList,
    warningText,
    source: "local",
  };
}

// ============================================
// RESULT RENDERING
// ============================================

/**
 * Render analysis results to the page
 * @param {Object} result - Analysis result object
 */
function renderResults(result) {
  const section = resultElements.section;
  if (!section) return;

  const {
    level,
    statusText,
    ringkasan,
    akarMasalah,
    dalilText,
    dalilList,
    solusi,
    rekomendasiText,
    rekomendasiList,
    warningText,
    source,
  } = result;

  // Build dalil HTML
  let dalilHtml = "";
  if (dalilList && dalilList.length > 0) {
    dalilHtml = dalilList
      .map(
        (d) =>
          `<li><strong>${escapeHtml(d.type)} — ${escapeHtml(d.ref)}:</strong> "${escapeHtml(d.text)}"</li>`
      )
      .join("");
  }

  // Build source badge
  const sourceBadge =
    source === "ai"
      ? '<span class="hc-ai-badge"><span class="icon">✨</span> Powered by AI</span>'
      : '<span class="hc-ai-badge"><span class="icon">🔄</span> Algoritma Lokal</span>';

  section.classList.add("visible");
  section.style.display = "block";
  section.innerHTML = `
    <div class="hc-section-title">
      Hasil Analisa Awal
      <small>Gunakan sebagai panduan, bukan vonis mutlak.</small>
    </div>
    
    <div class="hc-card">
      <div class="hc-results-header">
        <div class="hc-chip-status level-${level}" id="hcStatusChip">
          <span class="hc-chip-status-dot"></span>
          <span id="hcStatusLabel">${escapeHtml(statusText)}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--hc-text-muted); display: flex; align-items: center; gap: 0.5rem;">
          ${sourceBadge}
        </div>
      </div>
      
      <div class="hc-results-grid">
        <!-- LEFT COLUMN -->
        <div>
          <div class="hc-results-block">
            <h4><span class="icon">📋</span> Ringkasan kondisi</h4>
            <p id="hcRingkasanText">${escapeHtml(ringkasan)}</p>
          </div>
          
          <div class="hc-results-block">
            <h4><span class="icon">🔍</span> Akar masalah yang mungkin terjadi</h4>
            <ul id="hcAkarMasalahList">
              ${akarMasalah.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
          
          <div class="hc-results-block">
            <h4><span class="icon">📖</span> Pandangan Qur'an, Hadis & sains</h4>
            <p id="hcDalilText">${escapeHtml(dalilText)}</p>
            ${dalilHtml ? `<ul style="margin-top: 0.5rem;">${dalilHtml}</ul>` : ""}
          </div>
        </div>
        
        <!-- RIGHT COLUMN -->
        <div>
          <div class="hc-results-block">
            <h4><span class="icon">💡</span> Solusi pendukung dari Docterbee</h4>
            <ul id="hcSolusiList">
              ${solusi.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
          
          <div class="hc-results-block">
            <h4><span class="icon">📦</span> Rekomendasi paket & langkah lanjutan</h4>
            <p id="hcRekomendasiText">${escapeHtml(rekomendasiText)}</p>
            <ul id="hcRekomendasiList">
              ${rekomendasiList.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
      
      <div class="hc-results-footer">
        <div class="warning" id="hcWarningText">${escapeHtml(warningText)}</div>
        <div class="actions">
          <a href="/store" class="hc-btn-ghost">Lihat paket kesehatan</a>
          <a href="https://wa.me/6282188080688?text=${encodeURIComponent("Halo Docterbee, saya baru saja melakukan cek kesehatan di website dan ingin berkonsultasi lebih lanjut.")}" target="_blank" rel="noopener noreferrer" class="hc-btn-ghost">Konsultasi via WhatsApp</a>
        </div>
      </div>
      
      <div class="hc-disclaimer">
        <span class="icon">⚠️</span>
        <p>
          <strong>Disclaimer:</strong> Hasil ini bukan diagnosis dokter. 
          Untuk kondisi berat atau tanda bahaya, tetap utamakan pemeriksaan di fasilitas kesehatan.
        </p>
      </div>
    </div>
  `;

  // Scroll to results
  section.scrollIntoView({ behavior: HEALTH_CHECK_CONFIG.SCROLL_BEHAVIOR, block: "start" });
}

// ============================================
// MAIN FORM HANDLER
// ============================================

/**
 * Handle form submission
 * @param {Event} event - Submit event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  // Collect form data
  const formData = collectFormData();
  if (!formData) {
    showWarning("Terjadi kesalahan saat mengumpulkan data form.");
    return;
  }

  // Validate
  const validation = validateFormData(formData);
  if (!validation.valid) {
    showWarning(validation.message);
    return;
  }

  // Show loading states
  setSubmitButtonLoading(true);
  showResultsLoading();

  const startTime = Date.now();

  try {
    // Try AI API first
    const response = await sendToAI(formData);

    // Ensure minimum loading time for better UX
    const elapsed = Date.now() - startTime;
    if (elapsed < HEALTH_CHECK_CONFIG.LOADING_MIN_TIME) {
      await new Promise((resolve) =>
        setTimeout(resolve, HEALTH_CHECK_CONFIG.LOADING_MIN_TIME - elapsed)
      );
    }

    // Render AI results
    if (response.data) {
      renderResults({ ...response.data, source: "ai" });
    } else {
      // Fallback if API returns unexpected format
      const localResult = analyzeLocal(formData);
      renderResults(localResult);
    }
  } catch (error) {
    console.error("Health check API error:", error);

    // Use local fallback
    const localResult = analyzeLocal(formData);

    // Brief error message then show results
    showResultsError(error.message || "Gagal terhubung ke AI", true);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    renderResults(localResult);
  } finally {
    setSubmitButtonLoading(false);
  }
}

/**
 * Handle form reset
 */
function handleFormReset() {
  const form = formElements.form;
  const section = resultElements.section;

  if (form) {
    form.reset();
    // Remove selected class from all labels
    form.querySelectorAll("label.selected").forEach((label) => {
      label.classList.remove("selected");
    });
  }

  if (section) {
    section.classList.remove("visible");
    section.style.display = "none";
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: HEALTH_CHECK_CONFIG.SCROLL_BEHAVIOR });
}

/**
 * Handle checkbox change to update label styling
 * @param {Event} event - Change event
 */
function handleCheckboxChange(event) {
  const checkbox = event.target;
  const label = checkbox.closest("label");

  if (label) {
    if (checkbox.checked) {
      label.classList.add("selected");
    } else {
      label.classList.remove("selected");
    }
  }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize health check module
 */
function initHealthCheck() {
  initDOMReferences();

  // Form submit handler
  if (formElements.form) {
    formElements.form.addEventListener("submit", handleFormSubmit);
  }

  // Reset button handler
  if (formElements.resetBtn) {
    formElements.resetBtn.addEventListener("click", handleFormReset);
  }

  // Add change listeners to all checkboxes for visual feedback
  document.querySelectorAll('.hc-form-group input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", handleCheckboxChange);
  });

  // Log initialization
  console.log("✅ Health Check module initialized");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHealthCheck);
} else {
  initHealthCheck();
}
