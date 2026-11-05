import axios from "axios";

// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    // If the request succeeds, just return the response
    return response;
  },
  (error) => {
    // Check if the error is 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Redirecting to login...");
      
      // 1. Clear authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      // 2. Prevent redirect loop if we are already on the login page
      if (window.location.pathname !== "/login") {
        // 3. Force redirect
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);