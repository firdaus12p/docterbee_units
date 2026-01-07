/**
 * Location State Management for Admin Dashboard
 * Handles global location selection and syncs across all dashboard components
 * 
 * Usage:
 * - window.adminLocationState.currentLocationId - Get current location ID (null = all locations)
 * - window.adminLocationState.currentLocationName - Get current location name
 * - window.adminLocationState.locations - Get all available locations
 * - Listen to 'locationChanged' event on document for updates
 */

(function () {
  "use strict";

  // State object
  const locationState = {
    currentLocationId: null,
    currentLocationName: "Semua Lokasi",
    locations: [],
    isInitialized: false,
  };

  // Storage key for persistence
  const STORAGE_KEY = "admin_selected_location";

  /**
   * Initialize location state and fetch available locations
   */
  async function initLocationState() {
    if (locationState.isInitialized) {
      console.log("[LocationState] Already initialized");
      return;
    }

    console.log("[LocationState] Initializing...");

    try {
      // Fetch available locations from API
      const response = await adminFetch(`${API_BASE}/locations`);
      const result = await response.json();

      if (result.success && result.locations) {
        locationState.locations = result.locations;
        console.log(`[LocationState] Loaded ${result.locations.length} locations`);

        // Populate the dropdown
        populateLocationDropdown();

        // Restore saved selection from localStorage
        const savedLocationId = localStorage.getItem(STORAGE_KEY);
        if (savedLocationId && savedLocationId !== "null" && savedLocationId !== "") {
          // Verify the saved location still exists
          const locationExists = locationState.locations.some(
            (loc) => loc.id.toString() === savedLocationId
          );
          if (locationExists) {
            setCurrentLocation(savedLocationId);
          }
        }

        // Setup event listener for dropdown changes
        setupDropdownListener();

        locationState.isInitialized = true;
        console.log("[LocationState] Initialization complete");
      } else {
        console.warn("[LocationState] No locations found or API error");
      }
    } catch (error) {
      console.error("[LocationState] Error loading locations:", error);
    }
  }

  /**
   * Populate the location dropdown with available locations
   */
  function populateLocationDropdown() {
    const select = document.getElementById("globalLocationSelect");
    if (!select) {
      console.warn("[LocationState] globalLocationSelect not found");
      return;
    }

    // Keep the "Semua Lokasi" option, remove others
    select.innerHTML = '<option value="">Semua Lokasi</option>';

    // Add location options
    locationState.locations.forEach((location) => {
      const option = document.createElement("option");
      option.value = location.id;
      option.textContent = location.name;
      select.appendChild(option);
    });
  }

  /**
   * Setup event listener for dropdown selection
   */
  function setupDropdownListener() {
    const select = document.getElementById("globalLocationSelect");
    if (!select) return;

    select.addEventListener("change", function () {
      const locationId = this.value || null;
      setCurrentLocation(locationId);
    });
  }

  /**
   * Set the current location and dispatch change event
   * @param {string|number|null} locationId - Location ID or null for "all"
   */
  function setCurrentLocation(locationId) {
    const previousLocationId = locationState.currentLocationId;

    // Parse to number or null
    locationState.currentLocationId = locationId ? parseInt(locationId) : null;

    // Find location name
    if (locationState.currentLocationId) {
      const location = locationState.locations.find(
        (loc) => loc.id === locationState.currentLocationId
      );
      locationState.currentLocationName = location ? location.name : "Unknown";
    } else {
      locationState.currentLocationName = "Semua Lokasi";
    }

    // Update dropdown to match
    const select = document.getElementById("globalLocationSelect");
    if (select) {
      select.value = locationState.currentLocationId || "";
    }

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, locationState.currentLocationId || "");

    // Only dispatch event if value actually changed
    if (previousLocationId !== locationState.currentLocationId) {
      console.log(
        `[LocationState] Location changed: ${locationState.currentLocationName} (ID: ${locationState.currentLocationId})`
      );

      // Dispatch custom event for other components to listen
      document.dispatchEvent(
        new CustomEvent("locationChanged", {
          detail: {
            locationId: locationState.currentLocationId,
            locationName: locationState.currentLocationName,
          },
        })
      );
    }
  }

  /**
   * Get current location ID
   * @returns {number|null}
   */
  function getCurrentLocationId() {
    return locationState.currentLocationId;
  }

  /**
   * Get current location name
   * @returns {string}
   */
  function getCurrentLocationName() {
    return locationState.currentLocationName;
  }

  /**
   * Get all available locations
   * @returns {Array}
   */
  function getLocations() {
    return locationState.locations;
  }

  /**
   * Check if a specific location is currently selected
   * @param {number} locationId
   * @returns {boolean}
   */
  function isLocationSelected(locationId) {
    return locationState.currentLocationId === locationId;
  }

  /**
   * Refresh locations from API (useful after adding/editing locations)
   */
  async function refreshLocations() {
    try {
      const response = await adminFetch(`${API_BASE}/locations`);
      const result = await response.json();

      if (result.success && result.locations) {
        locationState.locations = result.locations;
        populateLocationDropdown();

        // Re-select current location if it still exists
        if (locationState.currentLocationId) {
          setCurrentLocation(locationState.currentLocationId);
        }
      }
    } catch (error) {
      console.error("[LocationState] Error refreshing locations:", error);
    }
  }

  // Expose to window for global access
  window.adminLocationState = {
    get currentLocationId() {
      return getCurrentLocationId();
    },
    get currentLocationName() {
      return getCurrentLocationName();
    },
    get locations() {
      return getLocations();
    },
    init: initLocationState,
    setLocation: setCurrentLocation,
    isLocationSelected: isLocationSelected,
    refresh: refreshLocations,
  };

  // Auto-initialize when DOM is ready and user is logged in
  // The showDashboard() function in admin-dashboard.js will call this
  console.log("[LocationState] Module loaded");
})();
