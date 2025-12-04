
import { ImageWithFallback } from "./figma/ImageWithFallback";
import profilePhoto from '../assets/imageV2.png';

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
    <section id="about" className="px-6 bg-slate-900 scroll-mt-20 min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text on the left */}
          <div className="space-y-6 text-left">
            <h2 className="text-2xl md:text-4xl tracking-tight text-white">
              <span className="block">À propos</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Ne laissez plus vos réseaux sociaux à l'abandon. Je vous accompagne avec une communication visuelle cohérente et régulière pour garder le lien avec vos clients.
            </p>
          </div>

          {/* Image on the right */}
          <div className="flex justify-center md:pl-20">
            <ImageWithFallback 
              src={profilePhoto}
              alt="Photo de Denis Sautron" 
              className="w-full max-w-[280px] rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
