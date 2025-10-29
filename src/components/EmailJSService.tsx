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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ CONFIGURATION EMAILJS - VOUS DEVEZ RENSEIGNER VOS VRAIES CLÉS ICI ⚠️
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 🚨 ERREUR ACTUELLE: "404 Account not found"
//    → Les clés ci-dessous sont des EXEMPLES et ne fonctionnent PAS
//
// 📋 SOLUTION (5-10 minutes):
//    1. Ouvrez dans votre navigateur: /START-HERE.html
//    2. Suivez le guide pour récupérer vos vraies clés EmailJS
//    3. Copiez-les ci-dessous
//
// 🔗 Ou allez directement sur: https://dashboard.emailjs.com/admin/account
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const EMAILJS_DIRECT_CONFIG = {
  publicKey: 'lTSnFFA17kTev9xI_',  // ⬅️ ❌ EXEMPLE - REMPLACEZ PAR VOTRE VRAIE CLÉ
  serviceId: 'service_yloo4dm',    // ⬅️ ❌ EXEMPLE - REMPLACEZ PAR VOTRE VRAI SERVICE ID
};

let EMAILJS_CONFIG = {
  publicKey: EMAILJS_DIRECT_CONFIG.publicKey,
  serviceId: EMAILJS_DIRECT_CONFIG.serviceId,
  isInitialized: false,
  lastRefresh: 0
};

// Variables globales pour la configuration temporaire
declare global {
  interface Window {
    EMAILJS_PUBLIC_KEY?: string;
    emailjs?: any;
  }
}

// Fonction pour obtenir la configuration EmailJS (depuis la config locale)
export const getEmailJSConfig = (): {publicKey: string, serviceId: string} => {
  console.log('🔑 Utilisation de la configuration EmailJS locale');
  
  if (!EMAILJS_DIRECT_CONFIG.publicKey || !EMAILJS_DIRECT_CONFIG.serviceId) {
    console.error('❌ Configuration EmailJS manquante!');
    console.error('📝 Veuillez renseigner vos clés dans /components/EmailJSService.tsx ligne 24-27');
    console.error('🔗 Récupérez vos clés sur: https://dashboard.emailjs.com/admin/account');
    throw new Error('Configuration EmailJS manquante - Veuillez renseigner EMAILJS_DIRECT_CONFIG');
  }
  
  console.log('✅ Configuration EmailJS valide:', {
    serviceId: EMAILJS_CONFIG.serviceId,
    publicKeyPrefix: EMAILJS_CONFIG.publicKey?.substring(0, 10) + '...'
  });
  
  return {
    publicKey: EMAILJS_CONFIG.publicKey,
    serviceId: EMAILJS_CONFIG.serviceId
  };
};

// Fonction pour initialiser EmailJS
const initEmailJS = async () => {
  try {
    // Vérifier si EmailJS est déjà chargé globalement
    if (!window.emailjs) {
      console.log('📦 Chargement de la librairie EmailJS...');
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
      
      console.log('✅ Librairie EmailJS chargée');
    }
    
    // Récupérer la configuration locale
    const config = getEmailJSConfig();
    
    // Initialiser EmailJS avec la clé publique (une seule fois)
    if (!EMAILJS_CONFIG.isInitialized) {
      console.log('🔧 Initialisation d\'EmailJS...');
      window.emailjs.init({
        publicKey: config.publicKey,
        blockHeadless: true,
        limitRate: {
          id: 'booking-app',
          throttle: 10000,
        },
      });
      
      EMAILJS_CONFIG.isInitialized = true;
      console.log('✅ EmailJS initialisé avec clé:', config.publicKey.substring(0, 10) + '...');
    }
    
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
    console.log('📧 Service ID:', EMAILJS_CONFIG.serviceId);
    
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
    console.log('✅ URL d\'annulation générée:', result.cancelUrl);
    return result.cancelUrl;
  } catch (error) {
    console.warn('⚠️ Erreur lors de la génération de l\'URL d\'annulation:', error);
    return '';
  }
};

