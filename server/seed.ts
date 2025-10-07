import { db } from "./db";
import { packages } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Create AECOIN packages with originalPrice
  const packageData = [
    {
      name: "AECOIN 500",
      description: "Perfect starter package for new players in Los Santos",
      price: "50",
      originalPrice: "60",
      aecoinAmount: 500,
      codesPerPackage: 1,
      featured: false,
      imageUrl: "/attached_assets/COINS1_1759562148670.jpg",
    },
    {
      name: "AECOIN 1000",
      description: "Level up your game with this popular package",
      price: "98",
      originalPrice: "110",
      aecoinAmount: 1000,
      codesPerPackage: 1,
      featured: true,
      imageUrl: "/attached_assets/COINS2_1759562148673.jpg",
    },
    {
      name: "AECOIN 3000",
      description: "Become a major player with this premium package",
      price: "295",
      originalPrice: "310",
      aecoinAmount: 3000,
      codesPerPackage: 1,
      featured: true,
      imageUrl: "/attached_assets/COINS3_1759562148676.jpg",
    },
    {
      name: "AECOIN 5000",
      description: "Build your empire with this powerful package",
      price: "490",
      originalPrice: "510",
      aecoinAmount: 5000,
      codesPerPackage: 1,
      featured: false,
      imageUrl: "/attached_assets/COINS4_1759562148677.jpg",
    },
    {
      name: "AECOIN 10000",
      description: "The ultimate package for serious players",
      price: "980",
      originalPrice: "1010",
      aecoinAmount: 10000,
      codesPerPackage: 1,
      featured: true,
      imageUrl: "/attached_assets/COINS5_1759562148678.jpg",
    },
  ];

  for (const pkg of packageData) {
    await db.insert(packages).values(pkg);
    console.log(`Created package: ${pkg.name}`);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
