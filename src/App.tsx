import { Toaster } from "./components/ui/sonner";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Portfolio } from "./components/Portfolio";
import { PricingSection } from "./components/PricingSection";
import { BookingSystem } from "./components/BookingSystem";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <Hero />
      <Portfolio />
      <PricingSection />
      <BookingSystem />
      <Footer />
      <Toaster />
    </div>
  );
}