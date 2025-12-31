// Journey Manager for Admin Dashboard
// CRUD operations for Journeys, Units, and Items
// Note: adminFetch is defined in admin-api.js, showDeleteModal is defined in modal-utils.js
/* global adminFetch, escapeHtml, showDeleteModal, showSuccessModal, lucide, API_BASE */

let currentSelectedJourneyId = null;
let currentSelectedUnitId = null;
let currentJourneyData = null;

/**
 * Load all journeys for admin selector
 */
async function loadAdminJourneys() {
  const selector = document.getElementById("adminJourneySelector");
  if (!selector) return;

  try {
    const response = await adminFetch("/api/journeys/admin/all");
    const data = await response.json();

    if (data.success && data.data) {
      selector.innerHTML = '<option value="">-- Pilih Journey --</option>';
      data.data.forEach((journey) => {
        const option = document.createElement("option");
        option.value = journey.id;
        option.textContent = `${journey.name} (${journey.slug})`;
        if (!journey.is_active) {
          option.textContent += " [NONAKTIF]";
        }
        selector.appendChild(option);
      });

      // Attach change listener
      selector.onchange = () => {
        const journeyId = selector.value;
        if (journeyId) {
          loadJourneyDetail(parseInt(journeyId));
        } else {
          document.getElementById("journeyDetailsPanel").classList.add("hidden");
        }
      };
    }
  } catch (error) {
    console.error("Error loading journeys:", error);
    selector.innerHTML = '<option value="">Error loading journeys</option>';
  }
}

/**
 * Load journey detail with units
 */
async function loadJourneyDetail(journeyId) {
  currentSelectedJourneyId = journeyId;
  currentSelectedUnitId = null;

  try {
    const response = await adminFetch(`/api/journeys/admin/${journeyId}`);
    const data = await response.json();

    if (data.success && data.data) {
      currentJourneyData = data.data;
      const journey = data.data;

      // Show details panel
      document.getElementById("journeyDetailsPanel").classList.remove("hidden");

      // Update journey info
      document.getElementById("journeyDetailName").textContent = journey.name;
      document.getElementById("journeyDetailSlug").textContent = journey.slug;
      document.getElementById("journeyDetailStatus").innerHTML = journey.is_active
        ? '<span class="text-emerald-400">Aktif</span>'
        : '<span class="text-red-400">Nonaktif</span>';

      // Render units table
      renderUnitsTable(journey.units || []);

      // Hide items panel
      document.getElementById("itemsPanel").classList.add("hidden");

      // Refresh icons
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    }
  } catch (error) {
    console.error("Error loading journey detail:", error);
  }
}

/**
 * Render units table
 */
