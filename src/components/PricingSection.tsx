import React from "react";
import { Button } from "./ui/button";
import { Euro, Gamepad2, Palette, Rocket } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function PricingSection() {
  const [activeService, setActiveService] = useState(0);

  const services = [
    {
      id: 0,
      title: "Whalys",
      icon: Rocket,
      description: "Application révolutionnaire",
      longDescription: "Whalys est mon projet phare : une application innovante qui révolutionne l'expérience utilisateur avec des fonctionnalités avancées et une interface moderne.",
      features: ["Interface intuitive", "Fonctionnalités avancées", "Performance optimisée", "Support technique"],
      color: "from-blue-500/20 to-purple-500/20",
      iconColor: "text-blue-600"
    },
    {
      id: 1,
      title: "Concept Art Environnements",
      icon: Palette,
      description: "Création d'univers immersifs",
      longDescription: "Spécialisé dans la création d'environnements pour jeux vidéo, je donne vie à vos univers avec un style artistique unique et une attention particulière aux détails.",
      features: ["Environnements de jeux", "Illustrations conceptuelles", "Matte painting", "Design d'architecture"],
      color: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-600"
    },
    {
      id: 2,
      title: "Produits Digitaux",
      icon: Gamepad2,
      description: "Solutions digitales complètes",
      longDescription: "De la conception à la réalisation, je crée des produits digitaux sur mesure qui répondent parfaitement à vos besoins et dépassent vos attentes.",
      features: ["Applications web", "Interfaces utilisateur", "Expérience utilisateur", "Développement sur mesure"],
      color: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-600"
    }
  ];

  const showPricing = () => {
    const pricingUrl = 'https://drive.google.com/file/d/1uLn_ppQdg2M-wwNZ52r-Kdj34SShHowW/view?usp=sharing';
    window.open(pricingUrl, '_blank');
  };

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-secondary/20 to-accent/20">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground mb-6">
            Prêt à donner vie à votre projet ?
          </p>
          <Button 
            size="lg" 
            onClick={showPricing}
            className="px-8 py-3 text-lg"
          >
            <Euro className="w-5 h-5 mr-2" />
            Voir mes tarifs
          </Button>
        </motion.div>
      </div>
    </section>
  );
}