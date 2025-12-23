import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,

  // ============================================
  // FRONTEND (browser) - js/*.js files (except utils.js and manager files)
  // ============================================
  {
    files: ["js/**/*.js"],
    ignores: ["js/utils.js", "js/users-manager.js", "js/rewards-manager.js", "js/orders-manager.js", "js/admin-dashboard.js", "js/podcasts-manager.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        // Third-party libraries loaded via script tags
        lucide: "readonly",
        QRCode: "readonly",
        Html5Qrcode: "readonly",
        // Shared utilities from utils.js
        escapeHtml: "readonly",
        formatDate: "readonly",
        formatDateTime: "readonly",
        formatCurrency: "readonly",
        formatNumber: "readonly",
        debounce: "readonly",
        copyToClipboard: "readonly",
        // Cross-file dependencies
        UserDataSync: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^(init|open|close|edit|delete|add|update|remove|toggle|handle|show|hide|save|load|check|set|get|share|copy|redeem|switch|summarize|confirm).*"
      }],
      "no-undef": "error",
      "prefer-const": "warn",
    },
  },

  // ============================================
  // ADMIN DASHBOARD AND MANAGERS - Define and use cross-file functions
  // ============================================
  {
    files: ["js/admin-dashboard.js", "js/users-manager.js", "js/rewards-manager.js", "js/orders-manager.js", "js/podcasts-manager.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        // Third-party libraries
        lucide: "readonly",
        QRCode: "readonly",
        Html5Qrcode: "readonly",
        // Shared utilities from utils.js
        escapeHtml: "readonly",
        formatDate: "readonly",
        formatDateTime: "readonly",
        formatCurrency: "readonly",
        formatNumber: "readonly",
        debounce: "readonly",
        copyToClipboard: "readonly",
        // Cross-file dependencies (defined in admin-dashboard.js, used by managers)
        API_BASE: "writable",
        showSuccessModal: "writable",
        openDeleteModal: "writable",
        showDeleteModal: "writable",
        // Manager functions (defined in manager files, called from admin-dashboard.js)
        initRewardsManager: "writable",
        initUsersManager: "writable",
        loadOrders: "writable",
        loadUsers: "writable",
        loadPodcasts: "writable",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        // All functions that are called from other files or HTML
        varsIgnorePattern: "^(init|open|close|edit|delete|add|update|remove|toggle|handle|show|hide|save|load|check|set|get|share|copy|redeem|switch|summarize|confirm|API_BASE|formatOrderDateTime|viewOrderDetails|completeOrder|current).*"
      }],
      "no-undef": "error",
      "prefer-const": "warn",
      "no-var": "off", // Allow var for globals like API_BASE
      "no-redeclare": "off", // Allow redefining globals that are shared between files
    },
  },

  // ============================================
  // UTILS.JS - Defines shared utilities (no globals needed)
  // ============================================
  {
    files: ["js/utils.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "prefer-const": "warn",
    },
  },

  // ============================================
  // BACKEND (Node.js) - backend/**/*.mjs files
  // ============================================
  {
    files: ["backend/**/*.mjs", "backend/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "prefer-const": "warn",
    },
  },

  // ============================================
  // TEST FILES
  // ============================================
  {
    files: ["tests/**/*.mjs", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.mocha, // describe, it, before, after
      },
    },
  },

  // ============================================
  // IGNORE PATTERNS
  // ============================================
  {
    ignores: ["node_modules/", "uploads/", "*.min.js", "dist/", "build/"],
  },
];
