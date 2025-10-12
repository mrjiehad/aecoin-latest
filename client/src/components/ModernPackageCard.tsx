import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import { useState, useRef } from "react";
import { ShoppingCart, Sparkles, Zap } from "lucide-react";

export interface Package {
  id: string;
  amount: number;
  price: number;
  originalPrice: number;
  image: string;
  badge?: string;
}

interface ModernPackageCardProps {
  package: Package;
  onAddToCart?: (pkg: Package) => void;
}

function PackageCardContent({ pkg, onAddToCart, isHovered }: { pkg: Package; onAddToCart?: (pkg: Package) => void; isHovered: boolean }) {
  const discount = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);
  
  return (
    <>
      {/* Image Background with Overlay Effects */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={pkg.image}
          alt={`${pkg.amount} AECOIN`}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.15 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          data-testid={`img-package-${pkg.id}`}
        />
        
        {/* Multi-layer Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-neon-yellow/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Animated Corner Accents */}
        <motion.div 
          className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-neon-yellow/0 group-hover:border-neon-yellow/80 transition-all duration-300"
          animate={{ 
            width: isHovered ? "48px" : "32px",
            height: isHovered ? "48px" : "32px"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-neon-yellow/0 group-hover:border-neon-yellow/80 transition-all duration-300"
          animate={{ 
            width: isHovered ? "48px" : "32px",
            height: isHovered ? "48px" : "32px"
          }}
        />
        
        {/* Badge with Enhanced Styling */}
        {pkg.badge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-gradient-to-r from-neon-yellow to-yellow-400 text-black font-bold text-xs px-4 py-1.5 uppercase shadow-lg flex items-center gap-1.5"
            style={{ clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)" }}
            data-testid={`badge-package-${pkg.id}`}
          >
            <Sparkles className="w-3 h-3" />
            {pkg.badge}
          </motion.div>
        )}
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-red-600 text-white font-bold text-xs px-3 py-1.5 uppercase shadow-lg rounded-sm">
            -{discount}%
          </div>
        )}
        
        {/* Scan Line Effect */}
        <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-20 transition-opacity duration-300">
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-neon-yellow to-transparent animate-scan-line" />
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="pb-3 pt-6 relative">
        {/* Decorative Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-neon-yellow/50 to-transparent" />
        
        <div className="text-center space-y-1">
          <motion.div 
            className="text-6xl font-bebas text-white tracking-wider gta-text-shadow"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
            data-testid={`text-package-amount-${pkg.id}`}
          >
            {pkg.amount.toLocaleString()}
          </motion.div>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-6 bg-neon-yellow/30" />
            <div className="text-sm font-rajdhani text-neon-yellow uppercase tracking-[0.2em] font-bold">
              AECOIN
            </div>
            <div className="h-px w-6 bg-neon-yellow/30" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="text-center space-y-2">
          {/* Price Display */}
          <div className="flex items-baseline justify-center gap-3">
            <motion.span 
              className="text-4xl font-bold text-neon-yellow font-bebas tracking-wide"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
              data-testid={`text-price-${pkg.id}`}
            >
              RM{pkg.price}
            </motion.span>
            {pkg.price !== pkg.originalPrice && (
              <span className="text-lg text-gray-500 line-through font-rajdhani" data-testid={`text-original-price-${pkg.id}`}>
                RM{pkg.originalPrice}
              </span>
            )}
          </div>
          
          {/* Value Indicator */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-rajdhani">
            <Zap className="w-3 h-3 text-neon-yellow" />
            <span>Instant Delivery</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-2">
        <Button
          className="w-full bg-gradient-to-r from-neon-yellow to-yellow-400 hover:from-yellow-400 hover:to-neon-yellow text-black font-bold uppercase text-sm h-12 font-rajdhani tracking-wide shadow-lg shadow-neon-yellow/30 relative overflow-hidden group/btn"
          onClick={() => onAddToCart?.(pkg)}
          data-testid={`button-add-to-cart-${pkg.id}`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            BUY NOW
          </span>
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700" />
        </Button>
      </CardFooter>
    </>
  );
}

export function ModernPackageCard({ package: pkg, onAddToCart }: ModernPackageCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number>();
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Calculate rotation based on mouse position (subtle tilt)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !boundsRef.current) return;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      const bounds = boundsRef.current;
      if (!bounds) return;
      
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      
      const normalizedX = Math.max(-0.5, Math.min(0.5, (e.clientX - centerX) / bounds.width));
      const normalizedY = Math.max(-0.5, Math.min(0.5, (e.clientY - centerY) / bounds.height));
      
      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    });
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      boundsRef.current = cardRef.current.getBoundingClientRect();
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    boundsRef.current = null;
    mouseX.set(0);
    mouseY.set(0);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  // Base card styling
  const cardClassName = "group relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-[#000000] border-2 border-white/10 hover:border-neon-yellow/60 transition-all duration-500";
  
  const cardStyle = {
    boxShadow: isHovered
      ? "0 0 40px rgba(255, 215, 0, 0.4), 0 25px 70px rgba(0, 0, 0, 0.7), inset 0 0 30px rgba(255, 215, 0, 0.05)"
      : "0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 215, 0, 0.02)",
  };

  // If reduced motion, use regular Card without 3D effect
  if (shouldReduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -8 }}
      >
        <Card
          className={cardClassName}
          style={cardStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          data-testid={`card-package-${pkg.id}`}
        >
          <PackageCardContent pkg={pkg} onAddToCart={onAddToCart} isHovered={isHovered} />
        </Card>
      </motion.div>
    );
  }

  // With 3D tilt effect
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
          willChange: "transform",
        }}
        whileHover={{ y: -12, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Card
          className={cardClassName}
          style={cardStyle}
          data-testid={`card-package-${pkg.id}`}
        >
          <PackageCardContent pkg={pkg} onAddToCart={onAddToCart} isHovered={isHovered} />
        </Card>
      </motion.div>
    </motion.div>
  );
}
