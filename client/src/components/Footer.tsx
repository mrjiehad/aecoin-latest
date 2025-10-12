import { Facebook, Twitter, Instagram, Youtube, Shield, Zap, Award } from "lucide-react";
import footerBg from "@assets/stock_images/gta_5_los_santos_cit_316848d5.jpg";
import gta5Char from "@assets/GTA-5-Characters-GTA-6_1759562666076.png";

export function Footer() {
  return (
    <footer className="relative bg-black border-t-2 border-neon-yellow/30 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url(${footerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-black/80" />
      
      <div className="container mx-auto px-6 md:px-8 py-16 relative z-10">
        {/* Top Section with Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900/50 border border-neon-yellow/20 p-6 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-neon-yellow mb-3" />
            <h4 className="text-white font-russo text-lg uppercase mb-2">Secure Payment</h4>
            <p className="text-gray-400 font-rajdhani text-sm">100% secure transactions with encrypted payment</p>
          </div>
          <div className="bg-zinc-900/50 border border-neon-yellow/20 p-6 backdrop-blur-sm">
            <Zap className="w-8 h-8 text-neon-yellow mb-3" />
            <h4 className="text-white font-russo text-lg uppercase mb-2">Instant Delivery</h4>
            <p className="text-gray-400 font-rajdhani text-sm">Get your AECOIN codes within seconds</p>
          </div>
          <div className="bg-zinc-900/50 border border-neon-yellow/20 p-6 backdrop-blur-sm">
            <Award className="w-8 h-8 text-neon-yellow mb-3" />
            <h4 className="text-white font-russo text-lg uppercase mb-2">24/7 Support</h4>
            <p className="text-gray-400 font-rajdhani text-sm">Always here to help you anytime</p>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-2xl font-russo font-bold text-white uppercase tracking-wider mb-4">
              AE<span className="text-neon-yellow">.OFFICIAL</span>
            </div>
            <p className="text-gray-400 font-rajdhani text-sm mb-6">
              Your trusted source for AE OFFICIAL currency. Fast, secure, and reliable service since 2025.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-neon-yellow/20 border border-white/10 hover:border-neon-yellow/30 flex items-center justify-center text-gray-400 hover:text-neon-yellow transition-all"
                data-testid="link-facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-neon-yellow/20 border border-white/10 hover:border-neon-yellow/30 flex items-center justify-center text-gray-400 hover:text-neon-yellow transition-all"
                data-testid="link-twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-neon-yellow/20 border border-white/10 hover:border-neon-yellow/30 flex items-center justify-center text-gray-400 hover:text-neon-yellow transition-all"
                data-testid="link-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-neon-yellow/20 border border-white/10 hover:border-neon-yellow/30 flex items-center justify-center text-gray-400 hover:text-neon-yellow transition-all"
                data-testid="link-youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-russo text-lg uppercase tracking-wider mb-4 border-l-2 border-neon-yellow pl-3">Quick Links</h3>
            <ul className="space-y-3 font-rajdhani">
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-yellow transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#packages" className="text-gray-400 hover:text-neon-yellow transition-colors">
                  Packages
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-gray-400 hover:text-neon-yellow transition-colors">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-neon-yellow transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-russo text-lg uppercase tracking-wider mb-4 border-l-2 border-neon-yellow pl-3">Information</h3>
            <ul className="space-y-3 font-rajdhani">
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-yellow transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-yellow transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-yellow transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-yellow transition-colors">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          <div className="relative overflow-hidden">
            {/* Character Image Background */}
            <div 
              className="absolute right-0 top-0 w-full h-full opacity-15 hidden lg:block"
              style={{
                backgroundImage: `url(${gta5Char})`,
                backgroundSize: 'contain',
                backgroundPosition: 'right center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div className="relative z-10">
              <h3 className="text-white font-russo text-lg uppercase tracking-wider mb-4 border-l-2 border-neon-yellow pl-3">Payment Methods</h3>
              <p className="text-gray-400 font-rajdhani text-sm mb-4">
                We accept Malaysian payment methods
              </p>
              <div className="flex gap-2 flex-wrap">
                <div className="px-4 py-2 bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow font-russo text-xs font-bold uppercase">
                  TOYYIBPAY
                </div>
                <div className="px-4 py-2 bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow font-russo text-xs font-bold uppercase">
                  BILLPLZ
                </div>
                <div className="px-4 py-2 bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow font-russo text-xs font-bold uppercase">
                  FPX
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neon-yellow/20 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 font-rajdhani text-sm">
              © {new Date().getFullYear()} AE OFFICIAL. All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-gray-500 font-rajdhani text-sm">
              <span>Made with</span>
              <span className="text-neon-yellow">★</span>
              <span>for gamers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
