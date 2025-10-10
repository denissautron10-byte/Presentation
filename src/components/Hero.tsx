import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import profilePhoto from 'figma:asset/6a84f0f2afd452934969c6a14d2799419d7a0822.png';

export function Hero() {
  const scrollToBooking = () => {
    const element = document.getElementById('booking');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPortfolio = () => {
    const element = document.getElementById('portfolio');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const downloadCV = () => {
    // Vous pouvez remplacer cette URL par l'URL de votre CV
    const cvUrl = '/cv-sautron-denis.pdf';
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = 'CV-Sautron-Denis.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="about" className="pt-20 pb-16 px-6 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center justify-center place-items-center">
          <div className="relative">
            <div className="relative w-full max-w-md ml-0 md:ml-[-2rem] mr-auto">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative">
                <ImageWithFallback 
                  src={profilePhoto}
                  alt="Photo de profil professionnelle"
                  className="w-full h-full object-cover object-[55%_center]"
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                Disponible pour nouveaux projets
              </Badge>
              <h1 className="text-4xl md:text-5xl tracking-tight text-white">
                <span className="block">Sautron Denis</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Concept artist spécialisé en environnements 
                et créateur de Whalys, application web pour équipes de développement.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                
                
              </div>
            </div>

            <div className="pt-8 border-t border-gray-600">
              {/* Section Mes Services */}
              <div className="grid grid-cols-3 gap-8 mb-6">
                <div>
                  <h3 className="text-2xl text-white">30+</h3>
                  <p className="text-gray-300">Concept arts créés</p>
                </div>
                <div>
                  <h3 className="text-2xl text-white">3</h3>
                  <p className="text-gray-300">Années d'expérience</p>
                </div>
                <div>
                  <h3 className="text-2xl text-white">1</h3>
                  <p className="text-gray-300">App lancée (Whalys)</p>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </section>
  );
}