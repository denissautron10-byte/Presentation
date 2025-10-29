import { ImageWithFallback } from "./figma/ImageWithFallback";
import whalysLogo from 'figma:asset/b2032ec47ec050416fb4bb6bb408eb04244ec968.png';

export function WhalysLaptopMockup() {
  return (
    <div className="relative w-full h-full group">
      {/* Desktop setup background */}
      <ImageWithFallback 
        src="https://images.unsplash.com/photo-1606248627574-08972ca3fc76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMG1vbml0b3IlMjBzY3JlZW4lMjB3b29kZW4lMjBkZXNrJTIwd29ya3NwYWNlfGVufDF8fHx8MTc1ODE3OTc5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        alt="Computer monitor on wooden desk"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      
      {/* WHALYS logo centré au milieu */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ImageWithFallback 
          src={whalysLogo}
          alt="WHALYS Logo"
          className="w-24 h-auto object-contain"
        />
      </div>
    </div>
  );
}