// Fonction pour envoyer les emails de confirmation de réservation
export const sendBookingConfirmationEmails = async (booking: BookingData) => {
  console.log('📧 === DÉBUT ENVOI EMAILS CÔTÉ CLIENT ===');
  console.log('📧 Booking data:', booking);
  
  try {
    // Générer l'URL d'annulation
    const cancelUrl = await generateCancelUrl(booking.id);
    
    // Préparer les paramètres pour l'email admin
    const adminParams = {
      client_name: booking.name,
      client_email: booking.email,
      client_phone: booking.phone,
      client_company: booking.company || 'Non renseignée',
      client_message: booking.message || 'Aucun message',
      appointment_date: new Date(booking.date).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      appointment_time: booking.time,
      appointment_id: booking.id,
      created_date: new Date(booking.createdAt).toLocaleString('fr-FR')
    };
    
    console.log('📧 Envoi email admin...');
    await sendEmailViaEmailJS('template_booking_admin', adminParams);
    console.log('✅ Email admin envoyé');
    
    // Préparer les paramètres pour l'email client
    const clientParams = {
      client_name: booking.name,
      client_email: booking.email,
      client_phone: booking.phone,
      client_company: booking.company || 'Non renseignée',
      client_message: booking.message || 'Aucun message',
      appointment_date: new Date(booking.date).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      appointment_time: booking.time,
      appointment_id: booking.id,
      created_date: new Date(booking.createdAt).toLocaleString('fr-FR'),
      cancel_url: cancelUrl || 'Non disponible'
    };
    
    console.log('📧 Envoi email client...');
    await sendEmailViaEmailJS('template_booking_client', clientParams);
    console.log('✅ Email client envoyé');
    
    console.log('🎉 TOUS LES EMAILS ENVOYÉS AVEC SUCCÈS');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des emails:', error);
    
    // Toast d'erreur avec message descriptif
    let errorMessage = 'Erreur lors de l\'envoi des emails';
    
    // Vérifier le type d'erreur et afficher un message approprié
    if (error && typeof error === 'object' && 'status' in error) {
      const status = error.status;
      const text = error.text || '';
      
      if (status === 404) {
        // Compte EmailJS introuvable
        errorMessage = '❌ CONFIGURATION EMAILJS INVALIDE: Vos clés ne sont pas valides. Ouvrez /GUIDE-RECUPERATION-CLES-EMAILJS.html';
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERREUR 404: Account not found');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('🔴 VOS CLÉS EMAILJS NE SONT PAS VALIDES!');
        console.error('');
        console.error('📋 SOLUTION:');
        console.error('1. Ouvrez ce fichier dans votre navigateur:');
        console.error('   → /GUIDE-RECUPERATION-CLES-EMAILJS.html');
        console.error('');
        console.error('2. Suivez le guide pour récupérer vos vraies clés');
        console.error('');
        console.error('3. Ou allez directement sur:');
        console.error('   → https://dashboard.emailjs.com/admin/account');
        console.error('');
        console.error('4. Copiez vos clés dans:');
        console.error('   → /components/EmailJSService.tsx (lignes 24-27)');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } else if (status === 412) {
        // Gmail reconnection needed
        errorMessage = '⚠️ Votre rendez-vous est confirmé, mais l\'email n\'a pas pu être envoyé. Vous serez contacté directement.';
        console.error('❌ ERREUR 412: Le compte Gmail doit être reconnecté dans le dashboard EmailJS');
      } else if (status === 422) {
        // Template not found
        errorMessage = '❌ TEMPLATE EMAILJS INTROUVABLE: Créez les templates sur EmailJS. Voir /GUIDE-RECUPERATION-CLES-EMAILJS.html';
        console.error('❌ ERREUR 422: Template not found - Créez les templates template_booking_admin et template_booking_client');
      } else if (status === 403) {
        // Invalid credentials
        errorMessage = '❌ CLÉS EMAILJS INVALIDES: Vérifiez vos clés. Voir /GUIDE-RECUPERATION-CLES-EMAILJS.html';
        console.error('❌ ERREUR 403: Invalid credentials - Vérifiez votre Public Key et Service ID');
      } else {
        errorMessage = `Erreur EmailJS ${status}: ${text}`;
      }
    } else if (error instanceof Error) {
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
    console.log('🧪 Test configuration EmailJS...');
    
    // Test d'initialisation d'EmailJS
    await initEmailJS();
    
    console.log('✅ Configuration EmailJS OK');
    return true;
  } catch (error) {
    console.error('❌ Configuration EmailJS invalide:', error);
    return false;
  }
};
