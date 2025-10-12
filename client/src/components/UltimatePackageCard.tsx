import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { ShoppingCart, Sparkles } from "lucide-react";

export interface Package {
  id: string;
  amount: number;
  price: number;
  originalPrice: number;
  image: string;
  badge?: string;
}

interface UltimatePackageCardProps {
  package: Package;
  onAddToCart?: (pkg: Package) => void;
}

export function UltimatePackageCard({ package: pkg, onAddToCart }: UltimatePackageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const discount = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className="group relative overflow-hidden bg-gradient-to-b from-zinc-900 to-black border-2 border-zinc-800 hover:border-neon-yellow/60 transition-all duration-500 h-full"
        style={{
          boxShadow: isHovered
            ? "0 0 40px rgba(255, 215, 0, 0.3), 0 20px 60px rgba(0, 0, 0, 0.8)"
            : "0 10px 30px rgba(0, 0, 0, 0.5)",
        }}
        data-testid={`card-package-${pkg.id}`}
      >
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <motion.img
            src={pkg.image}
            alt={`${pkg.amount} AECOIN`}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.6 }}
            data-testid={`img-package-${pkg.id}`}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-600 text-white font-bold text-sm px-3 py-1.5 uppercase font-russo shadow-lg">
              -{discount}% OFF
            </div>
          )}
          
          {/* Featured Badge */}
          {pkg.badge && (
            <div className="absolute top-4 right-4 bg-neon-yellow text-black font-bold text-xs px-3 py-1.5 uppercase font-russo flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3 h-3" />
              {pkg.badge}
            </div>
          )}

          {/* Corner Accents */}
          <motion.div 
            className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-yellow/0 group-hover:border-neon-yellow/80 transition-all duration-300"
            animate={{ 
              width: isHovered ? "40px" : "32px",
              height: isHovered ? "40px" : "32px"
            }}
          />
          <motion.div 
            className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-yellow/0 group-hover:border-neon-yellow/80 transition-all duration-300"
            animate={{ 
              width: isHovered ? "40px" : "32px",
              height: isHovered ? "40px" : "32px"
            }}
          />
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Amount */}
          <div className="text-center space-y-2">
            <motion.div 
              className="text-5xl font-bebas text-white tracking-wider"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
              style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(255, 215, 0, 0.2)'
              }}
              data-testid={`text-package-amount-${pkg.id}`}
            >
              {pkg.amount.toLocaleString()}
            </motion.div>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-neon-yellow/40" />
              <div className="text-sm font-russo text-neon-yellow uppercase tracking-widest">
                AECOIN
              </div>
              <div className="h-px w-8 bg-neon-yellow/40" />
            </div>
          </div>

          {/* Price */}
          <div className="text-center space-y-1">
            <div className="flex items-baseline justify-center gap-3">
              <motion.span 
                className="text-4xl font-bold text-neon-yellow font-bebas"
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
                data-testid={`text-price-${pkg.id}`}
              >
                RM{pkg.price}
              </motion.span>
              {pkg.price !== pkg.originalPrice && (
                <span className="text-lg text-gray-600 line-through font-rajdhani" data-testid={`text-original-price-${pkg.id}`}>
                  RM{pkg.originalPrice}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 font-rajdhani uppercase tracking-wide">
              Instant Delivery
            </div>
          </div>

          {/* Buy Button */}
          <Button
            className="w-full bg-neon-yellow hover:bg-yellow-400 text-black font-bold uppercase text-sm h-12 font-russo tracking-wider shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon-yellow/40"
            onClick={() => onAddToCart?.(pkg)}
            data-testid={`button-add-to-cart-${pkg.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            BUY NOW
          </Button>
        </div>

        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-t from-neon-yellow/0 via-neon-yellow/0 to-neon-yellow/0 pointer-events-none transition-all duration-500 ${isHovered ? 'from-neon-yellow/5 via-neon-yellow/0' : ''}`} />
      </Card>
    </motion.div>
  );
}
