import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Zap, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";

function TypingText({ text, speed = 100 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return <>{displayedText}</>;
}

function CyclingTypingText({ phrases, speed = 80, pauseDuration = 2000 }: { phrases: string[]; speed?: number; pauseDuration?: number }) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    const typingDuration = currentPhrase.length * speed;
    const totalDuration = typingDuration + pauseDuration;

    const timer = setTimeout(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [currentPhraseIndex, phrases, speed, pauseDuration]);

  return <TypingText text={phrases[currentPhraseIndex]} speed={speed} />;
}

import gta1 from "@assets/gta1_1759551121573.png";
import trailerThumb from "@assets/hqdefault_1759551446234.jpg";

interface UltimateGamingHeroProps {
  onShopClick?: () => void;
  onPackagesClick?: () => void;
  onRankingsClick?: () => void;
}

export function UltimateGamingHero({ onShopClick, onPackagesClick, onRankingsClick }: UltimateGamingHeroProps) {
  const subtitlePhrases = [
    "PREMIUM CURRENCY",
    "INSTANT DELIVERY",
    "SECURE PAYMENT",
    "24/7 AVAILABLE"
  ];

  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex items-center">
      {/* Dynamic Background */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0"
        style={{ 
          backgroundImage: `url(${gta1})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 opacity-5" 
             style={{
               backgroundImage: 'linear-gradient(rgba(255,215,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.1) 1px, transparent 1px)',
               backgroundSize: '50px 50px'
             }} 
        />
      </motion.div>

      <div className="container mx-auto px-6 md:px-8 relative z-10 py-20">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left Content - 3 columns */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3 space-y-8"
          >
            {/* Title Section */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block"
              >
                <div className="h-1 w-20 bg-gradient-to-r from-neon-yellow to-transparent mb-6" />
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl sm:text-7xl md:text-8xl font-bebas text-white leading-none tracking-wider"
                style={{
                  textShadow: '4px 4px 0px rgba(0,0,0,1), 0 0 40px rgba(255, 215, 0, 0.4)',
                  letterSpacing: '0.05em'
                }}
              >
                AECOIN
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl sm:text-3xl md:text-4xl font-russo text-neon-yellow uppercase"
                style={{
                  textShadow: '2px 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(255, 215, 0, 0.3)'
                }}
              >
                <CyclingTypingText phrases={subtitlePhrases} speed={70} pauseDuration={2000} />
              </motion.div>
            </div>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-gray-300 text-base md:text-lg font-rajdhani leading-relaxed max-w-2xl"
            >
              The official virtual currency for AE OFFICIAL. Unlock premium vehicles, exclusive weapon skins, and rare items instantly. Fast, secure, and available 24/7.
            </motion.p>

            {/* Features Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="grid grid-cols-3 gap-4 max-w-2xl"
            >
              <div className="bg-black/40 border border-neon-yellow/20 p-4 backdrop-blur-sm hover:border-neon-yellow/50 transition-all">
                <Zap className="w-6 h-6 text-neon-yellow mb-2" />
                <div className="text-white font-bebas text-lg">INSTANT</div>
                <div className="text-gray-500 text-xs font-rajdhani uppercase">Delivery</div>
              </div>
              <div className="bg-black/40 border border-neon-yellow/20 p-4 backdrop-blur-sm hover:border-neon-yellow/50 transition-all">
                <Shield className="w-6 h-6 text-neon-yellow mb-2" />
                <div className="text-white font-bebas text-lg">SECURE</div>
                <div className="text-gray-500 text-xs font-rajdhani uppercase">Payment</div>
              </div>
              <div className="bg-black/40 border border-neon-yellow/20 p-4 backdrop-blur-sm hover:border-neon-yellow/50 transition-all">
                <Clock className="w-6 h-6 text-neon-yellow mb-2" />
                <div className="text-white font-bebas text-lg">24/7</div>
                <div className="text-gray-500 text-xs font-rajdhani uppercase">Support</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Button
                onClick={onShopClick}
                className="bg-neon-yellow hover:bg-yellow-400 text-black font-bold text-base px-12 h-14 uppercase font-russo tracking-wider shadow-lg shadow-neon-yellow/30 transition-all duration-300 hover:scale-105"
                data-testid="button-buy-coins"
              >
                BUY NOW
              </Button>
              <Button
                onClick={onRankingsClick}
                variant="outline"
                className="border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/80 font-bold text-base px-12 h-14 uppercase font-russo tracking-wider transition-all duration-300"
                data-testid="button-explore-rankings"
              >
                RANKINGS
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - Video - 2 columns */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md space-y-4">
              <div className="text-right">
                <span className="text-neon-yellow text-sm font-russo uppercase tracking-widest">
                  Watch Trailer
                </span>
              </div>
              
              <a 
                href="https://youtu.be/tV95N0TIltc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative block w-full aspect-video rounded-none overflow-hidden group cursor-pointer border-2 border-neon-yellow/30 hover:border-neon-yellow transition-all duration-300"
                data-testid="link-release-trailer"
              >
                <img 
                  src={trailerThumb} 
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-neon-yellow/20 animate-ping" />
                    <div className="relative w-20 h-20 bg-neon-yellow group-hover:bg-white transition-all duration-300 flex items-center justify-center shadow-2xl">
                      <Play className="w-10 h-10 text-black ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
                
                {/* Corner Brackets */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-neon-yellow/50 group-hover:border-neon-yellow transition-colors" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-neon-yellow/50 group-hover:border-neon-yellow transition-colors" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
