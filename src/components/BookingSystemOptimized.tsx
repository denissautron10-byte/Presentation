import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, User, Mail, Phone, Building, MessageSquare, CheckCircle, Loader2, ChevronLeft, ChevronRight, Wifi, WifiOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from '../utils/supabase/info';

const AVAILABLE_TIME_SLOTS = ["10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export function BookingSystem() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });

  // Generate available dates (weekdays only, next 3 months) - Memoized to prevent infinite loops
  const allAvailableDates = React.useMemo(() => {
    const dates = [];
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);

    const currentDate = new Date(today);
    
    while (currentDate <= maxDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, []);

  // Filter dates for current month view
  const getMonthDates = useCallback((month: Date) => {
    return allAvailableDates.filter(date => 
      date.getMonth() === month.getMonth() && 
      date.getFullYear() === month.getFullYear()
    );
  }, [allAvailableDates]);

  const currentMonthDates = getMonthDates(currentMonth);

  // Navigation functions
  const canGoToPreviousMonth = () => {
    const today = new Date();
    return currentMonth.getMonth() !== today.getMonth() || currentMonth.getFullYear() !== today.getFullYear();
  };

  const canGoToNextMonth = () => {
    const today = new Date();
    const maxMonth = new Date();
    maxMonth.setMonth(today.getMonth() + 2);
    return currentMonth.getMonth() < maxMonth.getMonth() || currentMonth.getFullYear() < maxMonth.getFullYear();
  };

  const goToPreviousMonth = () => {
    if (canGoToPreviousMonth()) {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      setCurrentMonth(newMonth);
    }
  };

  const goToNextMonth = () => {
    if (canGoToNextMonth()) {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      setCurrentMonth(newMonth);
    }
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Optimized fetch with better error handling and fallback
  const fetchAvailableSlots = useCallback(async (date: string) => {
    setLoading(true);
    setIsOnline(true);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const timezoneOffset = now.getTimezoneOffset();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a1a504da/available-slots?date=${date}&currentHour=${currentHour}&currentMinute=${currentMinute}&timezoneOffset=${timezoneOffset}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
        setIsOnline(true);
      } else {
        console.error('Erreur serveur:', response.status);
        setIsOnline(false);
        setAvailableSlots(AVAILABLE_TIME_SLOTS); // Fallback mode
        toast.error("Mode hors ligne activé - créneaux approximatifs");
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Erreur réseau:', error);
      setIsOnline(false);
      setAvailableSlots(AVAILABLE_TIME_SLOTS); // Fallback mode
      
      if (error.name === 'AbortError') {
        toast.error("Connexion lente - mode hors ligne activé");
      } else {
        toast.error("Erreur de connexion - mode hors ligne activé");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch available time slots for selected date
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, fetchAvailableSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedDate || !selectedTime) {
      toast.error("Veuillez sélectionner une date et une heure");
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSubmitting(true);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout for booking

    try {
      const now = new Date();
      const requestBody = {
        ...formData,
        date: selectedDate,
        time: selectedTime,
        clientCurrentHour: now.getHours(),
        clientCurrentMinute: now.getMinutes(),
        clientTimezoneOffset: now.getTimezoneOffset()
      };
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a1a504da/book-appointment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        toast.success("Rendez-vous confirmé ! Vous recevrez un email de confirmation.");
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          message: ""
        });
        setSelectedDate("");
        setSelectedTime("");
        setAvailableSlots([]);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Erreur de réponse serveur" }));
        console.error('❌ Booking failed:', errorData);
        toast.error(errorData.error || `Erreur serveur (${response.status})`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("❌ Request failed:", error);
      
      if (error.name === 'AbortError') {
        toast.error("La requête a pris trop de temps. Veuillez réessayer ou contacter par email.");
      } else {
        toast.error(`Erreur de connexion. Contactez-nous par email : ${error.message || 'Erreur inconnue'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const canShowForm = () => {
    return selectedDate && selectedTime;
  };

  return (
    <section id="booking" className="py-20 modern-booking-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl">Prendre rendez-vous</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Parlons de votre projet ensemble ! Consultation téléphonique de 30 minutes.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="modern-card modern-card-animate">
            <CardHeader className="relative bg-gradient-to-br from-primary/10 via-accent/40 to-secondary/20 rounded-t-2xl p-8 border-0 -m-px overflow-hidden">
              <div className="absolute inset-0 bg-muted/80"></div>
              <div className="relative z-10">
                <CardTitle className="flex items-center gap-3 mb-2 text-primary text-xl">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  Planifier votre consultation
                  {!isOnline && (
                    <Badge variant="outline" className="ml-auto">
                      <WifiOff className="w-3 h-3 mr-1" />
                      Mode hors ligne
                    </Badge>
                  )}
                  {isOnline && (
                    <Badge variant="outline" className="ml-auto">
                      <Wifi className="w-3 h-3 mr-1" />
                      En ligne
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-2 text-muted-foreground text-base leading-relaxed">
                  Sélectionnez d'abord une date, puis choisissez votre créneau horaire préféré
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Choisir une date *
                  </label>
                  
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between bg-accent/30 p-3 rounded-lg">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={goToPreviousMonth}
                      disabled={!canGoToPreviousMonth()}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <h3 className="font-medium capitalize">
                      {formatMonthYear(currentMonth)}
                    </h3>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={goToNextMonth}
                      disabled={!canGoToNextMonth()}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  {currentMonthDates.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {currentMonthDates.map((date) => {
                        const dateStr = formatDateForInput(date);
                        const isSelected = selectedDate === dateStr;
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        return (
                          <Button
                            key={dateStr}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className={`h-auto p-3 flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105 ${
                              isSelected ? "ring-2 ring-primary shadow-lg" : ""
                            }`}
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setSelectedTime("");
                            }}
                          >
                            <span className="text-xs opacity-70">
                              {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                            </span>
                            <span className="font-medium text-lg">
                              {date.getDate()}
                            </span>
                            {isToday && (
                              <Badge variant="secondary" className="text-xs">
                                Aujourd'hui
                              </Badge>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/50 rounded-lg">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Aucune date disponible ce mois-ci
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Utilisez les flèches pour naviguer vers un autre mois
                      </p>
                    </div>
                  )}
                  
                  {selectedDate && (
                    <div className="w-full text-sm text-muted-foreground p-3 bg-muted rounded border">
                      <strong>Date sélectionnée :</strong> {formatDate(new Date(selectedDate + 'T00:00:00'))}
                    </div>
                  )}
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div className="space-y-4">
                    <label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Choisir un créneau horaire *
                    </label>
                    
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="ml-2">Chargement des créneaux...</span>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="space-y-3">
                        {!isOnline && (
                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                            <p className="text-amber-800 text-sm">
                              ⚠️ Mode hors ligne - Les créneaux affichés sont indicatifs. 
                              Votre réservation sera vérifiée lors de la confirmation.
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          {availableSlots.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={selectedTime === time ? "default" : "outline"}
                              className={`time-slot-modern ${
                                selectedTime === time ? "ring-2 ring-primary" : ""
                              }`}
                              onClick={() => setSelectedTime(time)}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-muted/50 rounded-lg">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground mb-2">
                          Aucun créneau disponible pour cette date
                        </p>
                        {selectedDate === new Date().toISOString().split('T')[0] && (
                          <p className="text-xs text-muted-foreground">
                            ⚠️ Les réservations pour aujourd'hui ne sont plus possibles après 12h
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Form */}
                {canShowForm() && (
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Vos informations
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2">
                          <User className="w-4 h-4 inline mr-1" />
                          Nom complet *
                        </label>
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Votre nom"
                          className="form-input-modern"
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2">
                          <Mail className="w-4 h-4 inline mr-1" />
                          Email *
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="votre@email.com"
                          className="form-input-modern"
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2">
                          <Phone className="w-4 h-4 inline mr-1" />
                          Téléphone *
                        </label>
                        <Input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+33 6 12 34 56 78"
                          className="form-input-modern"
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2">
                          <Building className="w-4 h-4 inline mr-1" />
                          Entreprise (optionnel)
                        </label>
                        <Input
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          placeholder="Nom de votre entreprise"
                          className="form-input-modern"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-2">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        Message (optionnel)
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Décrivez brièvement votre projet ou vos besoins..."
                        rows={4}
                        className="form-input-modern"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                {canShowForm() && (
                  <div className="border-t pt-6">
                    <div className="bg-accent/50 p-4 rounded-lg mb-4">
                      <h4 className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        Récapitulatif de votre rendez-vous
                      </h4>
                      <p className="text-sm">
                        <strong>Date :</strong> {formatDate(new Date(selectedDate + 'T00:00:00'))}
                      </p>
                      <p className="text-sm">
                        <strong>Heure :</strong> {selectedTime}
                      </p>
                      <p className="text-sm">
                        <strong>Durée :</strong> 30 minutes (appel téléphonique)
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Confirmation en cours...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmer le rendez-vous
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Vous recevrez un email de confirmation avec les détails du rendez-vous
                    </p>
                    
                    {!isOnline && (
                      <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mt-3">
                        <p className="text-orange-800 text-xs text-center">
                          📧 En cas de problème, contactez directement par email : denis.sautron@gmail.com
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}