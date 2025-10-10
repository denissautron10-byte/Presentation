import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Basic health check route
app.get('/make-server-a1a504da/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// EmailJS configuration check route
app.get('/make-server-a1a504da/emailjs-check', (c) => {
  const publicKey = Deno.env.get('EMAILJS_PUBLIC_KEY')
  const privateKey = Deno.env.get('EMAILJS_PRIVATE_KEY')
  const serviceId = Deno.env.get('EMAILJS_SERVICE_ID') || 'service_yloo4dm'
  
  return c.json({
    emailjs_config: {
      publicKey: publicKey ? 'CONFIGURED' : 'MISSING',
      privateKey: privateKey ? 'CONFIGURED' : 'MISSING', 
      serviceId: serviceId,
      ready: !!(publicKey && privateKey)
    },
    timestamp: new Date().toISOString()
  })
})

// Route pour récupérer la clé publique EmailJS côté client
app.get('/make-server-a1a504da/emailjs-public-key', (c) => {
  const publicKey = Deno.env.get('EMAILJS_PUBLIC_KEY')
  const serviceId = Deno.env.get('EMAILJS_SERVICE_ID')
  
  if (!publicKey) {
    return c.json({ error: 'Clé publique EmailJS non configurée' }, 400)
  }
  
  if (!serviceId) {
    return c.json({ error: 'Service ID EmailJS non configuré' }, 400)
  }
  
  return c.json({
    publicKey: publicKey,
    serviceId: serviceId
  })
})

// Test email route (for debugging)
app.post('/make-server-a1a504da/test-email', async (c) => {
  try {
    const testBooking = {
      id: 'test-booking-123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '+33123456789',
      company: 'Test Company',
      message: 'Test message',
      date: '2025-01-15',
      time: '14:00',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString()
    }

    console.log('🧪 Starting test email...')
    await sendBookingConfirmation(testBooking)
    console.log('✅ Test email completed')
    
    return c.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    })
  } catch (error) {
    console.log('❌ Test email failed:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Available time slots configuration
const AVAILABLE_TIME_SLOTS = ["08:00", "09:00", "10:00", "14:00", "15:00"]

// Helper function to format date consistently
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

// Helper function to check if date is weekend
const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

// Helper function to check if date is valid weekday
const isValidWeekday = (date: Date): boolean => {
  const day = date.getDay()
  return day >= 1 && day <= 5 // Monday to Friday only
}

// Helper function to check if time slot is available
const isTimeSlotAvailable = async (date: string, time: string): Promise<boolean> => {
  const bookingKey = `booking-${date}-${time}`
  const existingBooking = await kv.get(bookingKey)
  return !existingBooking
}

// Helper function to get available slots for a date
const getAvailableSlotsForDate = async (date: string): Promise<string[]> => {
  const availableSlots = []
  
  for (const time of AVAILABLE_TIME_SLOTS) {
    if (await isTimeSlotAvailable(date, time)) {
      availableSlots.push(time)
    }
  }
  
  return availableSlots
}

// Get available time slots for a specific date
app.get('/make-server-a1a504da/available-slots', async (c) => {
  try {
    const dateParam = c.req.query('date')
    const currentHourParam = c.req.query('currentHour')
    const currentMinuteParam = c.req.query('currentMinute')
    const timezoneOffsetParam = c.req.query('timezoneOffset')
    
    if (!dateParam) {
      return c.json({ error: 'Date parameter is required' }, 400)
    }

    // FORCE REUNION ISLAND TIME (UTC+4) for all operations
    const reunionNow = new Date()
    // Convert current UTC time to Reunion time (UTC+4)
    reunionNow.setHours(reunionNow.getUTCHours() + 4)
    
    const reunionCurrentHour = reunionNow.getHours()
    const reunionCurrentMinute = reunionNow.getMinutes()
    const reunionToday = new Date(reunionNow)
    
    console.log('🏝️ Using Reunion Island time (UTC+4):', {
      reunionHour: reunionCurrentHour,
      reunionMinute: reunionCurrentMinute,
      reunionToday: reunionToday.toISOString(),
      utcTime: new Date().toISOString()
    })

    // Parse date more reliably for 2025
    const requestDate = new Date(dateParam + 'T00:00:00.000Z')
    
    // Reset time to midnight for accurate date comparison
    const todayForComparison = new Date(reunionToday)
    todayForComparison.setHours(0, 0, 0, 0)
    requestDate.setHours(0, 0, 0, 0)
    
    const formattedDate = formatDate(requestDate)
    const todayFormatted = formatDate(todayForComparison)
    
    console.log('📅 Date validation 2025 avec heure Réunion (UTC+4):', {
      dateParam,
      requestDate: requestDate.toISOString().split('T')[0],
      reunionToday: todayForComparison.toISOString().split('T')[0],
      todayFormatted,
      dayOfWeek: requestDate.getDay(),
      isWeekend: isWeekend(requestDate),
      isValidWeekday: isValidWeekday(requestDate),
      isPast: requestDate < todayForComparison,
      formattedDate,
      isToday: formattedDate === todayFormatted,
      reunionCurrentTime: `${reunionCurrentHour}:${reunionCurrentMinute.toString().padStart(2, '0')}`
    })
    
    // IMMEDIATE WEEKEND REJECTION - No slots ever for weekends
    if (!isValidWeekday(requestDate)) {
      console.log('❌ WEEKEND BLOCKED - No slots available for weekends')
      return c.json({ 
        availableSlots: [], 
        reason: 'weekend_blocked',
        message: 'Weekends are not available for bookings'
      })
    }
    
    // Check if date is in the past
    if (requestDate < todayForComparison) {
      console.log('❌ Date is in the past')
      return c.json({ availableSlots: [] })
    }
    
    // Check if date is a valid future date (not too far in the future - 3 months max)
    const maxDate = new Date(todayForComparison)
    maxDate.setMonth(maxDate.getMonth() + 3)
    if (requestDate > maxDate) {
      console.log('❌ Date is too far in the future (max 3 months)')
      return c.json({ availableSlots: [] })
    }

    // CRITICAL: Check if it's today and past 12h BEFORE getting slots (using Reunion time)
    if (formattedDate === todayFormatted) {
      console.log('🔍 RÈGLE DES CRÉNEAUX AUJOURD\'HUI (heure Réunion UTC+4):')
      console.log('  📅 Date:', formattedDate)
      console.log('  🕐 Heure Réunion:', `${reunionCurrentHour}:${reunionCurrentMinute.toString().padStart(2, '0')}`)
      
      // No booking allowed after 12 PM (noon) on the same day (Reunion time)
      if (reunionCurrentHour >= 12) {
        console.log('❌ APRÈS 12H (heure Réunion) - BLOCAGE DE TOUS LES CRÉNEAUX')
        return c.json({ availableSlots: [], reason: 'after_12h_today' })
      }
    }

    // Get available slots for the date
    let availableSlots = await getAvailableSlotsForDate(formattedDate)
    console.log('🕒 Available slots before time filtering:', availableSlots)

    // If it's today, filter out past time slots AND current hour (only if before 12h)
    if (formattedDate === todayFormatted) {
      // Filter out past time slots AND current hour to prevent booking too close
      availableSlots = availableSlots.filter(time => {
        const [timeHour, timeMinute] = time.split(':').map(Number)
        const timeInMinutes = timeHour * 60 + timeMinute
        const currentTimeInMinutes = reunionCurrentHour * 60 + reunionCurrentMinute
        
        // Add 60 minutes buffer - can't book within the current hour
        const isAvailable = timeInMinutes > (currentTimeInMinutes + 60)
        
        console.log(`⏰ Checking slot ${time}: ${timeInMinutes}min vs current+60min ${currentTimeInMinutes + 60}min = ${isAvailable ? 'DISPONIBLE' : 'PASSÉ'} (heure Réunion UTC+4)`)
        return isAvailable
      })
      console.log('🕒 Available slots after time filtering:', availableSlots)
    }

    console.log('✅ Final available slots:', availableSlots)
    return c.json({ availableSlots })

  } catch (error) {
    console.log('Get available slots error:', error)
    return c.json({ error: 'Failed to get available slots' }, 500)
  }
})

// Create a new booking - FULL VERSION WITH OPTIMIZED EMAIL
app.post('/make-server-a1a504da/book-appointment', async (c) => {
  console.log('🚀 Booking request received')
  
  try {
    const { name, email, phone, company, message, date, time, clientCurrentHour, clientCurrentMinute, clientTimezoneOffset } = await c.req.json()
    
    console.log('📤 Request data:', { name, email, phone, company, date, time, clientCurrentHour, clientCurrentMinute })
    
    // Validate required fields
    if (!name || !email || !phone || !date || !time) {
      return c.json({ error: 'Champs requis manquants' }, 400)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Format d\'email invalide' }, 400)
    }

    // Validate time slot
    if (!AVAILABLE_TIME_SLOTS.includes(time)) {
      return c.json({ error: 'Créneau horaire invalide' }, 400)
    }

    // Use Reunion Island time for validation (UTC+4)
    const reunionNow = new Date()
    reunionNow.setHours(reunionNow.getUTCHours() + 4)
    
    const reunionHour = reunionNow.getHours()
    const reunionMinute = reunionNow.getMinutes()
    const reunionToday = new Date(reunionNow)

    const requestDate = new Date(date + 'T00:00:00.000Z')
    const todayForComparison = new Date(reunionToday)
    todayForComparison.setHours(0, 0, 0, 0)
    requestDate.setHours(0, 0, 0, 0)
    const formattedDate = formatDate(requestDate)

    console.log('🏝️ Booking validation with Reunion time:', {
      reunionTime: `${reunionHour}:${reunionMinute.toString().padStart(2, '0')}`,
      requestDate: formattedDate,
      todayReunion: formatDate(todayForComparison)
    })

    // Check if date is valid
    if (requestDate < todayForComparison || !isValidWeekday(requestDate)) {
      const reason = requestDate < todayForComparison ? 'Date passée' : 'Weekend non autorisé'
      return c.json({ error: `Date invalide: ${reason}` }, 400)
    }

    // Check if it's today and past 12h
    if (formattedDate === formatDate(todayForComparison) && reunionHour >= 12) {
      return c.json({ error: 'Réservation non autorisée pour aujourd\'hui après 12h' }, 400)
    }

    // Check if time slot is available
    if (!(await isTimeSlotAvailable(formattedDate, time))) {
      return c.json({ error: 'Ce créneau n\'est plus disponible' }, 400)
    }

    // Create booking
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const booking = {
      id: bookingId,
      name,
      email,
      phone,
      company: company || null,
      message: message || null,
      date: formattedDate,
      time,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString()
    }

    // Save to database
    const slotKey = `booking-${formattedDate}-${time}`
    await kv.set(slotKey, booking)
    await kv.set(bookingId, booking)

    const allBookingsKey = 'all-bookings'
    const existingBookings = await kv.get(allBookingsKey) || []
    existingBookings.push(bookingId)
    await kv.set(allBookingsKey, existingBookings)

    console.log('✅ Booking saved to database:', bookingId)

    // **RESPOND IMMEDIATELY** - Les emails seront envoyés côté client
    return c.json({ 
      success: true, 
      message: 'Rendez-vous confirmé avec succès',
      bookingId,
      booking: {
        id: bookingId,
        name,
        email,
        phone,
        company: company || null,
        message: message || null,
        date: formattedDate,
        time,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.log('❌ Booking error:', error)
    return c.json({ error: 'Erreur interne du serveur' }, 500)
  }
})

// Endpoint de test pour vérifier EmailJS
app.get('/make-server-a1a504da/emailjs-check', async (c) => {
  return c.json({
    success: true,
    emailjs_config: {
      serviceId: 'service_yloo4dm',
      backend_available: true,
      timestamp: new Date().toISOString()
    }
  });
});

// Generate cancellation token for email links
app.post('/make-server-a1a504da/generate-cancel-token', async (c) => {
  try {
    const { bookingId } = await c.req.json()
    
    if (!bookingId) {
      return c.json({ error: 'Booking ID requis' }, 400)
    }

    // Vérifier que la réservation existe
    const booking = await kv.get(bookingId)
    if (!booking) {
      return c.json({ error: 'Réservation introuvable' }, 404)
    }

    // Générer un token unique d'annulation
    const cancellationToken = `cancel-${bookingId}-${Math.random().toString(36).substr(2, 9)}`
    
    // Stocker le token avec une référence vers la réservation
    await kv.set(`cancel-token-${cancellationToken}`, {
      bookingId: bookingId,
      createdAt: new Date().toISOString()
    })

    // Construire l'URL d'annulation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const cancelUrl = `${supabaseUrl}/functions/v1/make-server-a1a504da/cancel-booking?token=${cancellationToken}`

    console.log('✅ Token d\'annulation généré:', cancellationToken)
    
    return c.json({ 
      success: true, 
      cancelUrl,
      token: cancellationToken 
    })

  } catch (error) {
    console.log('❌ Erreur génération token:', error)
    return c.json({ error: 'Erreur lors de la génération du token' }, 500)
  }
})

// Cancel a booking via token (for clients)
app.get('/make-server-a1a504da/cancel-booking', async (c) => {
  try {
    const token = c.req.query('token')
    
    if (!token) {
      return c.html(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h2 style="color: #dc3545;">❌ Lien invalide</h2>
            <p>Le lien d'annulation est invalide ou manquant.</p>
          </body>
        </html>
      `)
    }

    // Get cancellation token
    const tokenData = await kv.get(`cancel-token-${token}`)
    if (!tokenData) {
      return c.html(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h2 style="color: #dc3545;">❌ Lien expiré</h2>
            <p>Ce lien d'annulation n'est plus valide ou a déjà été utilisé.</p>
          </body>
        </html>
      `)
    }

    // Get booking details
    const booking = await kv.get(tokenData.bookingId)
    if (!booking) {
      return c.html(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h2 style="color: #dc3545;">❌ Réservation introuvable</h2>
            <p>Cette réservation n'existe plus.</p>
          </body>
        </html>
      `)
    }

    // Show cancellation confirmation page
    return c.html(`
      <html>
        <head>
          <title>Annuler votre rendez-vous</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f8f9fa;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #030213; margin-bottom: 20px;">❓ Confirmer l'annulation</h2>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">Êtes-vous sûr de vouloir annuler ce rendez-vous ?</p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #030213;">📋 Détails du rendez-vous</h3>
              <p><strong>📅 Date:</strong> ${new Date(booking.date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>⏰ Heure:</strong> ${booking.time}</p>
              <p><strong>👤 Nom:</strong> ${booking.name}</p>
              <p><strong>📞 Téléphone:</strong> ${booking.phone}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <button onclick="cancelBooking()" style="background: #dc3545; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin-right: 10px;">
                ✅ Oui, annuler le rendez-vous
              </button>
              <button onclick="window.close()" style="background: #6c757d; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                ❌ Non, garder le rendez-vous
              </button>
            </div>

            <div id="result" style="margin-top: 20px;"></div>
          </div>

          <script>
            async function cancelBooking() {
              const result = document.getElementById('result');
              result.innerHTML = '<p style="color: #6c757d;">Annulation en cours...</p>';
              
              try {
                const response = await fetch('/functions/v1/make-server-a1a504da/cancel-booking', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ token: '${token}' })
                });

                const data = await response.text();
                
                if (response.ok) {
                  result.innerHTML = '<div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; border: 1px solid #c3e6cb;"><h3>✅ Rendez-vous annulé</h3><p>Votre rendez-vous a été annulé avec succès. Vous pouvez fermer cette fenêtre.</p></div>';
                } else {
                  result.innerHTML = '<div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; border: 1px solid #f5c6cb;"><h3>❌ Erreur</h3><p>Une erreur est survenue lors de l\\'annulation.</p></div>';
                }
              } catch (error) {
                result.innerHTML = '<div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; border: 1px solid #f5c6cb;"><h3>❌ Erreur</h3><p>Une erreur est survenue lors de l\\'annulation.</p></div>';
              }
            }
          </script>
        </body>
      </html>
    `)

  } catch (error) {
    console.log('Cancel booking page error:', error)
    return c.html(`
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
          <h2 style="color: #dc3545;">❌ Erreur</h2>
          <p>Une erreur est survenue lors du chargement de la page d'annulation.</p>
        </body>
      </html>
    `)
  }
})



// Process cancellation (POST)
app.post('/make-server-a1a504da/cancel-booking', async (c) => {
  try {
    const { token } = await c.req.json()
    
    if (!token) {
      return c.json({ error: 'Token manquant' }, 400)
    }

    // Get cancellation token
    const tokenData = await kv.get(`cancel-token-${token}`)
    if (!tokenData) {
      return c.json({ error: 'Token invalide ou expiré' }, 400)
    }

    // Get booking details
    const booking = await kv.get(tokenData.bookingId)
    if (!booking) {
      return c.json({ error: 'Réservation introuvable' }, 404)
    }

    // Remove slot reservation
    const slotKey = `booking-${booking.date}-${booking.time}`
    await kv.del(slotKey)

    // Remove booking
    await kv.del(tokenData.bookingId)

    // Remove cancellation token
    await kv.del(`cancel-token-${token}`)

    // Update bookings list
    const allBookingsKey = 'all-bookings'
    const existingBookings = await kv.get(allBookingsKey) || []
    const updatedBookings = existingBookings.filter(id => id !== tokenData.bookingId)
    await kv.set(allBookingsKey, updatedBookings)

    return c.json({ success: true, message: 'Réservation annulée avec succès' })

  } catch (error) {
    console.log('Cancel booking error:', error)
    return c.json({ error: 'Erreur lors de l\'annulation' }, 500)
  }
})



// Helper function to send email with retry logic (DÉSACTIVÉ - EmailJS côté client maintenant)
/*
async function sendEmailWithRetry(url: string, payload: any, retries = 2): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Tentative ${attempt + 1}/${retries + 1} d'envoi email...`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000), // 8 second timeout per attempt
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        console.log(`✅ Email envoyé avec succès à la tentative ${attempt + 1}`);
        return response;
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
    } catch (error) {
      lastError = error;
      console.log(`❌ Tentative ${attempt + 1} échouée:`, error.message);
      
      if (attempt < retries) {
        const delay = (attempt + 1) * 1000; // Backoff: 1s, 2s, 3s
        console.log(`⏳ Attente de ${delay}ms avant nouvelle tentative...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Échec envoi email après toutes les tentatives');
}
*/

// Helper function to send booking confirmation via EmailJS (DÉSACTIVÉ - EmailJS côté client maintenant)
/*
async function sendBookingConfirmation(booking: any) {
  console.log('📧 Starting email confirmation process...')
  
  const publicKey = Deno.env.get('EMAILJS_PUBLIC_KEY')
  const privateKey = Deno.env.get('EMAILJS_PRIVATE_KEY')
  const serviceId = Deno.env.get('EMAILJS_SERVICE_ID') || 'service_yloo4dm'
  
  console.log('🔍 EmailJS Configuration Check:')
  console.log('  📋 Service ID:', serviceId)
  console.log('  🔑 Public Key:', publicKey ? `${publicKey.substring(0, 10)}...` : 'MISSING')
  console.log('  🔑 Private Key:', privateKey ? `${privateKey.substring(0, 10)}...` : 'MISSING')
  
  if (!publicKey || !privateKey) {
    const errorMsg = `EmailJS configuration incomplete. Missing: ${!publicKey ? 'PUBLIC_KEY ' : ''}${!privateKey ? 'PRIVATE_KEY' : ''}`
    console.log('❌', errorMsg)
    throw new Error(errorMsg)
  }

  console.log('✅ EmailJS configuration OK, proceeding with email sending...')

  // Generate cancellation token
  const cancellationToken = `cancel-${booking.id}-${Math.random().toString(36).substr(2, 9)}`
  await kv.set(`cancel-token-${cancellationToken}`, {
    bookingId: booking.id,
    createdAt: new Date().toISOString()
  })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const cancelUrl = `${supabaseUrl}/functions/v1/make-server-a1a504da/cancel-booking?token=${cancellationToken}`

  try {
    // Send admin notification email
    console.log('📧 Sending admin email via EmailJS...')
    
    const adminPayload = {
      service_id: serviceId,
      template_id: 'template_booking_admin',
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
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
      }
    }

    await sendEmailWithRetry('https://api.emailjs.com/api/v1.0/email/send', adminPayload)
    console.log('✅ Admin email sent successfully via EmailJS')

    // Send client confirmation email
    console.log('📧 Sending client email via EmailJS...')
    
    const clientPayload = {
      service_id: serviceId,
      template_id: 'template_booking_client',
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
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
        cancel_url: cancelUrl
      }
    }

    await sendEmailWithRetry('https://api.emailjs.com/api/v1.0/email/send', clientPayload)
    console.log('✅ Client email sent successfully via EmailJS')
    console.log('🎉 All emails sent successfully via EmailJS!')

  } catch (error) {
    console.log('❌ Email sending error details:')
    console.log('  📧 Error type:', error.name)
    console.log('  📧 Error message:', error.message)
    console.log('  📧 Full error:', error)
    throw error
  }
}
*/

// Test EmailJS configuration
app.get('/make-server-a1a504da/test-email-config', (c) => {
  const publicKey = Deno.env.get('EMAILJS_PUBLIC_KEY')
  const privateKey = Deno.env.get('EMAILJS_PRIVATE_KEY') 
  const serviceId = Deno.env.get('EMAILJS_SERVICE_ID') || 'service_yloo4dm'
  
  return c.json({
    success: true,
    config: {
      serviceId,
      publicKeyConfigured: !!publicKey,
      privateKeyConfigured: !!privateKey,
      publicKeyLength: publicKey ? publicKey.length : 0,
      privateKeyLength: privateKey ? privateKey.length : 0
    }
  })
})

// Test sending a simple email with detailed diagnostics
app.post('/make-server-a1a504da/test-send-email', async (c) => {
  console.log('🧪 === DÉBUT TEST EMAIL DIAGNOSTIC ===')
  
  try {
    const { email } = await c.req.json()
    
    if (!email) {
      return c.json({ error: 'Email address required' }, 400)
    }

    // Vérification des variables d'environnement
    const publicKey = Deno.env.get('EMAILJS_PUBLIC_KEY')
    const privateKey = Deno.env.get('EMAILJS_PRIVATE_KEY')
    const serviceId = Deno.env.get('EMAILJS_SERVICE_ID') || 'service_yloo4dm'
    
    console.log('🔧 Configuration EmailJS:')
    console.log('  📋 Service ID:', serviceId)
    console.log('  🔑 Public Key:', publicKey ? `${publicKey.substring(0, 15)}...` : 'MANQUANTE')
    console.log('  🔑 Private Key:', privateKey ? `${privateKey.substring(0, 15)}...` : 'MANQUANTE')
    
    if (!publicKey || !privateKey) {
      const missing = []
      if (!publicKey) missing.push('EMAILJS_PUBLIC_KEY')
      if (!privateKey) missing.push('EMAILJS_PRIVATE_KEY')
      
      console.log('❌ Variables manquantes:', missing.join(', '))
      return c.json({ 
        success: false, 
        error: `Variables d'environnement manquantes: ${missing.join(', ')}`,
        details: 'Configurez les secrets dans Figma Make'
      }, 400)
    }

    const testBooking = {
      id: 'diagnostic-' + Date.now(),
      name: 'Test Diagnostic',
      email: email,
      phone: '+262123456789',
      company: 'Test Company Diagnostic',
      message: 'Email de diagnostic du système de réservation',
      date: '2024-12-20',
      time: '14:00',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }

    console.log('📧 Envoi email de test vers:', email)
    console.log('📝 Données de test:', JSON.stringify(testBooking, null, 2))
    
    // Test avec gestion d'erreur détaillée
    try {
      await sendBookingConfirmation(testBooking)
      console.log('✅ Email envoyé avec succès')
      
      return c.json({ 
        success: true, 
        message: 'Email de diagnostic envoyé avec succès',
        details: {
          targetEmail: email,
          serviceId: serviceId,
          timestamp: new Date().toISOString(),
          bookingId: testBooking.id
        }
      })
      
    } catch (emailError) {
      console.log('❌ Erreur lors de l\'envoi email:')
      console.log('  📧 Type:', emailError.name)
      console.log('  📧 Message:', emailError.message)
      console.log('  📧 Stack:', emailError.stack)
      
      return c.json({ 
        success: false, 
        error: emailError.message,
        errorType: emailError.name,
        details: 'Erreur détaillée dans les logs Supabase',
        config: {
          serviceConfigured: !!serviceId,
          publicKeyConfigured: !!publicKey,
          privateKeyConfigured: !!privateKey
        }
      }, 500)
    }
    
  } catch (error) {
    console.log('❌ Erreur générale du test:')
    console.log('  🚨 Type:', error.name)
    console.log('  🚨 Message:', error.message)
    console.log('  🚨 Stack:', error.stack)
    
    return c.json({ 
      success: false, 
      error: error.message,
      errorType: error.name,
      details: 'Erreur générale - vérifiez les logs Supabase'
    }, 500)
  } finally {
    console.log('🧪 === FIN TEST EMAIL DIAGNOSTIC ===')
  }
})

// Test direct de l'API EmailJS (diagnostic avancé)
app.post('/make-server-a1a504da/test-emailjs-api', async (c) => {
  console.log('🔧 === TEST DIRECT API EMAILJS ===')
  
  try {
    const { email, testType } = await c.req.json()
    
    const publicKey = Deno.env.get('EMAILJS_PUBLIC_KEY')
    const privateKey = Deno.env.get('EMAILJS_PRIVATE_KEY')
    const serviceId = Deno.env.get('EMAILJS_SERVICE_ID') || 'service_yloo4dm'
    
    if (!publicKey || !privateKey) {
      return c.json({ 
        success: false, 
        error: 'Clés EmailJS manquantes',
        missing: {
          publicKey: !publicKey,
          privateKey: !privateKey
        }
      }, 400)
    }

    // Test du template admin
    const templateId = testType === 'client' ? 'template_booking_client' : 'template_booking_admin'
    
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        client_name: 'Test Direct API',
        client_email: email || 'test@example.com',
        client_phone: '+262123456789',
        client_company: 'Test Company API',
        client_message: 'Test direct de l\'API EmailJS',
        appointment_date: 'Test Date API',
        appointment_time: 'Test Time',
        appointment_id: 'test-api-' + Date.now(),
        created_date: new Date().toLocaleString('fr-FR'),
        cancel_url: 'https://example.com/cancel'
      }
    }

    console.log('📡 Appel API EmailJS:')
    console.log('  🔗 URL: https://api.emailjs.com/api/v1.0/email/send')
    console.log('  📋 Service:', serviceId)
    console.log('  📄 Template:', templateId)
    console.log('  📧 Target:', email)

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    
    console.log('📡 Réponse API EmailJS:')
    console.log('  📊 Status:', response.status)
    console.log('  📝 Response:', responseText)
    console.log('  ✅ Headers:', JSON.stringify([...response.headers]))

    if (response.ok) {
      return c.json({
        success: true,
        message: 'Test API EmailJS réussi',
        details: {
          status: response.status,
          response: responseText,
          templateTested: templateId,
          serviceId: serviceId
        }
      })
    } else {
      return c.json({
        success: false,
        error: 'Échec API EmailJS',
        details: {
          status: response.status,
          response: responseText,
          templateTested: templateId,
          serviceId: serviceId
        }
      }, response.status)
    }

  } catch (error) {
    console.log('❌ Erreur test API EmailJS:', error)
    return c.json({
      success: false,
      error: error.message,
      type: error.name
    }, 500)
  } finally {
    console.log('🔧 === FIN TEST DIRECT API EMAILJS ===')
  }
})

Deno.serve(app.fetch)