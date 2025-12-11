/**
 * AUTH-CHECK.JS
 * Frontend authentication middleware
 * Checks if user is logged in via session
 * Redirects to login page if not authenticated
 * Initializes user data sync if logged in
 */

(async function checkAuth() {
  try {
    const response = await fetch("http://localhost:3000/api/auth/check", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!data.loggedIn) {
      // User not logged in, redirect to login page
      window.location.href = "login.html";
    } else {
      // User is logged in, initialize data sync
      if (window.UserDataSync && data.user) {
        await window.UserDataSync.init(data.user.id);
      }
    }
  } catch (error) {
    console.error("Auth check error:", error);
    // If server is down or error occurs, redirect to login
    window.location.href = "login.html";
  }
})();
