import { useState } from "react";

interface GallerySectionProps {
  images: string[];
  onCtaClick?: () => void;
}

const categories = [
  "All",
  "Vehicles",
  "Properties",
  "Weapons",
  "Heists",
  "Business",
  "Racing",
  "Territory",
  "Lifestyle",
];

const categoryLabels = [
  { category: "Vehicles", label: "Luxury Supercars" },
  { category: "Properties", label: "High-End Apartments" },
  { category: "Weapons", label: "Military Equipment" },
  { category: "Heists", label: "Criminal Operations" },
  { category: "Business", label: "Nightclub Empire" },
  { category: "Racing", label: "Street Racing" },
  { category: "Territory", label: "Gang Territory" },
  { category: "Lifestyle", label: "Penthouse Living" },
];

export function GallerySection({ images, onCtaClick }: GallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  // Map images to categories for filtering
  const imageCategories = images.map((_, index) => {
    const labelData = categoryLabels[index % categoryLabels.length];
    return labelData?.category || "All";
  });

  // Filter images based on active category
  const filteredImages = activeCategory === "All" 
    ? images 
    : images.filter((_, index) => imageCategories[index] === activeCategory);

  return (
    <section id="gallery" className="min-h-screen bg-[#000000] flex items-center py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-3">
          <span className="text-neon-yellow font-rajdhani font-semibold text-sm tracking-widest uppercase">
            SHOWCASE
          </span>
        </div>

        <h2
          className="text-4xl md:text-6xl lg:text-7xl font-bebas text-center mb-4 tracking-wider uppercase text-white"
          data-testid="text-gallery-title"
        >
          AE OFFICIAL LIFESTYLE
        </h2>

        <p className="text-center text-gray-300 font-rajdhani text-lg mb-12 max-w-3xl mx-auto">
          See what awaits you in the most dangerous and lucrative city in the world
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 font-russo font-bold text-sm uppercase tracking-wide transition-all ${
                activeCategory === category
                  ? "bg-neon-yellow text-black shadow-lg shadow-neon-yellow/30"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
              data-testid={`tab-${category.toLowerCase()}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Show filtered images */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {filteredImages.length > 0 ? (
            filteredImages.slice(0, 8).map((image, index) => {
              const originalIndex = images.indexOf(image);
              const labelData = categoryLabels[originalIndex % categoryLabels.length];
              return (
                <div
                  key={`${image}-${index}`}
                  className="relative aspect-[4/3] overflow-hidden group cursor-pointer border-2 border-white/10 hover:border-neon-yellow/50 transition-all"
                  data-testid={`img-gallery-${index}`}
                >
                  <img
                    src={image}
                    alt={labelData?.label || `Gallery ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="text-neon-yellow font-russo text-xs font-bold uppercase tracking-wide mb-1">
                        {labelData?.category}
                      </div>
                      <div className="text-white font-bebas text-xl">
                        {labelData?.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 font-rajdhani text-lg">
                No images in this category yet
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
