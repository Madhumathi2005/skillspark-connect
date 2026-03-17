import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroIllustration from "@/assets/hero-illustration.png";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="section-padding pt-28 md:pt-36 overflow-hidden">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-amber-light/50 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles size={14} className="text-primary" />
              AI-Powered Learning
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
              Teach what you know.{" "}
              <span className="text-primary">Learn</span> what you love.
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
              Connect with people who have the skills you want to learn — and share your expertise in return. Powered by AI for perfect matches.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl">
                Start Swapping
                <ArrowRight size={20} />
              </Button>
              <Button variant="hero-outline" size="xl">
                See How It Works
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-10">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">2,400+ learners</p>
                <p className="text-xs text-muted-foreground">joined this month</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-amber-light/30 rounded-3xl blur-3xl -z-10 scale-90" />
              <img
                src={heroIllustration}
                alt="People exchanging skills — one teaching guitar, another working on a laptop"
                className="w-full max-w-lg animate-float"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
