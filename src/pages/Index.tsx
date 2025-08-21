import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StoriesShowcase from "@/components/StoriesShowcase";
import ChildProfilesSection from "@/components/ChildProfilesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StoriesShowcase />
        <ChildProfilesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
