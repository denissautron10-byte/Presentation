import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import conceptArtImage from 'figma:asset/64be51489d0c3f397b7e746f5422db8a195997b7.png';
import newConceptArtImage from 'figma:asset/4334886f91c9bd88b3a661ee999b4d4cc5f67719.png';
import digitalProductImage from 'figma:asset/7c3cbb0373bec945b93a24b1ca31bf243446c12c.png';
import whalysImage from 'figma:asset/2eb027063a1b899a1c710bd15b4df3691b079dea.png';

const services = [
  {
    id: 1,
    title: "Concept Art - Environnements",
    description: "Création de concept arts d'environnements, du design de niveaux aux décors immersifs et atmosphériques.",
    image: newConceptArtImage,
    demoUrl: "https://drive.google.com/file/d/12QTC2gI598Oqqk57vNSOG0SZ5KcaK6ig/view?usp=sharing",
    buttonText: "Portfolio"
  },
  {
    id: 2,
    title: "L'Application Whalys",
    description: "Application web qui centralise les erreurs et leurs solutions pour rendre les studios de jeux vidéo et d'animation plus efficaces.",
    image: whalysImage,
    tutorialUrl: "https://drive.google.com/file/d/1fNcSrpc7sNSVwtkvCLdW7o_Dc-54IZOd/view?usp=sharing",
    demoUrl: "https://docs.google.com/forms/d/e/1FAIpQLSce0Iotxs5zlQhRLLn5bnsLIj5apGbHrpkOGg8uj-9zCXp6Sg/viewform?usp=header",
    buttonText: "Démo"
  },
  {
    id: 3,
    title: "Produits Digitaux",
    description: "Produits digitaux conçus pour des particuliers, des studios de jeux vidéo et d'animation, disponibles sur Gumroad.",
    image: digitalProductImage,
    demoUrl: "https://denissautron.gumroad.com/?section=E4ZWy96e36FG7ChzquXoIA==#E4ZWy96e36FG7ChzquXoIA==",
    buttonText: "Voir la boutique"
  }
];

export function Portfolio() {
  return (
    <section id="portfolio" className="pt-20 pb-0 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl">Mes Services</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Concept art, application et produits digitaux.
          </p>
        </div>
      </div>

      <div className="space-y-0 overflow-x-hidden">
        {services.map((service, index) => (
          <div key={service.id} className="bg-black text-white overflow-hidden" style={{ minHeight: '120vh' }}>
            <div className="grid md:grid-cols-2 overflow-hidden" style={{ height: '120vh' }}>
              {/* Image à gauche - moitié de page */}
              <motion.div 
                className="relative w-full h-full overflow-hidden"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <ImageWithFallback 
                  src={service.image}
                  alt={service.title}
                  className={`w-full h-full ${
                    service.id === 1 ? 'object-cover object-[90%_50%]' : 
                    service.id === 2 ? 'object-contain bg-black scale-125 md:scale-150' : 
                    service.id === 3 ? 'object-cover object-center' : 'object-cover'
                  }`}
                />
                {/* Gradient de fondu sur le bord droit */}
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
              </motion.div>

              {/* Texte à droite - moitié de page */}
              <motion.div 
                className="flex items-center justify-center p-8 md:p-12"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="space-y-8 max-w-lg">
                  <div className="space-y-6">
                    <h3 className="text-4xl md:text-5xl font-semibold text-white leading-tight">{service.title}</h3>
                    <p className="text-gray-300 text-xl md:text-2xl leading-relaxed">{service.description}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-6 pt-4">
                    {service.id === 2 ? (
                      <>
                        <Button 
                          size="lg"
                          variant="outline" 
                          className="border-white transition-colors text-lg px-8 py-4 group"
                          style={{
                            color: 'white',
                            backgroundColor: 'transparent',
                          }}
                          onClick={() => window.open(service.tutorialUrl, '_blank')}
                        >
                          <ExternalLink className="w-6 h-6 mr-3 transition-colors" style={{ color: 'inherit' }} />
                          Tutoriel
                        </Button>
                        <Button 
                          size="lg"
                          variant="outline" 
                          className="border-white transition-colors text-lg px-8 py-4 group"
                          style={{
                            color: 'white',
                            backgroundColor: 'transparent',
                          }}
                          onClick={() => window.open(service.demoUrl, '_blank')}
                        >
                          <ExternalLink className="w-6 h-6 mr-3 transition-colors" style={{ color: 'inherit' }} />
                          Inscription
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="lg"
                        variant="outline" 
                        className="border-white transition-colors text-lg px-8 py-4 group"
                        style={{
                          color: 'white',
                          backgroundColor: 'transparent',
                        }}

                        onClick={() => window.open(service.demoUrl, '_blank')}
                      >
                        <ExternalLink className="w-6 h-6 mr-3 transition-colors" style={{ color: 'inherit' }} />
                        {service.buttonText}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}