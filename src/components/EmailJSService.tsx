import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Interface pour les données de réservation
interface BookingData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
}

// Configuration EmailJS côté client - récupérée depuis le backend
let EMAILJS_CONFIG = {
  publicKey: '', // Sera récupérée depuis le backend
  serviceId: '', // Sera récupérée depuis le backend
  isInitialized: false
};

// Variables globales pour la configuration temporaire
declare global {
  interface Window {
    EMAILJS_PUBLIC_KEY?: string;
    emailjs?: any;
  }
}

// Fonction pour récupérer la configuration EmailJS depuis le backend
const getEmailJSConfigFromBackend = async (): Promise<{publicKey: string, serviceId: string}> => {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a1a504da/emailjs-public-key`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: Impossible de récupérer la configuration EmailJS`);
    }
    
    const data = await response.json();
    
    return {
      publicKey: data.publicKey,
      serviceId: data.serviceId
    };
  } catch (error) {
    console.error('❌ Erreur récupération config EmailJS:', error);
    throw error;
  }
};

// Fonction pour initialiser EmailJS
const initEmailJS = async () => {
  try {
    // Vérifier si EmailJS est déjà chargé globalement
    if (!window.emailjs) {
      // Import dynamique d'EmailJS pour le navigateur via CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4.3.3/dist/email.min.js';
      script.async = true;
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      
      // Attendre que emailjs soit disponible
      await new Promise(resolve => {
        const checkEmailJS = () => {
          if (window.emailjs) {
            resolve(window.emailjs);
          } else {
            setTimeout(checkEmailJS, 100);
          }
        };
        checkEmailJS();
      });
    }
    
    // Récupérer la clé publique depuis le backend si pas encore fait
    if (!EMAILJS_CONFIG.publicKey) {
      const config = await getEmailJSConfigFromBackend();
      EMAILJS_CONFIG.publicKey = config.publicKey;
      EMAILJS_CONFIG.serviceId = config.serviceId;
    }
    
    let publicKey = EMAILJS_CONFIG.publicKey;
    
    if (!publicKey) {
      throw new Error('❌ Impossible de récupérer la clé publique EmailJS depuis le backend');
    }
    
    // Initialiser EmailJS avec la clé publique
    window.emailjs.init({
      publicKey: publicKey,
      blockHeadless: true,
      limitRate: {
        id: 'booking-app',
        throttle: 10000,
      },
    });
    
    // Mettre à jour la configuration locale
    EMAILJS_CONFIG.publicKey = publicKey;
    EMAILJS_CONFIG.isInitialized = true;
    
    console.log('✅ EmailJS initialisé côté client avec clé:', publicKey.substring(0, 10) + '...');
    return window.emailjs;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation d\'EmailJS:', error);
    throw new Error(`Impossible d'initialiser le service email: ${error.message}`);
  }
};

// Fonction pour envoyer un email via EmailJS
const sendEmailViaEmailJS = async (templateId: string, templateParams: any): Promise<void> => {
  const emailjs = await initEmailJS();
  
  try {
    console.log(`📧 Envoi email avec template: ${templateId}`);
    console.log('📧 Paramètres:', templateParams);
    
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      templateId,
      templateParams
    );
    
    console.log('✅ Email envoyé avec succès:', result);
    return result;
  } catch (error) {
    console.error(`❌ Erreur envoi email ${templateId}:`, error);
    throw error;
  }
};

// Fonction pour générer l'URL d'annulation via le backend
const generateCancelUrl = async (bookingId: string): Promise<string> => {
  try {
    console.log('🔗 Génération URL annulation pour:', bookingId);
    
    // Appeler le backend pour générer le token d'annulation
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a1a504da/generate-cancel-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ bookingId })
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Erreur inconnue');
      console.warn('⚠️ Impossible de générer l\'URL d\'annulation:', response.status, errorText);
      return '';
    }
    
    const result = await response.json();
    console.log('✅ Token d\'annulation généré:', result.token);
    return result.cancelUrl || '';
  } catch (error) {
    console.error('❌ Erreur génération URL annulation:', error);
    return '';
  }
};

