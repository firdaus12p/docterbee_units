// ============================================
// REPORTS MANAGER - Admin Dashboard
// Handles reports & analytics functionality
// ============================================
/* global API_BASE, adminFetch, escapeHtml */

// ============================================
// INITIALIZATION
// ============================================

let reportsInitialized = false;

function initReportsManager() {
  if (reportsInitialized) return;

  console.log("[Reports] Initializing Reports Manager...");

  // Set default date range (today)
  const today = new Date().toISOString().split("T")[0];
  const startDateInput = document.getElementById("reportStartDate");
  const endDateInput = document.getElementById("reportEndDate");

  if (startDateInput) startDateInput.value = today;
  if (endDateInput) endDateInput.value = today;

  // Event listeners
  const refreshBtn = document.getElementById("btnRefreshReports");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadReportSummary);
  }

  const inventoryRefreshBtn = document.getElementById("btnRefreshInventory");
  if (inventoryRefreshBtn) {
    inventoryRefreshBtn.addEventListener("click", loadInventoryReport);
  }

  // Date change listeners
  if (startDateInput) {
    startDateInput.addEventListener("change", loadReportSummary);
  }
  if (endDateInput) {
    endDateInput.addEventListener("change", loadReportSummary);
  }

  reportsInitialized = true;
  console.log("[Reports] Initialization complete");
}

// ============================================
// LOAD REPORT SUMMARY
// ============================================

