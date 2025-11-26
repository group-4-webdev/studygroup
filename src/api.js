import axios from "axios";

// Get API base URL from environment or use default
const getApiBaseUrl = () => {
  // Check for Vite environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check window location for production deployments
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // For production, assume backend is on same domain
    return `${protocol}//${hostname}/api`;
  }
  
  // Default to localhost for development
  return "http://localhost:5000/api";
};

export default axios.create({
  baseURL: getApiBaseUrl(),
});
