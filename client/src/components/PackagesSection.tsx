import { UltimatePackageCard } from "./UltimatePackageCard";
import type { Package } from "./UltimatePackageCard";

interface PackagesSectionProps {
  packages: Package[];
  onAddToCart?: (pkg: Package) => void;
}

export function PackagesSection({ packages, onAddToCart }: PackagesSectionProps) {
  return (
    <section id="packages" className="min-h-screen bg-black flex items-center py-20">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block">
            <div className="h-1 w-20 bg-neon-yellow mx-auto mb-4" />
          </div>
          
          <h2
            className="text-5xl md:text-6xl lg:text-7xl font-bebas text-white tracking-wider uppercase"
            style={{
              textShadow: '3px 3px 0px rgba(0,0,0,1), 0 0 30px rgba(255, 215, 0, 0.3)'
            }}
            data-testid="text-section-title"
          >
            CHOOSE YOUR PACKAGE
          </h2>

          <p className="text-gray-400 font-rajdhani text-lg max-w-2xl mx-auto">
            Select your AECOIN package and get instant access to premium content
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
          {packages.map((pkg) => (
            <UltimatePackageCard key={pkg.id} package={pkg} onAddToCart={onAddToCart} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-4">
          <div className="inline-block bg-zinc-900 border border-zinc-800 px-8 py-4">
            <p className="text-gray-400 font-rajdhani text-sm mb-2">
              Need a custom package or bulk order?
            </p>
            <button className="border-2 border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:text-black font-russo font-bold uppercase text-sm px-8 h-11 transition-all duration-300">
              CONTACT US
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
