# Portfolio Professionnel - Concept Artist

Site web professionnel pour présenter mes services de concept artist spécialisé en environnements pour jeux vidéo et créateur de l'application Whalys.

## 🚀 Fonctionnalités

- **Page de présentation professionnelle** avec section Hero moderne
- **Portfolio interactif** pour présenter mes projets et créations
- **Section tarification** avec lien vers ma grille tarifaire
- **Système de réservation de rendez-vous** avec intégration Google Calendar
- **Notifications email automatiques** en français
- **Interface responsive** avec design moderne
- **Couleurs de marque personnalisées**

## 🛠️ Technologies

- **Frontend**: React + TypeScript + Tailwind CSS v4
- **Backend**: Supabase Edge Functions (Hono)
- **Base de données**: Supabase PostgreSQL
- **Authentification**: Supabase Auth
- **Email**: Intégration SMTP
- **Calendrier**: Google Calendar API
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## 📅 Système de Réservation

### Créneaux disponibles
- **Horaires**: 10h, 11h, 14h, 15h, 16h, 17h
- **Jours**: Lundi à Vendredi uniquement
- **Limitation**: Maximum 3 mois à l'avance
- **Restriction**: Plus de créneaux disponibles après 12h le jour même

### Fonctionnalités
- Réservation de rendez-vous téléphoniques
- Confirmation automatique par email
- Synchronisation avec Google Calendar
- Interface moderne et intuitive

## 🎨 Design

- **Palette de couleurs**: Couleurs de marque personnalisées
- **Typography**: Système typographique cohérent
- **Animations**: Transitions fluides et modernes
- **Responsive**: Compatible desktop et mobile

## 📝 Structure du Projet

```
├── App.tsx                 # Point d'entrée principal
├── components/
│   ├── Header.tsx         # Navigation principale
│   ├── Hero.tsx           # Section de présentation
│   ├── Portfolio.tsx      # Galerie de projets
│   ├── PricingSection.tsx # Section tarification
│   ├── BookingSystem.tsx  # Système de réservation
│   ├── Footer.tsx         # Pied de page
│   └── ui/                # Composants UI réutilisables
├── styles/
│   └── globals.css        # Styles globaux et tokens
├── supabase/
│   └── functions/
│       └── server/        # Backend Supabase
└── utils/
    └── supabase/          # Configuration Supabase
```

## 🔧 Installation et Développement

1. **Cloner le repository**
   ```bash
   git clone https://github.com/denissautron10-byte/Presentation.git
   cd Presentation
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Supabase**
   - Créer un projet Supabase
   - Configurer les variables d'environnement
   - Déployer les Edge Functions

4. **Lancer en développement**
   ```bash
   npm run dev
   ```

## 📧 Contact

Pour toute question ou demande de collaboration, utilisez le système de réservation intégré au site.

---

**Spécialisé en**: Concept Art • Environnements de Jeux Vidéo • Application Whalys