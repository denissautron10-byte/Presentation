/**
 * Charge dynamiquement la librairie EmailJS depuis le CDN
 */
export const loadEmailJS = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Vérifier si EmailJS est déjà chargé
    if (window.emailjs) {
      resolve();
      return;
    }

    // Créer le script tag
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4.3.3/dist/email.min.js';
    script.async = true;
    
    script.onload = () => {
      if (window.emailjs) {
        console.log('✅ EmailJS chargé avec succès');
        resolve();
      } else {
        console.error('❌ EmailJS chargé mais non disponible');
        reject(new Error('EmailJS non disponible après le chargement'));
      }
    };
    
    script.onerror = () => {
      console.error('❌ Erreur lors du chargement d\'EmailJS');
      reject(new Error('Erreur lors du chargement d\'EmailJS'));
    };
    
    document.head.appendChild(script);
  });
};

// Déclaration TypeScript pour window.emailjs
declare global {
  interface Window {
    emailjs?: any;
  }
}