// Fonction principale pour envoyer les emails de confirmation
export const sendBookingConfirmationEmails = async (booking: BookingData): Promise<void> => {
  console.log('📧 === DÉBUT ENVOI EMAILS CÔTÉ CLIENT ===');
  
  try {
    // Vérification de la configuration avant envoi
    if (!EMAILJS_CONFIG.publicKey) {
      // Récupérer la configuration depuis le backend
      const config = await getEmailJSConfigFromBackend();
      EMAILJS_CONFIG.publicKey = config.publicKey;
      EMAILJS_CONFIG.serviceId = config.serviceId;
    }
    
    if (!EMAILJS_CONFIG.serviceId) {
      throw new Error('❌ Service ID EmailJS manquant. Vérifiez la configuration.');
    }
    
    console.log('✅ Configuration EmailJS vérifiée');
    
    // Génération de l'URL d'annulation
    const cancelUrl = await generateCancelUrl(booking.id);
    
    // Formatage de la date
    const appointmentDate = new Date(booking.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const createdDate = new Date(booking.createdAt).toLocaleString('fr-FR');
    
    // Paramètres communs pour les deux emails
    const commonParams = {
      client_name: booking.name,
      client_email: booking.email,
      client_phone: booking.phone,
      client_company: booking.company || 'Non renseignée',
      client_message: booking.message || 'Aucun message',
      appointment_date: appointmentDate,
      appointment_time: booking.time,
      appointment_id: booking.id,
      created_date: createdDate
    };
    
    // 1. Envoyer l'email à l'admin
    console.log('📧 Envoi email admin...');
    await sendEmailViaEmailJS('template_booking_admin', commonParams);
    console.log('✅ Email admin envoyé');
    
    // 2. Envoyer l'email de confirmation au client
    console.log('📧 Envoi email client...');
    const clientParams = {
      ...commonParams,
      cancel_url: cancelUrl
    };
    
    await sendEmailViaEmailJS('template_booking_client', clientParams);
    console.log('✅ Email client envoyé');
    
    console.log('🎉 TOUS LES EMAILS ENVOYÉS AVEC SUCCÈS');
    
    // Toast de succès
    toast.success('📧 Emails de confirmation envoyés !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des emails:', error);
    
    // Toast d'erreur avec message descriptif
    let errorMessage = 'Erreur lors de l\'envoi des emails';
    
    if (error instanceof Error) {
      if (error.message.includes('EMAILJS_PUBLIC_KEY')) {
        errorMessage = 'Configuration email manquante. Contactez l\'administrateur.';
      } else if (error.message.includes('SERVICE_ID')) {
        errorMessage = 'Service email non configuré. Contactez l\'administrateur.';
      } else if (error.message.includes('template')) {
        errorMessage = 'Template email introuvable. Contactez l\'administrateur.';
      } else {
        errorMessage = `Erreur email: ${error.message}`;
      }
    }
    
    toast.error(errorMessage);
    
    // On ne fait pas échouer la réservation si l'email échoue
    console.log('⚠️ Réservation créée mais emails échoués');
    throw error;
  } finally {
    console.log('📧 === FIN ENVOI EMAILS CÔTÉ CLIENT ===');
  }
};

// Fonction de test pour vérifier la configuration EmailJS
export const testEmailJSConfiguration = async (): Promise<boolean> => {
  try {
    console.log('🧪 Test configuration EmailJS côté client...');
    
    // Test d'initialisation d'EmailJS
    await initEmailJS();
    
    if (!EMAILJS_CONFIG.isInitialized) {
      console.error('❌ EmailJS non initialisé');
      return false;
    }
    
    console.log('✅ Configuration EmailJS valide côté client');
    return true;
  } catch (error) {
    console.error('❌ Configuration EmailJS invalide:', error);
    return false;
  }
};

// Export de la configuration pour debugging
export const getEmailJSConfig = () => ({
  hasPublicKey: !!EMAILJS_CONFIG.publicKey,
  hasServiceId: !!EMAILJS_CONFIG.serviceId,
  serviceId: EMAILJS_CONFIG.serviceId,
  isInitialized: EMAILJS_CONFIG.isInitialized,
  publicKeyLength: EMAILJS_CONFIG.publicKey?.length || 0
});

// Fonction pour réinitialiser la configuration
export const resetEmailJSConfig = () => {
  EMAILJS_CONFIG.publicKey = '';
  EMAILJS_CONFIG.isInitialized = false;
  delete window.EMAILJS_PUBLIC_KEY;
  console.log('🔄 Configuration EmailJS réinitialisée');
};

// Fonction pour configurer la clé publique (à utiliser en développement)
export const setEmailJSPublicKey = (publicKey: string) => {
  if (!publicKey || publicKey.trim().length < 10) {
    throw new Error('Clé publique EmailJS invalide');
  }
  
  EMAILJS_CONFIG.publicKey = publicKey.trim();
  EMAILJS_CONFIG.isInitialized = false; // Force la réinitialisation
  window.EMAILJS_PUBLIC_KEY = publicKey.trim();
  
  console.log('✅ Clé publique EmailJS configurée:', publicKey.substring(0, 10) + '...');
};