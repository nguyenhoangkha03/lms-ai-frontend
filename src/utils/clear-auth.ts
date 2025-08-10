/**
 * Utility to completely clear all authentication data and cookies
 */

export function clearAllAuthData(): void {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear all cookies by setting them to expire in the past
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Clear cookie for current domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    // Clear cookie for current domain with different path
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
    // Clear cookie for parent domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname};`;
  });
  
  console.log('🧹 All authentication data cleared');
}

export function forceLogoutAndRedirect(redirectTo: string = '/login'): void {
  clearAllAuthData();
  
  // Use window.location.replace to prevent back button issues
  window.location.replace(redirectTo);
}