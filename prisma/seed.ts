import fs from "fs";
import path from "path";

// Explicitly parse and load .env file to override system-wide environment variables
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.warn("Failed to load .env file manually:", e);
}

import { PrismaClient, Prisma } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning up database...");
  // Clean up in reverse relation order
  await prisma.storeSetting.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.size.deleteMany();

  console.log("Creating Sizes...");
  const sizes = await Promise.all([
    prisma.size.create({ data: { name: "US 8", value: "8", system: "US" } }),
    prisma.size.create({ data: { name: "US 9", value: "9", system: "US" } }),
    prisma.size.create({ data: { name: "US 10", value: "10", system: "US" } }),
    prisma.size.create({ data: { name: "US 11", value: "11", system: "US" } }),
    prisma.size.create({ data: { name: "US 12", value: "12", system: "US" } }),
  ]);

  console.log("Creating Categories...");
  const catLifestyle = await prisma.category.create({
    data: {
      name: "Lifestyle",
      slug: "lifestyle",
      description: "Everyday casual sneakers built for comfort and style.",
    },
  });

  const catRunning = await prisma.category.create({
    data: {
      name: "Running",
      slug: "running",
      description: "Performance running shoes designed to push your limits.",
    },
  });

  const catBasketball = await prisma.category.create({
    data: {
      name: "Basketball",
      slug: "basketball",
      description: "High-top court shoes optimized for grip and performance.",
    },
  });

  console.log("Creating Brands...");
  const brandNike = await prisma.brand.create({
    data: {
      name: "Nike",
      slug: "nike",
      description: "Just Do It. Discover the innovative world of Nike sneakers.",
    },
  });

  const brandAdidas = await prisma.brand.create({
    data: {
      name: "Adidas",
      slug: "adidas",
      description: "Impossible is nothing. Premium sports and streetwear shoes.",
    },
  });

  const brandJordan = await prisma.brand.create({
    data: {
      name: "Jordan",
      slug: "jordan",
      description: "Inspired by greatness. The gold standard of court and street fashion.",
    },
  });

  const brandNB = await prisma.brand.create({
    data: {
      name: "New Balance",
      slug: "new-balance",
      description: "Independent since 1906. Unmatched comfort, craftsmanship and heritage.",
    },
  });

  console.log("Creating Products...");

  const sneakerSeeds = [
    {
      name: "Air Jordan 1 Retro High OG",
      slug: "air-jordan-1-retro-high-og",
      description: "The sneaker that started it all. Featuring premium leather construction, classic Jordan branding, and an encapsulated Air-Sole unit for absolute comfort.",
      sku: "555088-105",
      price: new Prisma.Decimal("180.00"),
      compareAtPrice: new Prisma.Decimal("220.00"),
      costPrice: new Prisma.Decimal("75.00"),
      status: "PUBLISHED",
      gender: "MEN",
      categoryId: catLifestyle.id,
      brandId: brandJordan.id,
      averageRating: 4.8,
      reviewCount: 154,
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=600&auto=format&fit=crop",
      variants: [
        { color: "Chicago Red", colorHex: "#C8102E", stock: 15, skuSuffix: "CHI" },
        { color: "Royal Blue", colorHex: "#0047AB", stock: 8, skuSuffix: "ROY" },
      ],
    },
    {
      name: "Nike Air Max 270",
      slug: "nike-air-max-270",
      description: "Nike's first lifestyle Air Max delivers style, comfort and big attitude. Inspired by Air Max icons, it showcases Nike's greatest innovation with its large window and fresh array of colors.",
      sku: "AH8050-002",
      price: new Prisma.Decimal("160.00"),
      compareAtPrice: null,
      costPrice: new Prisma.Decimal("60.00"),
      status: "PUBLISHED",
      gender: "MEN",
      categoryId: catLifestyle.id,
      brandId: brandNike.id,
      averageRating: 4.6,
      reviewCount: 98,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
      variants: [
        { color: "Triple Black", colorHex: "#000000", stock: 25, skuSuffix: "BLK" },
        { color: "White Volt", colorHex: "#CEFF1A", stock: 12, skuSuffix: "VLT" },
      ],
    },
    {
      name: "Adidas Ultraboost Light - Core Black",
      slug: "adidas-ultraboolst-light-black",
      description: "Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever. The magic lies in the Light BOOST midsole, a new generation of adidas BOOST.",
      sku: "HQ6339-BLK",
      price: new Prisma.Decimal("190.00"),
      compareAtPrice: new Prisma.Decimal("200.00"),
      costPrice: new Prisma.Decimal("80.00"),
      status: "PUBLISHED",
      gender: "WOMEN",
      categoryId: catRunning.id,
      brandId: brandAdidas.id,
      averageRating: 4.9,
      reviewCount: 210,
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=600&auto=format&fit=crop",
      color: "Core Black",
      colorHex: "#111111",
      colorGroup: "adidas-ultraboolst-light",
      variants: [
        { color: "Core Black", colorHex: "#111111", stock: 20, skuSuffix: "CBK" },
      ],
    },
    {
      name: "Adidas Ultraboost Light - Cloud White",
      slug: "adidas-ultraboolst-light-white",
      description: "Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever. The magic lies in the Light BOOST midsole, a new generation of adidas BOOST.",
      sku: "HQ6339-WHT",
      price: new Prisma.Decimal("190.00"),
      compareAtPrice: new Prisma.Decimal("200.00"),
      costPrice: new Prisma.Decimal("80.00"),
      status: "PUBLISHED",
      gender: "WOMEN",
      categoryId: catRunning.id,
      brandId: brandAdidas.id,
      averageRating: 4.9,
      reviewCount: 210,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop",
      color: "Cloud White",
      colorHex: "#FFFFFF",
      colorGroup: "adidas-ultraboolst-light",
      variants: [
        { color: "Cloud White", colorHex: "#FFFFFF", stock: 15, skuSuffix: "CWH" },
      ],
    },
    {
      name: "New Balance 550 Vintage White",
      slug: "new-balance-550-vintage-white",
      description: "Originally worn by pros, the new 550 pays tribute to the 1989 original with classic details reminiscent of the era — simple, clean and true to its legacy.",
      sku: "BB550PB1",
      price: new Prisma.Decimal("120.00"),
      compareAtPrice: null,
      costPrice: new Prisma.Decimal("45.00"),
      status: "PUBLISHED",
      gender: "MEN",
      categoryId: catLifestyle.id,
      brandId: brandNB.id,
      averageRating: 4.5,
      reviewCount: 88,
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop",
      variants: [
        { color: "Green/White", colorHex: "#0D5F3A", stock: 10, skuSuffix: "GRN" },
        { color: "Navy/White", colorHex: "#1D2F54", stock: 14, skuSuffix: "NVY" },
      ],
    },
    {
      name: "Nike Air Force 1 '07",
      slug: "nike-air-force-1-07",
      description: "The radiance lives on in the Nike Air Force 1 '07, the basketball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash.",
      sku: "CW2288-111",
      price: new Prisma.Decimal("115.00"),
      compareAtPrice: null,
      costPrice: new Prisma.Decimal("38.00"),
      status: "PUBLISHED",
      gender: "WOMEN",
      categoryId: catLifestyle.id,
      brandId: brandNike.id,
      averageRating: 4.7,
      reviewCount: 320,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop",
      variants: [
        { color: "Triple White", colorHex: "#FFFFFF", stock: 50, skuSuffix: "WHT" },
      ],
    },
    {
      name: "Air Jordan 4 Retro Military Blue",
      slug: "air-jordan-4-retro-military-blue",
      description: "Back in its original shape and colors, the Air Jordan 4 Retro Military Blue returns with premium leather, mesh inserts, and the legendary visible Air cushioning.",
      sku: "FV5029-141",
      price: new Prisma.Decimal("215.00"),
      compareAtPrice: new Prisma.Decimal("250.00"),
      costPrice: new Prisma.Decimal("95.00"),
      status: "PUBLISHED",
      gender: "KIDS",
      categoryId: catBasketball.id,
      brandId: brandJordan.id,
      averageRating: 4.9,
      reviewCount: 145,
      image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=600&auto=format&fit=crop",
      variants: [
        { color: "Military Blue", colorHex: "#2C5D88", stock: 8, skuSuffix: "MBL" },
      ],
    },
    {
      name: "New Balance 990v6 Grey",
      slug: "new-balance-990v6-grey",
      description: "The designers of the first 990 were tasked with creating the single best running shoe on the market. The 990v6 continues this legacy with FuelCell midsole cushioning.",
      sku: "M990GL6",
      price: new Prisma.Decimal("200.00"),
      compareAtPrice: null,
      costPrice: new Prisma.Decimal("90.00"),
      status: "PUBLISHED",
      gender: "MEN",
      categoryId: catRunning.id,
      brandId: brandNB.id,
      averageRating: 4.8,
      reviewCount: 75,
      image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600&auto=format&fit=crop",
      variants: [
        { color: "Classic Grey", colorHex: "#8E918F", stock: 12, skuSuffix: "GRY" },
      ],
    },
    {
      name: "Adidas NMD_R1 V2",
      slug: "adidas-nmd-r1-v2",
      description: "Always evolving, the NMD_R1 V2 puts a technical spin on a modern classic. Boost cushioning makes every step feel effortless, keeping you moving through city streets.",
      sku: "GX6263",
      price: new Prisma.Decimal("150.00"),
      compareAtPrice: new Prisma.Decimal("170.00"),
      costPrice: new Prisma.Decimal("55.00"),
      status: "PUBLISHED",
      gender: "KIDS",
      categoryId: catLifestyle.id,
      brandId: brandAdidas.id,
      averageRating: 4.4,
      reviewCount: 65,
      image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop",
      variants: [
        { color: "Core Black/Solar Red", colorHex: "#FF4500", stock: 18, skuSuffix: "BSR" },
      ],
    },
    {
      name: "Converse Chuck Taylor All Star 70s High",
      slug: "converse-chuck-taylor-all-star-70s-high",
      description: "The Chuck 70 mixes the best details from the '70s Chuck with impeccable craftsmanship and premium materials. An elevated style icon, it features more cushioning to keep you looking and feeling good all day.",
      sku: "162050C",
      price: new Prisma.Decimal("90.00"),
      compareAtPrice: null,
      costPrice: new Prisma.Decimal("25.00"),
      status: "PUBLISHED",
      gender: "WOMEN",
      categoryId: catLifestyle.id,
      brandId: brandNike.id,
      averageRating: 4.7,
      reviewCount: 190,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
      variants: [
        { color: "Parchment", colorHex: "#EADECA", stock: 30, skuSuffix: "PAR" },
        { color: "Black White", colorHex: "#111111", stock: 40, skuSuffix: "BKW" },
      ],
    },
    {
      name: "Vans Old Skool Classic",
      slug: "vans-old-skool-classic",
      description: "First known as the Vans #36, the Old Skool debuted in 1977 with a unique new addition: a random doodle drawn by founder Paul Van Doren. Today, the famous Vans Sidestripe has become the unmistakable hallmark of the brand.",
      sku: "VN000D3HY28",
      price: new Prisma.Decimal("70.00"),
      compareAtPrice: null,
      costPrice: new Prisma.Decimal("20.00"),
      status: "PUBLISHED",
      gender: "WOMEN",
      categoryId: catLifestyle.id,
      brandId: brandAdidas.id,
      averageRating: 4.6,
      reviewCount: 250,
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=600&auto=format&fit=crop",
      variants: [
        { color: "Black/White", colorHex: "#1A1A1A", stock: 35, skuSuffix: "BLW" },
      ],
    },
    {
      name: "Nike Dunk Low Panda",
      slug: "nike-dunk-low-panda",
      description: "The basketball icon returned with crisp material overlays and heritage colors. This Dunk Low channels vintage style back onto the streets, featuring a classic black and white leather design.",
      sku: "DD1503-101",
      price: new Prisma.Decimal("115.00"),
      compareAtPrice: new Prisma.Decimal("130.00"),
      costPrice: new Prisma.Decimal("40.00"),
      status: "PUBLISHED",
      gender: "WOMEN",
      categoryId: catLifestyle.id,
      brandId: brandNike.id,
      averageRating: 4.8,
      reviewCount: 245,
      image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=600&auto=format&fit=crop",
      variants: [
        { color: "Black/White", colorHex: "#111111", stock: 20, skuSuffix: "PND" },
      ],
    },
    {
      name: "Adidas Samba OG White",
      slug: "adidas-samba-og-white",
      description: "Born on the pitch, the Samba is a timeless icon of street style. This silhouette stays true to its legacy with a tasteful, low-profile leather upper, suede overlays and gum sole.",
      sku: "B75806",
      price: new Prisma.Decimal("100.00"),
      compareAtPrice: null,
      costPrice: new Prisma.Decimal("35.00"),
      status: "PUBLISHED",
      gender: "WOMEN",
      categoryId: catLifestyle.id,
      brandId: brandAdidas.id,
      averageRating: 4.7,
      reviewCount: 180,
      image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop",
      variants: [
        { color: "Cloud White/Core Black", colorHex: "#FFFFFF", stock: 25, skuSuffix: "SMB" },
      ],
    },
  ];

  for (const item of sneakerSeeds) {
    console.log(`Creating Product: ${item.name}`);
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        sku: item.sku,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        costPrice: item.costPrice,
        status: item.status as any,
        gender: item.gender as any,
        categoryId: item.categoryId,
        brandId: item.brandId,
        averageRating: item.averageRating,
        reviewCount: item.reviewCount,
        color: (item as any).color || null,
        colorHex: (item as any).colorHex || null,
        colorGroup: (item as any).colorGroup || null,
      },
    });

    console.log(`Creating Primary Image for: ${item.name}`);
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: item.image,
        altText: `${item.name} Front View`,
        sortOrder: 1,
        isPrimary: true,
        color: (item as any).color || null,
      },
    });

    console.log(`Creating Variants for: ${item.name}`);
    for (const v of item.variants) {
      for (const size of sizes) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            sizeId: size.id,
            color: v.color,
            colorHex: v.colorHex,
            sku: `${item.sku}-${size.value}-${v.skuSuffix}`,
            stock: v.stock,
            price: null, // inherits base product price
          },
        });
      }
    }
  }

  console.log("Creating Store Settings...");
  await prisma.storeSetting.createMany({
    data: [
      {
        key: "announcement_text",
        value: "Free delivery on orders over $100 | Returns within 30 days",
      },
      {
        key: "support_phone",
        value: "+91 8178050588",
      },
      {
        key: "support_email",
        value: "hipermarker@gmail.com",
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
