import { Linkedin, Mail, Instagram, Image } from "lucide-react";
import { Button } from "./ui/button";
import artstationLogo from 'figma:asset/e31406869b7ea175f63c2e9ebe46ae591771a183.png';
import newArtstationLogo from 'figma:asset/18d7e6fa9328529ed6121605c20f4dc3b4ffbfa1.png';

export function Footer() {
  return (
    <footer className="bg-muted/30 py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <div className="text-center space-y-3 mb-6">
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Réseaux sociaux
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => window.open('https://www.linkedin.com/in/denis-sautron-58323b205/', '_blank')}
            >
              <Linkedin className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="https://www.instagram.com/denissautron/" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-5 h-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="https://www.artstation.com/denissautron" target="_blank" rel="noopener noreferrer">
                <img src={newArtstationLogo} alt="ArtStation" className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Removed À propos section */}
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 Mon Profil. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}