function renderUnitsTable(units) {
  const tbody = document.getElementById("unitsTableBody");
  if (!tbody) return;

  if (units.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-6 text-center text-slate-400">Belum ada unit</td></tr>';
    return;
  }

  tbody.innerHTML = units
    .map(
      (unit) => `
      <tr class="border-b border-slate-800 hover:bg-slate-800/50">
        <td class="px-4 py-2 font-mono text-xs">${unit.id}</td>
        <td class="px-4 py-2">${escapeHtml(unit.title)}</td>
        <td class="px-4 py-2 text-center">
          <span class="${unit.color_class} text-xs font-semibold">${unit.color_class}</span>
        </td>
        <td class="px-4 py-2 text-center">${unit.items ? unit.items.length : 0}</td>
        <td class="px-4 py-2">
          <div class="flex gap-1 justify-center">
            <button onclick="showUnitItems(${unit.id}, '${escapeHtml(unit.title)}')" class="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded">Items</button>
            <button onclick="openEditUnitModal(${unit.id})" class="text-xs bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded">Edit</button>
            <button onclick="deleteUnit(${unit.id})" class="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded">Hapus</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

/**
 * Show items for selected unit
 */
function showUnitItems(unitId, unitTitle) {
  currentSelectedUnitId = unitId;

  const unit = currentJourneyData?.units?.find((u) => u.id === unitId);
  if (!unit) return;

  document.getElementById("selectedUnitTitle").textContent = unitTitle;
  document.getElementById("itemsPanel").classList.remove("hidden");

  renderItemsTable(unit.items || []);
}

/**
 * Render items table
 */
function renderItemsTable(items) {
  const tbody = document.getElementById("itemsTableBody");
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-6 text-center text-slate-400">Belum ada item</td></tr>';
    return;
  }

  tbody.innerHTML = items
    .map(
      (item) => `
      <tr class="border-b border-slate-800 hover:bg-slate-800/50">
        <td class="px-4 py-2 font-mono text-xs">${escapeHtml(item.item_key)}</td>
        <td class="px-4 py-2 text-sm">${escapeHtml(item.question).substring(0, 80)}${item.question.length > 80 ? "..." : ""}</td>
        <td class="px-4 py-2">
          <div class="flex gap-1 justify-center">
            <button onclick="openEditItemModal(${item.id})" class="text-xs bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded">Edit</button>
            <button onclick="deleteItem(${item.id})" class="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded">Hapus</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

// ========== JOURNEY MODAL ==========

function openJourneyModal(editId = null) {
  const modal = document.getElementById("journeyModal");
  const title = document.getElementById("journeyModalTitle");
  const form = document.getElementById("journeyForm");

  form.reset();
  document.getElementById("journeyFormId").value = "";

  if (editId && currentJourneyData) {
    title.textContent = "Edit Journey";
    document.getElementById("journeyFormId").value = currentJourneyData.id;
    document.getElementById("journeyFormName").value = currentJourneyData.name;
    document.getElementById("journeyFormSlug").value = currentJourneyData.slug;
    document.getElementById("journeyFormDesc").value = currentJourneyData.description || "";
    document.getElementById("journeyFormActive").checked = currentJourneyData.is_active;
  } else {
    title.textContent = "Journey Baru";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function closeJourneyModal() {
  const modal = document.getElementById("journeyModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function handleJourneySubmit(e) {
  e.preventDefault();

  const id = document.getElementById("journeyFormId").value;
  const data = {
    name: document.getElementById("journeyFormName").value.trim(),
    slug: document.getElementById("journeyFormSlug").value.trim().toLowerCase(),
    description: document.getElementById("journeyFormDesc").value.trim(),
    is_active: document.getElementById("journeyFormActive").checked,
  };

  try {
    const url = id ? `/api/journeys/admin/${id}` : "/api/journeys/admin";
    const method = id ? "PATCH" : "POST";

    const response = await adminFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      closeJourneyModal();
      loadAdminJourneys();
      if (id) {
        loadJourneyDetail(parseInt(id));
      }
      showSuccessModal(result.message || "Journey berhasil disimpan");
    } else {
      alert("Error: " + (result.error || "Gagal menyimpan journey"));
    }
  } catch (error) {
    console.error("Error saving journey:", error);
    alert("Error: " + error.message);
  }
}

async function deleteJourney() {
  if (!currentSelectedJourneyId) return;

  showDeleteModal("Apakah Anda yakin ingin menghapus journey ini? Semua unit dan item di dalamnya juga akan dihapus.", async () => {
    try {
      const response = await adminFetch(`/api/journeys/admin/${currentSelectedJourneyId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        loadAdminJourneys();
        document.getElementById("journeyDetailsPanel").classList.add("hidden");
        currentSelectedJourneyId = null;
        currentJourneyData = null;
        showSuccessModal("Journey berhasil dihapus");
      } else {
        alert("Error: " + (result.error || "Gagal menghapus journey"));
      }
    } catch (error) {
      console.error("Error deleting journey:", error);
      alert("Error: " + error.message);
    }
  });
}

// ========== UNIT MODAL ==========

function openUnitModal(editId = null) {
  const modal = document.getElementById("unitModal");
  const title = document.getElementById("unitModalTitle");
  const form = document.getElementById("unitForm");

  form.reset();
  document.getElementById("unitFormId").value = "";
  document.getElementById("unitFormJourneyId").value = currentSelectedJourneyId;

  if (editId) {
    const unit = currentJourneyData?.units?.find((u) => u.id === editId);
    if (unit) {
      title.textContent = "Edit Unit";
      document.getElementById("unitFormId").value = unit.id;
      document.getElementById("unitFormTitle").value = unit.title;
      document.getElementById("unitFormColor").value = unit.color_class;
      document.getElementById("unitFormActive").checked = unit.is_active;
    }
  } else {
    title.textContent = "Unit Baru";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function openEditUnitModal(unitId) {
  openUnitModal(unitId);
}

function closeUnitModal() {
  const modal = document.getElementById("unitModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function handleUnitSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("unitFormId").value;
  const data = {
    journey_id: parseInt(document.getElementById("unitFormJourneyId").value),
    title: document.getElementById("unitFormTitle").value.trim(),
    color_class: document.getElementById("unitFormColor").value,
    is_active: document.getElementById("unitFormActive").checked,
  };

  try {
    const url = id ? `/api/journeys/admin/units/${id}` : "/api/journeys/admin/units";
    const method = id ? "PATCH" : "POST";

    const response = await adminFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      closeUnitModal();
      loadJourneyDetail(currentSelectedJourneyId);
      showSuccessModal(result.message || "Unit berhasil disimpan");
    } else {
      alert("Error: " + (result.error || "Gagal menyimpan unit"));
    }
  } catch (error) {
    console.error("Error saving unit:", error);
    alert("Error: " + error.message);
  }
}

async function deleteUnit(unitId) {
  showDeleteModal("Apakah Anda yakin ingin menghapus unit ini? Semua item di dalamnya juga akan dihapus.", async () => {
    try {
      const response = await adminFetch(`/api/journeys/admin/units/${unitId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        loadJourneyDetail(currentSelectedJourneyId);
        document.getElementById("itemsPanel").classList.add("hidden");
        showSuccessModal("Unit berhasil dihapus");
      } else {
        alert("Error: " + (result.error || "Gagal menghapus unit"));
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
      alert("Error: " + error.message);
    }
  });
}

// ========== ITEM MODAL ==========

function openItemModal(editId = null) {
  const modal = document.getElementById("itemModal");
  const title = document.getElementById("itemModalTitle");
  const form = document.getElementById("itemForm");

  form.reset();
  document.getElementById("itemFormId").value = "";
  document.getElementById("itemFormUnitId").value = currentSelectedUnitId;

  if (editId) {
    const unit = currentJourneyData?.units?.find((u) => u.id === currentSelectedUnitId);
    const item = unit?.items?.find((i) => i.id === editId);
    if (item) {
      title.textContent = "Edit Item";
      document.getElementById("itemFormId").value = item.id;
      document.getElementById("itemFormKey").value = item.item_key;
      document.getElementById("itemFormQuestion").value = item.question;
      document.getElementById("itemFormDalil").value = item.dalil;
      document.getElementById("itemFormSains").value = item.sains;
      document.getElementById("itemFormNbsn").value = item.nbsn;
      document.getElementById("itemFormActive").checked = item.is_active;
    }
  } else {
    title.textContent = "Item Baru";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function openEditItemModal(itemId) {
  openItemModal(itemId);
}

function closeItemModal() {
  const modal = document.getElementById("itemModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function handleItemSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("itemFormId").value;
  const data = {
    unit_id: parseInt(document.getElementById("itemFormUnitId").value),
    item_key: document.getElementById("itemFormKey").value.trim(),
    question: document.getElementById("itemFormQuestion").value.trim(),
    dalil: document.getElementById("itemFormDalil").value.trim(),
    sains: document.getElementById("itemFormSains").value.trim(),
    nbsn: document.getElementById("itemFormNbsn").value.trim(),
    is_active: document.getElementById("itemFormActive").checked,
  };

  try {
    const url = id ? `/api/journeys/admin/items/${id}` : "/api/journeys/admin/items";
    const method = id ? "PATCH" : "POST";

    const response = await adminFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      closeItemModal();
      loadJourneyDetail(currentSelectedJourneyId);
      // Re-show items for current unit
      setTimeout(() => {
        showUnitItems(currentSelectedUnitId, document.getElementById("selectedUnitTitle").textContent);
      }, 100);
      showSuccessModal(result.message || "Item berhasil disimpan");
    } else {
      alert("Error: " + (result.error || "Gagal menyimpan item"));
    }
  } catch (error) {
    console.error("Error saving item:", error);
    alert("Error: " + error.message);
  }
}

async function deleteItem(itemId) {
  showDeleteModal("Apakah Anda yakin ingin menghapus item ini?", async () => {
    try {
      const response = await adminFetch(`/api/journeys/admin/items/${itemId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        loadJourneyDetail(currentSelectedJourneyId);
        setTimeout(() => {
          showUnitItems(currentSelectedUnitId, document.getElementById("selectedUnitTitle").textContent);
        }, 100);
        showSuccessModal("Item berhasil dihapus");
      } else {
        alert("Error: " + (result.error || "Gagal menghapus item"));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error: " + error.message);
    }
  });
}

// ========== INIT EVENT LISTENERS ==========

document.addEventListener("DOMContentLoaded", () => {
  // Journey buttons
  const btnNewJourney = document.getElementById("btnNewJourney");
  if (btnNewJourney) {
    btnNewJourney.addEventListener("click", () => openJourneyModal());
  }

  const btnEditJourney = document.getElementById("btnEditJourney");
  if (btnEditJourney) {
    btnEditJourney.addEventListener("click", () => openJourneyModal(currentSelectedJourneyId));
  }

  const btnDeleteJourney = document.getElementById("btnDeleteJourney");
  if (btnDeleteJourney) {
    btnDeleteJourney.addEventListener("click", deleteJourney);
  }

  // Journey modal
  const closeJourneyModalBtn = document.getElementById("closeJourneyModal");
  if (closeJourneyModalBtn) {
    closeJourneyModalBtn.addEventListener("click", closeJourneyModal);
  }

  const cancelJourneyModalBtn = document.getElementById("cancelJourneyModal");
  if (cancelJourneyModalBtn) {
    cancelJourneyModalBtn.addEventListener("click", closeJourneyModal);
  }

  const journeyForm = document.getElementById("journeyForm");
  if (journeyForm) {
    journeyForm.addEventListener("submit", handleJourneySubmit);
  }

  // Unit buttons
  const btnNewUnit = document.getElementById("btnNewUnit");
  if (btnNewUnit) {
    btnNewUnit.addEventListener("click", () => openUnitModal());
  }

  // Unit modal
  const closeUnitModalBtn = document.getElementById("closeUnitModal");
  if (closeUnitModalBtn) {
    closeUnitModalBtn.addEventListener("click", closeUnitModal);
  }

  const cancelUnitModalBtn = document.getElementById("cancelUnitModal");
  if (cancelUnitModalBtn) {
    cancelUnitModalBtn.addEventListener("click", closeUnitModal);
  }

  const unitForm = document.getElementById("unitForm");
  if (unitForm) {
    unitForm.addEventListener("submit", handleUnitSubmit);
  }

  // Item buttons
  const btnNewItem = document.getElementById("btnNewItem");
  if (btnNewItem) {
    btnNewItem.addEventListener("click", () => openItemModal());
  }

  // Item modal
  const closeItemModalBtn = document.getElementById("closeItemModal");
  if (closeItemModalBtn) {
    closeItemModalBtn.addEventListener("click", closeItemModal);
  }

  const cancelItemModalBtn = document.getElementById("cancelItemModal");
  if (cancelItemModalBtn) {
    cancelItemModalBtn.addEventListener("click", closeItemModal);
  }

  const itemForm = document.getElementById("itemForm");
  if (itemForm) {
    itemForm.addEventListener("submit", handleItemSubmit);
  }
});

// Expose functions to window for global access
window.loadAdminJourneys = loadAdminJourneys;
window.showUnitItems = showUnitItems;
window.openEditUnitModal = openEditUnitModal;
window.deleteUnit = deleteUnit;
window.openEditItemModal = openEditItemModal;
window.deleteItem = deleteItem;
