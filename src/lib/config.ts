export const config = {
  apiBase: import.meta.env.VITE_API_BASE,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  yahooClientId: import.meta.env.VITE_YAHOO_CLIENT_ID,
  yahooRedirectUri: import.meta.env.VITE_YAHOO_REDIRECT_URI,

  isLocal: import.meta.env.VITE_API_BASE.includes('localhost'),
};
