# 🔧 Bouton de Diagnostic EmailJS

## 📍 Où trouver le bouton ?

Un **bouton flottant violet/bleu** avec une icône d'engrenage ⚙️ est maintenant visible en **bas à droite de votre page**.

Il a un petit point d'exclamation rouge (!) pour indiquer qu'il s'agit d'un outil de diagnostic.

---

## 🚀 Comment l'utiliser ?

### Étape 1 : Cliquez sur le bouton
Cliquez sur le bouton flottant en bas à droite de votre page.

### Étape 2 : Entrez vos clés EmailJS
Dans la fenêtre qui s'ouvre, remplissez :

1. **Public Key** : Votre clé publique EmailJS
   - Récupérez-la sur : https://dashboard.emailjs.com/admin/account
   - Exemple : `UYr2wdCd6_5qMv9XW` ou `user_xxxxxxxxxx`

2. **Service ID** : L'ID de votre service email
   - Récupérez-le sur : https://dashboard.emailjs.com/admin/integration
   - Exemple : `service_yloo4dm`

3. **Template Admin** : (Pré-rempli avec `template_booking_admin`)
4. **Template Client** : (Pré-rempli avec `template_booking_client`)

### Étape 3 : Lancez le diagnostic
Cliquez sur **"🚀 Lancer le Diagnostic"**

### Étape 4 : Analysez les résultats
Le diagnostic va tester automatiquement :

✅ **Test 1 : Chargement EmailJS**
- Vérifie que la librairie EmailJS est bien chargée

✅ **Test 2 : Initialisation**
- Vérifie que EmailJS s'initialise avec vos clés

✅ **Test 3 : Validation des clés**
- Teste si vos clés sont valides (404 = invalides, 422 = OK)

✅ **Test 4 : Template Admin**
- Vérifie que le template admin existe et envoie un email de test

✅ **Test 5 : Template Client**
- Vérifie que le template client existe et envoie un email de test

✅ **Test 6 : Capacité d'envoi**
- Résumé final et vérification globale

---

## 🎯 Interprétation des résultats

### ✅ Tous les tests réussis (Vert)
**Félicitations !** Votre configuration est parfaite.

**Actions à faire :**
1. Copiez vos clés (bouton "📋 Copier la Configuration")
2. Ouvrez `/components/EmailJSService.tsx`
3. Remplacez les lignes 33-36 avec vos vraies clés
4. Testez votre formulaire de réservation !

### ❌ Test 3 échoué : "Clés invalides (404)"
**Problème :** Vos clés ne sont pas valides.

**Solutions :**
- Vérifiez que vous avez copié la **Public Key** (pas la Private Key)
- Reconnectez-vous sur https://dashboard.emailjs.com
- Copiez à nouveau vos clés

### ❌ Test 4 ou 5 échoué : "Template non trouvé"
**Problème :** Le template n'existe pas sur EmailJS.

**Solutions :**
- Allez sur https://dashboard.emailjs.com/admin/templates
- Créez le template manquant :
  - `template_booking_admin` pour les emails admin
  - `template_booking_client` pour les emails client
- Vérifiez que les IDs correspondent **exactement**

### ⚠️ Autres erreurs
Lisez attentivement le message d'erreur et les détails affichés sous chaque test.

---

## 🔄 Réessayer le diagnostic

Vous pouvez :
- Modifier vos clés et relancer le diagnostic
- Fermer et rouvrir la fenêtre
- Le bouton reste accessible à tout moment

---

## 💡 Astuces

### Test rapide sans ouvrir le diagnostic complet
Si vous voulez juste tester rapidement, vous pouvez aussi utiliser :
- `/test-simple.html` : Test basique
- `/diagnostic-emailjs-complet.html` : Version HTML standalone

### Désactiver le bouton en production
Si vous voulez cacher le bouton en production, éditez `/App.tsx` et commentez :
```tsx
// <EmailJSDiagnostic />
```

### Personnaliser la position
Éditez `/components/EmailJSDiagnostic.tsx` et modifiez :
```tsx
className="fixed bottom-6 right-6 ..."
```

Changez `bottom-6` et `right-6` pour déplacer le bouton.

---

## 📊 Que faire après un diagnostic réussi ?

1. ✅ **Copiez la configuration** affichée
2. ✅ **Ouvrez** `/components/EmailJSService.tsx`
3. ✅ **Remplacez** les lignes 33-36 :
   ```typescript
   const EMAILJS_DIRECT_CONFIG = {
     publicKey: 'VOTRE_VRAIE_PUBLIC_KEY',
     serviceId: 'VOTRE_VRAI_SERVICE_ID',
   };
   ```
4. ✅ **Sauvegardez** le fichier
5. ✅ **Testez** votre formulaire de réservation

---

## ❓ FAQ

**Q : Le bouton ne s'affiche pas**
R : Vérifiez que `/App.tsx` contient bien `<EmailJSDiagnostic />`

**Q : "EmailJS non chargé" au lancement du diagnostic**
R : Patientez quelques secondes, EmailJS se charge automatiquement

**Q : Puis-je utiliser le diagnostic plusieurs fois ?**
R : Oui ! Autant de fois que vous voulez

**Q : Les emails de test sont-ils vraiment envoyés ?**
R : Oui, si les tests 4 et 5 réussissent, vous recevrez 2 emails de test

**Q : Combien ça coûte ?**
R : Le diagnostic utilise votre quota EmailJS gratuit (200 emails/mois)

---

## 🆘 Support

Si le diagnostic ne résout pas votre problème :

1. **Prenez une capture d'écran** des résultats du diagnostic
2. **Notez** les messages d'erreur exacts
3. **Vérifiez** la console du navigateur (F12)
4. **Consultez** `/CHECKLIST-EMAILJS.md` pour plus de détails

---

**Prêt à diagnostiquer ?**

👉 **Cliquez sur le bouton flottant en bas à droite de votre page !** 🚀
