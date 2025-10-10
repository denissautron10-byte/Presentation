import React from 'react';
import { Button } from "./ui/button";

export function Header() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-700/90 backdrop-blur-md border-b border-slate-600 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4">
        <nav className="flex items-center justify-between w-full gap-2 sm:gap-4">
          <button 
            onClick={() => scrollToSection('about')}
            className="font-semibold text-white hover:text-blue-200 transition-colors cursor-pointer text-left text-sm md:text-base whitespace-nowrap"
          >
            À propos
          </button>
          
          <button 
            onClick={() => scrollToSection('portfolio')}
            className="text-gray-200 hover:text-white transition-colors text-sm md:text-base font-semibold flex items-center justify-center whitespace-nowrap"
          >
            Mes services
          </button>

          <Button 
            onClick={() => scrollToSection('booking')}
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 text-sm md:text-base px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2 text-center whitespace-nowrap"
          >
            <span className="hidden xs:inline">Prendre </span>RDV
          </Button>
        </nav>
      </div>
    </header>
  );
}