async function loadReportSummary() {
  console.log("[Reports] Loading summary...");

  const startDate = document.getElementById("reportStartDate")?.value;
  const endDate = document.getElementById("reportEndDate")?.value;

  // Update summary cards with loading state
  document.getElementById("reportTotalOrders").textContent = "...";
  document.getElementById("reportTotalRevenue").textContent = "Rp ...";
  document.getElementById("reportPointsEarned").textContent = "...";
  document.getElementById("reportRewardsRedeemed").textContent = "...";

  // Update location table with loading state
  const locationBody = document.getElementById("reportLocationTableBody");
  if (locationBody) {
    locationBody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-6 text-center text-slate-400">
          Loading...
        </td>
      </tr>
    `;
  }

  try {
    const url = `${API_BASE}/reports/summary?start_date=${startDate}&end_date=${endDate}`;
    const response = await adminFetch(url);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to load report");
    }

    const data = result.data;

    // Update summary cards
    document.getElementById("reportTotalOrders").textContent = 
      data.summary.total_orders.toLocaleString("id-ID");
    document.getElementById("reportTotalRevenue").textContent = 
      `Rp ${data.summary.total_revenue.toLocaleString("id-ID")}`;
    document.getElementById("reportPointsEarned").textContent = 
      `+${data.summary.total_points_earned.toLocaleString("id-ID")}`;
    document.getElementById("reportRewardsRedeemed").textContent = 
      `${data.summary.total_redemptions} (-${data.summary.total_points_spent.toLocaleString("id-ID")} pts)`;

    // Update location breakdown table
    renderLocationTable(data.by_location, data.summary.total_revenue);

    console.log("[Reports] Summary loaded successfully");
  } catch (error) {
    console.error("[Reports] Error loading summary:", error);
    document.getElementById("reportTotalOrders").textContent = "Error";
    document.getElementById("reportTotalRevenue").textContent = "Error";
    document.getElementById("reportPointsEarned").textContent = "Error";
    document.getElementById("reportRewardsRedeemed").textContent = "Error";

    if (locationBody) {
      locationBody.innerHTML = `
        <tr>
          <td colspan="4" class="px-4 py-6 text-center text-red-400">
            Error: ${error.message}
          </td>
        </tr>
      `;
    }
  }
}

// ============================================
// RENDER LOCATION TABLE
// ============================================

function renderLocationTable(locations, totalRevenue) {
  const tbody = document.getElementById("reportLocationTableBody");
  if (!tbody) return;

  if (!locations || locations.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-6 text-center text-slate-400">
          No data available for this period
        </td>
      </tr>
    `;
    return;
  }

  const totalRev = parseFloat(totalRevenue) || 1; // Avoid division by zero

  tbody.innerHTML = locations
    .map((loc) => {
      const revenue = parseFloat(loc.revenue) || 0;
      const percentage = totalRev > 0 ? ((revenue / totalRev) * 100).toFixed(1) : "0.0";
      const barWidth = Math.min(percentage, 100);

      return `
        <tr class="border-b border-slate-800 hover:bg-slate-800/50">
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <i data-lucide="map-pin" class="w-4 h-4 text-amber-400"></i>
              <span class="font-medium">${escapeHtml(loc.location_name)}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-center">
            <span class="px-2 py-1 rounded-full text-xs bg-blue-900/30 text-blue-400">
              ${loc.order_count}
            </span>
          </td>
          <td class="px-4 py-3 text-right font-semibold text-emerald-400">
            Rp ${revenue.toLocaleString("id-ID")}
          </td>
          <td class="px-4 py-3 text-right">
            <div class="flex items-center justify-end gap-2">
              <div class="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-amber-400 rounded-full" 
                  style="width: ${barWidth}%"
                ></div>
              </div>
              <span class="text-sm text-slate-300 w-12 text-right">${percentage}%</span>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  // Refresh Lucide icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

// ============================================
// LOAD INVENTORY REPORT
// ============================================

async function loadInventoryReport() {
  console.log("[Reports] Loading inventory...");

  const tbody = document.getElementById("reportInventoryTableBody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="px-4 py-6 text-center text-slate-400">
        Loading...
      </td>
    </tr>
  `;

  try {
    const response = await adminFetch(`${API_BASE}/reports/inventory`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to load inventory");
    }

    const data = result.data;

    if (!data.by_location || data.by_location.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-4 py-6 text-center text-slate-400">
            No inventory data available
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data.by_location
      .map((loc) => {
        const lowStockClass = loc.low_stock_count > 0 ? "text-amber-400" : "text-slate-400";
        const outOfStockClass = loc.out_of_stock_count > 0 ? "text-red-400 font-semibold" : "text-slate-400";

        return `
          <tr class="border-b border-slate-800 hover:bg-slate-800/50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <i data-lucide="warehouse" class="w-4 h-4 text-amber-400"></i>
                <span class="font-medium">${escapeHtml(loc.location_name)}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="px-2 py-1 rounded-full text-xs bg-blue-900/30 text-blue-400">
                ${loc.product_count}
              </span>
            </td>
            <td class="px-4 py-3 text-center font-semibold text-white">
              ${loc.total_stock.toLocaleString("id-ID")}
            </td>
            <td class="px-4 py-3 text-center ${lowStockClass}">
              ${loc.low_stock_count > 0 ? `⚠️ ${loc.low_stock_count}` : "-"}
            </td>
            <td class="px-4 py-3 text-center ${outOfStockClass}">
              ${loc.out_of_stock_count > 0 ? `❌ ${loc.out_of_stock_count}` : "-"}
            </td>
          </tr>
        `;
      })
      .join("");

    // Add totals row
    tbody.innerHTML += `
      <tr class="bg-slate-800/50 font-semibold">
        <td class="px-4 py-3 text-amber-400">Total</td>
        <td class="px-4 py-3 text-center text-white">${data.totals.total_products_with_stock}</td>
        <td class="px-4 py-3 text-center text-white">${data.totals.total_units_in_stock.toLocaleString("id-ID")}</td>
        <td class="px-4 py-3 text-center text-slate-400">-</td>
        <td class="px-4 py-3 text-center ${data.totals.products_without_any_stock > 0 ? 'text-red-400' : 'text-slate-400'}">
          ${data.totals.products_without_any_stock > 0 ? `⚠️ ${data.totals.products_without_any_stock} products` : "-"}
        </td>
      </tr>
    `;

    // Refresh Lucide icons
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }

    console.log("[Reports] Inventory loaded successfully");
  } catch (error) {
    console.error("[Reports] Error loading inventory:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-6 text-center text-red-400">
          Error: ${error.message}
        </td>
      </tr>
    `;
  }
}

// ============================================
// LOAD ALL REPORTS
// ============================================

async function loadReports() {
  initReportsManager();
  await Promise.all([loadReportSummary(), loadInventoryReport()]);
}

// ============================================
// EXPOSE FUNCTIONS
// ============================================

window.initReportsManager = initReportsManager;
window.loadReports = loadReports;
window.loadReportSummary = loadReportSummary;
window.loadInventoryReport = loadInventoryReport;
