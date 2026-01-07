/**
 * Store Location Manager
 * Handles global location state for the store view
 */

const StoreLocationManager = {
  STORAGE_KEY: 'docterbee_store_location',
  
  // Available locations (Matches backend Database IDs)
  // Assumes Kolaka=1, Makassar=2, Kendari=3 based on seeding order
  locations: [
    { id: 1, name: 'Docterbee Kolaka ZE Center', type: 'Store & Warehouse' },
    { id: 2, name: 'Docterbee Makassar Pettarani', type: 'Store & Warehouse' },
    { id: 3, name: 'Docterbee Kendari ByPass', type: 'Store' }
  ],

  // Initialize
  init() {
    this.renderLocationSelector();
    this.checkLocationSet();
    
    // Listen for custom event to update products
    document.addEventListener('storeLocationChanged', (e) => {
      console.log('Location changed to:', e.detail);
      this.updateUI(e.detail);
      // Reload page to ensure fresh state and correct stock data
      window.location.reload();
    });

    this.updateUI(this.getCurrentLocation());
  },

  // Get current location from storage
  getCurrentLocation() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  },

  // Set location
  setLocation(locationId) {
    const location = this.locations.find(l => l.id == locationId);
    if (location) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(location));
      document.dispatchEvent(new CustomEvent('storeLocationChanged', { detail: location }));
      return true;
    }
    return false;
  },

  // Check if location is set, if not show modal
  checkLocationSet() {
    const current = this.getCurrentLocation();
    if (!current) {
      this.showLocationModal();
    }
  },

  // Update UI Elements based on location
  updateUI(location) {
    if (!location) return;
    
    // Update Location Selector Label
    const selectorLabel = document.getElementById('selectedLocationName');
    if (selectorLabel) {
      selectorLabel.textContent = location.name;
    }

    // Update Cart/Checkout Location Display (Read-only)
    const cartLocationDisplay = document.getElementById('cartLocationDisplay');
    if (cartLocationDisplay) {
      cartLocationDisplay.textContent = location.name;
      cartLocationDisplay.innerHTML = `<i data-lucide="map-pin" class="w-4 h-4 inline mr-1 text-red-500"></i> ${location.name}`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  // Render Location Selector (below category filters)
  renderLocationSelector() {
    const container = document.getElementById('storeLocationSelectorContainer');
    if (!container) return;

    const current = this.getCurrentLocation();
    const currentName = current?.name || 'Pilih Lokasi Toko';
    const isSelected = !!current;

    container.innerHTML = `
      <div class="location-selector-wrapper">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-xl border-2 ${isSelected ? 'border-red-200 bg-red-50/50' : 'border-amber-300 bg-amber-50'} transition-all">
          
          <!-- Location Info -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full ${isSelected ? 'bg-red-100' : 'bg-amber-100'} flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${isSelected ? 'text-red-600' : 'text-amber-600'}"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div>
              <div class="text-xs font-medium ${isSelected ? 'text-red-600' : 'text-amber-700'} uppercase tracking-wide">
                ${isSelected ? 'Lokasi Toko Anda' : '⚠️ Pilih Lokasi Terlebih Dahulu'}
              </div>
              <div class="font-bold text-slate-900 text-sm sm:text-base" id="selectedLocationName">
                ${currentName}
              </div>
            </div>
          </div>

          <!-- Location Dropdown -->
          <div class="relative w-full sm:w-auto">
            <select 
              id="locationDropdown" 
              onchange="StoreLocationManager.selectLocation(this.value)"
              class="w-full sm:w-auto appearance-none bg-white border-2 ${isSelected ? 'border-red-200 hover:border-red-400' : 'border-amber-300 hover:border-amber-500'} rounded-lg px-4 py-2.5 pr-10 text-sm font-semibold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            >
              <option value="" disabled ${!isSelected ? 'selected' : ''}>-- Pilih Lokasi --</option>
              ${this.locations.map(loc => `
                <option value="${loc.id}" ${current?.id == loc.id ? 'selected' : ''}>${loc.name}</option>
              `).join('')}
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

        </div>
        
        ${!isSelected ? `
        <p class="text-xs text-amber-700 mt-2 text-center sm:text-left">
          Stok produk akan ditampilkan berdasarkan lokasi toko yang Anda pilih.
        </p>
        ` : ''}
      </div>
    `;
  },

  // Handler for selector click
  selectLocation(id) {
    this.setLocation(id);
    this.updateUI(this.getCurrentLocation());
    
    // Show toast
    if (typeof showToast === 'function') {
      showToast(`Lokasi toko diubah ke ${this.getCurrentLocation().name}`, 'success');
    }
  },

  // Show Initial Modal
  showLocationModal() {
    // Check if modal exists
    let modal = document.getElementById('locationSelectModal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'locationSelectModal';
      modal.className = 'fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm';
      modal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in duration-300">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Pilih Lokasi Toko</h2>
            <p class="text-slate-600 text-sm">
              Untuk menampilkan ketersediaan stok produk yang akurat, silakan pilih lokasi toko DocterBee terdekat Anda.
            </p>
          </div>
          
          <div class="space-y-3">
            ${this.locations.map(loc => `
              <button onclick="StoreLocationManager.confirmInitialLocation('${loc.id}')" class="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-red-500 hover:bg-red-50 transition-all group text-left">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-500 group-hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 group-hover:text-red-700">${loc.name}</div>
                    <div class="text-xs text-slate-500">${loc.type}</div>
                  </div>
                </div>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </button>
            `).join('')}
          </div>

          <div class="mt-6 text-center">
            <p class="text-xs text-slate-400">
              Lokasi dapat diubah kapan saja melalui dropdown di bawah filter produk.
            </p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      modal.classList.remove('hidden');
    }
  },

  confirmInitialLocation(id) {
    this.setLocation(id);
    const modal = document.getElementById('locationSelectModal');
    if (modal) modal.classList.add('hidden');
    
    // Refresh page to load correct stock
    if (typeof loadProducts === 'function') {
      window.location.reload(); 
    }
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  StoreLocationManager.init();
});
