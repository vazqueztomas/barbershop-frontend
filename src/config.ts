const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) return envUrl;
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }
    
    return '';
  }
  return '';
};

export const API_URL = getApiBaseUrl();
