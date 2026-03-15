import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { GlobalReachSection } from "@/components/landing/GlobalReachSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { FloatingSupportChat } from "@/components/landing/FloatingSupportChat";

export const LandingHero = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <LandingNavbar />
            <main className="text-slate-900 dark:text-white">
                <HeroSection />
                <FeaturesSection />
                <PricingSection />
                <StatsSection />
                <TestimonialsSection />
                <GlobalReachSection />
                <CTASection />
            </main>
            <Footer />
            <FloatingSupportChat />
        </div>
    );
};