// ═══════════════════════════════════════════════════════════════
// MTAJER ZONE — Database Seed
// Run: npm run db:seed
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...\n");

  // ── 1. Platform Settings ────────────────────────────────────
  console.log("⚙️  Creating platform settings...");
  const existingSettings = await prisma.platformSettings.findFirst();
  if (!existingSettings) await prisma.platformSettings.create({
    data: {
      siteName: "متاجر زون",
      siteNameEn: "Mtajer Zone",
      siteDescription: "منصة متكاملة لإنشاء وإدارة المتاجر الرقمية",
      supportEmail: "support@mtajerzone.com",
      supportWhatsapp: "201234567890",
      requireEmailVerification: false,
      autoApproveStores: false,
    },
  });

  // ── 2. Store Categories ─────────────────────────────────────
  console.log("🏷️  Creating store categories...");
  const categories = await Promise.all([
    prisma.storeCategory.upsert({
      where: { slug: "fashion" },
      update: {},
      create: { name: "Fashion & Accessories", nameAr: "أزياء وإكسسوارات", emoji: "👗", slug: "fashion", sortOrder: 1 },
    }),
    prisma.storeCategory.upsert({
      where: { slug: "beauty" },
      update: {},
      create: { name: "Beauty & Care", nameAr: "جمال وعناية", emoji: "💄", slug: "beauty", sortOrder: 2 },
    }),
    prisma.storeCategory.upsert({
      where: { slug: "electronics" },
      update: {},
      create: { name: "Electronics", nameAr: "إلكترونيات", emoji: "📱", slug: "electronics", sortOrder: 3 },
    }),
    prisma.storeCategory.upsert({
      where: { slug: "home" },
      update: {},
      create: { name: "Home & Tools", nameAr: "أدوات منزلية", emoji: "🛠️", slug: "home", sortOrder: 4 },
    }),
    prisma.storeCategory.upsert({
      where: { slug: "cars" },
      update: {},
      create: { name: "Cars & Auto", nameAr: "سيارات", emoji: "🚗", slug: "cars", sortOrder: 5 },
    }),
    prisma.storeCategory.upsert({
      where: { slug: "gifts" },
      update: {},
      create: { name: "Gifts", nameAr: "هدايا", emoji: "🎁", slug: "gifts", sortOrder: 6 },
    }),
    prisma.storeCategory.upsert({
      where: { slug: "food" },
      update: {},
      create: { name: "Food & Beverages", nameAr: "طعام ومشروبات", emoji: "🍽️", slug: "food", sortOrder: 7 },
    }),
    prisma.storeCategory.upsert({
      where: { slug: "books" },
      update: {},
      create: { name: "Books & Education", nameAr: "كتب وتعليم", emoji: "📚", slug: "books", sortOrder: 8 },
    }),
    prisma.storeCategory.upsert({
      where: { slug: "sports" },
      update: {},
      create: { name: "Sports & Fitness", nameAr: "رياضة ولياقة", emoji: "⚽", slug: "sports", sortOrder: 9 },
    }),
  ]);
  console.log(`   ✓ ${categories.length} categories created`);

  // ── 3. Admin User ────────────────────────────────────────────
  console.log("👤 Creating admin user...");
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mtajerzone.com" },
    update: {},
    create: {
      email: "admin@mtajerzone.com",
      name: "مدير النظام",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      phone: "201000000000",
    },
  });
  console.log(`   ✓ Admin: ${admin.email} / Admin@123456`);

  // ── 4. Store Owner Users ─────────────────────────────────────
  console.log("🏪 Creating store owners...");
  const ownerPassword = await bcrypt.hash("Owner@123456", 12);

  const owner1 = await prisma.user.upsert({
    where: { email: "techworld@demo.com" },
    update: {},
    create: {
      email: "techworld@demo.com",
      name: "أحمد محمد",
      password: ownerPassword,
      role: "STORE_OWNER",
      isOwner: true,
      emailVerified: new Date(),
      phone: "201234567890",
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: "glowbeauty@demo.com" },
    update: {},
    create: {
      email: "glowbeauty@demo.com",
      name: "منى حسين",
      password: ownerPassword,
      role: "STORE_OWNER",
      isOwner: true,
      emailVerified: new Date(),
      phone: "201234567891",
    },
  });

  const owner3 = await prisma.user.upsert({
    where: { email: "fashionstyle@demo.com" },
    update: {},
    create: {
      email: "fashionstyle@demo.com",
      name: "سارة عبدالله",
      password: ownerPassword,
      role: "STORE_OWNER",
      isOwner: true,
      emailVerified: new Date(),
      phone: "201234567892",
    },
  });
  console.log("   ✓ 3 store owners created (password: Owner@123456)");

  // ── 5. Customer User ─────────────────────────────────────────
  console.log("👥 Creating customer user...");
  const customerPassword = await bcrypt.hash("Customer@123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@demo.com" },
    update: {},
    create: {
      email: "customer@demo.com",
      name: "عمر خالد",
      password: customerPassword,
      role: "CUSTOMER",
      emailVerified: new Date(),
      phone: "201234567893",
    },
  });
  console.log(`   ✓ Customer: ${customer.email} / Customer@123`);

  // ── 6. Stores ────────────────────────────────────────────────
  console.log("🏬 Creating demo stores...");

  const businessHoursDefault = {
    saturday:  { isOpen: true,  openTime: "09:00", closeTime: "22:00" },
    sunday:    { isOpen: true,  openTime: "09:00", closeTime: "22:00" },
    monday:    { isOpen: true,  openTime: "09:00", closeTime: "22:00" },
    tuesday:   { isOpen: true,  openTime: "09:00", closeTime: "22:00" },
    wednesday: { isOpen: true,  openTime: "09:00", closeTime: "22:00" },
    thursday:  { isOpen: true,  openTime: "09:00", closeTime: "22:00" },
    friday:    { isOpen: false, openTime: "14:00", closeTime: "22:00" },
  };

  const electronicsCategory = categories.find((c) => c.slug === "electronics")!;
  const beautyCategory = categories.find((c) => c.slug === "beauty")!;
  const fashionCategory = categories.find((c) => c.slug === "fashion")!;

  const store1 = await prisma.store.upsert({
    where: { slug: "tech-world" },
    update: {},
    create: {
      name: "Tech World",
      slug: "tech-world",
      description: "متجر متخصص في الإلكترونيات والأجهزة الذكية بأفضل الأسعار وضمان على جميع المنتجات. نوفر أحدث الهواتف الذكية واللابتوبات والساعات الذكية.",
      primaryColor: "#4F6BFF",
      status: "ACTIVE",
      isVerified: true,
      isFeatured: true,
      whatsappNumber: "201234567890",  // E.164 digits, no +,
      countryCode: "20",
      country: "مصر",
      city: "القاهرة",
      address: "شارع التحرير، وسط البلد",
      orderButtonText: "اطلب عبر واتساب",
      welcomeMessage: "أهلاً وسهلاً بكم في Tech World! 👋 يسعدنا خدمتكم.",
      businessHours: businessHoursDefault,
      instagramUrl: "https://instagram.com/techworld",
      seoTitle: "Tech World — أفضل متجر إلكترونيات في مصر",
      seoDescription: "اشتر أحدث الإلكترونيات والأجهزة الذكية بأفضل الأسعار. هواتف، لابتوب، ساعات ذكية وأكثر.",
      totalVisits: 4821,
      totalOrders: 143,
      ownerId: owner1.id,
      categoryId: electronicsCategory.id,
    },
  });

  const store2 = await prisma.store.upsert({
    where: { slug: "glow-beauty" },
    update: {},
    create: {
      name: "Glow Beauty",
      slug: "glow-beauty",
      description: "متجر متخصص في منتجات الجمال والعناية بالبشرة. نوفر أفضل ماركات العطور والمكياج ومنتجات العناية بأسعار تنافسية.",
      primaryColor: "#EC4899",
      status: "ACTIVE",
      isVerified: true,
      isFeatured: true,
      whatsappNumber: "201234567891",
      countryCode: "20",
      country: "مصر",
      city: "القاهرة",
      address: "مدينة نصر",
      orderButtonText: "اطلبي عبر واتساب",
      welcomeMessage: "مرحباً! ✨ نورتِ Glow Beauty. كيف يمكننا مساعدتك؟",
      businessHours: businessHoursDefault,
      instagramUrl: "https://instagram.com/glowbeauty",
      seoTitle: "Glow Beauty — متجر الجمال والعناية",
      seoDescription: "أفضل منتجات الجمال والعناية بالبشرة. عطور، مكياج، كريمات بأسعار مميزة.",
      totalVisits: 3200,
      totalOrders: 188,
      ownerId: owner2.id,
      categoryId: beautyCategory.id,
    },
  });

  const store3 = await prisma.store.upsert({
    where: { slug: "fashion-style" },
    update: {},
    create: {
      name: "Fashion Style",
      slug: "fashion-style",
      description: "موضة عصرية وإكسسوارات راقية لكل المناسبات. أحدث صيحات الموضة العالمية بأسعار مناسبة.",
      primaryColor: "#8B5CF6",
      status: "ACTIVE",
      isVerified: true,
      isFeatured: false,
      whatsappNumber: "201234567892",
      countryCode: "20",
      country: "مصر",
      city: "الإسكندرية",
      orderButtonText: "اطلب عبر واتساب",
      welcomeMessage: "أهلاً بكم في Fashion Style! 👗 نسعد بخدمتكم.",
      businessHours: businessHoursDefault,
      instagramUrl: "https://instagram.com/fashionstyle",
      seoTitle: "Fashion Style — أزياء وإكسسوارات عصرية",
      seoDescription: "أحدث الأزياء والإكسسوارات لكل المناسبات. موضة عالمية بأسعار محلية.",
      totalVisits: 2800,
      totalOrders: 220,
      ownerId: owner3.id,
      categoryId: fashionCategory.id,
    },
  });

  console.log("   ✓ 3 stores created");

  // ── 7. Subscriptions ─────────────────────────────────────────
  console.log("💎 Creating subscriptions...");
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  await prisma.storeSubscription.upsert({
    where: { storeId: store1.id },
    update: {},
    create: {
      plan: "PROFESSIONAL",
      status: "ACTIVE",
      startDate: new Date(),
      endDate,
      autoRenew: true,
      priceInCents: 59900,
      storeId: store1.id,
    },
  });

  await prisma.storeSubscription.upsert({
    where: { storeId: store2.id },
    update: {},
    create: {
      plan: "ENTERPRISE",
      status: "ACTIVE",
      startDate: new Date(),
      endDate,
      autoRenew: true,
      priceInCents: 149900,
      storeId: store2.id,
    },
  });

  await prisma.storeSubscription.upsert({
    where: { storeId: store3.id },
    update: {},
    create: {
      plan: "STARTER",
      status: "ACTIVE",
      startDate: new Date(),
      endDate,
      autoRenew: true,
      priceInCents: 19900,
      storeId: store3.id,
    },
  });
  console.log("   ✓ Subscriptions created");

  // ── 8. Product Categories (per store) ────────────────────────
  console.log("📂 Creating product categories...");
  const techCat1 = await prisma.productCategory.create({
    data: { name: "Smartphones", nameAr: "هواتف", emoji: "📱", storeId: store1.id, sortOrder: 1 },
  });
  const techCat2 = await prisma.productCategory.create({
    data: { name: "Laptops", nameAr: "لابتوب", emoji: "💻", storeId: store1.id, sortOrder: 2 },
  });
  const techCat3 = await prisma.productCategory.create({
    data: { name: "Headphones", nameAr: "سماعات", emoji: "🎧", storeId: store1.id, sortOrder: 3 },
  });
  const techCat4 = await prisma.productCategory.create({
    data: { name: "Smart Watches", nameAr: "ساعات ذكية", emoji: "⌚", storeId: store1.id, sortOrder: 4 },
  });

  const beautyCat1 = await prisma.productCategory.create({
    data: { name: "Perfumes", nameAr: "عطور", emoji: "🌸", storeId: store2.id, sortOrder: 1 },
  });
  const beautyCat2 = await prisma.productCategory.create({
    data: { name: "Makeup", nameAr: "مكياج", emoji: "💋", storeId: store2.id, sortOrder: 2 },
  });

  const fashionCat1 = await prisma.productCategory.create({
    data: { name: "Bags", nameAr: "شنط", emoji: "👜", storeId: store3.id, sortOrder: 1 },
  });
  const fashionCat2 = await prisma.productCategory.create({
    data: { name: "Accessories", nameAr: "إكسسوارات", emoji: "💍", storeId: store3.id, sortOrder: 2 },
  });

  console.log("   ✓ Product categories created");

  // ── 9. Products ──────────────────────────────────────────────
  console.log("📦 Creating products...");

  // Tech World products
  const product1 = await prisma.product.create({
    data: {
      name: "ساعة ذكية سامسونج Galaxy Watch 6 Classic",
      description: "ساعة سامسونج Galaxy Watch 6 Classic الذكية تجمع بين الأناقة الكلاسيكية والتقنية الحديثة. شاشة AMOLED مشرقة، مقاومة للماء، مجموعة شاملة من ميزات تتبع الصحة واللياقة.",
      priceInCents: 119900,
      comparePriceInCents: 149900,
      sku: "TW-SW-001",
      stock: 15,
      trackStock: true,
      status: "ACTIVE",
      isFeatured: true,
      tags: ["ساعة ذكية", "سامسونج", "إلكترونيات"],
      variants: [
        { name: "اللون", options: ["أسود", "فضي", "ذهبي", "بني"] },
        { name: "المقاس", options: ["43mm", "47mm"] },
      ],
      totalOrders: 42,
      storeId: store1.id,
      categoryId: techCat4.id,
      seoTitle: "ساعة سامسونج Galaxy Watch 6 Classic — Tech World",
      seoDescription: "اشتر ساعة Samsung Galaxy Watch 6 Classic بأفضل سعر. ضمان سنة كاملة.",
      images: {
        create: [
          { url: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg", alt: "ساعة Galaxy Watch 6", order: 0 },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "سماعات Sony WH-1000XM5 بلوتوث",
      description: "سماعات Sony WH-1000XM5 مع تقنية إلغاء الضوضاء الرائدة في الصناعة. صوت استثنائي وراحة طوال اليوم.",
      priceInCents: 249900,
      comparePriceInCents: null,
      sku: "TW-HP-001",
      stock: 8,
      trackStock: true,
      status: "ACTIVE",
      isFeatured: true,
      tags: ["سماعات", "سوني", "بلوتوث"],
      variants: [
        { name: "اللون", options: ["أسود", "فضي"] },
      ],
      totalOrders: 28,
      storeId: store1.id,
      categoryId: techCat3.id,
      images: {
        create: [
          { url: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg", alt: "سماعات Sony XM5", order: 0 },
        ],
      },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: "iPhone 15 Pro Max 256GB",
      description: "أحدث هاتف من Apple مع معالج A17 Pro وكاميرا 48MP ونظام التيتانيوم المتطور.",
      priceInCents: 3499900,
      comparePriceInCents: null,
      sku: "TW-PH-001",
      stock: 5,
      trackStock: true,
      status: "ACTIVE",
      isFeatured: true,
      tags: ["آيفون", "أبل", "هاتف"],
      variants: [
        { name: "اللون", options: ["تيتانيوم طبيعي", "تيتانيوم أبيض", "تيتانيوم أسود", "تيتانيوم أزرق"] },
        { name: "التخزين", options: ["256GB", "512GB", "1TB"] },
      ],
      totalOrders: 67,
      storeId: store1.id,
      categoryId: techCat1.id,
      images: {
        create: [
          { url: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg", alt: "iPhone 15 Pro Max", order: 0 },
        ],
      },
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: "لابتوب Lenovo IdeaPad 5 Pro",
      description: "لابتوب قوي للعمل والترفيه مع معالج Intel Core i7 وشاشة OLED 14 بوصة.",
      priceInCents: 1299900,
      comparePriceInCents: 1529900,
      sku: "TW-LP-001",
      stock: 3,
      trackStock: true,
      status: "ACTIVE",
      isFeatured: false,
      tags: ["لابتوب", "لينوفو", "كمبيوتر"],
      variants: [
        { name: "الذاكرة العشوائية", options: ["8GB", "16GB"] },
        { name: "التخزين", options: ["512GB SSD", "1TB SSD"] },
      ],
      totalOrders: 15,
      storeId: store1.id,
      categoryId: techCat2.id,
      images: {
        create: [
          { url: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg", alt: "Lenovo IdeaPad", order: 0 },
        ],
      },
    },
  });

  // Glow Beauty products
  const product5 = await prisma.product.create({
    data: {
      name: "عطر Rose Gold الفاخر",
      description: "عطر فاخر بتركيبة فريدة تجمع بين الورد والعنبر والمسك. يدوم طويلاً ويترك أثراً لا يُنسى.",
      priceInCents: 85000,
      comparePriceInCents: 100000,
      sku: "GB-PF-001",
      stock: 20,
      trackStock: true,
      status: "ACTIVE",
      isFeatured: true,
      tags: ["عطر", "للجنسين", "فاخر"],
      variants: [
        { name: "الحجم", options: ["50ml", "100ml"] },
      ],
      totalOrders: 55,
      storeId: store2.id,
      categoryId: beautyCat1.id,
      images: {
        create: [
          { url: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg", alt: "عطر Rose Gold", order: 0 },
        ],
      },
    },
  });

  const product6 = await prisma.product.create({
    data: {
      name: "كريم مرطب فائق الجودة",
      description: "كريم ترطيب عميق للبشرة الجافة والحساسة. تركيبة طبيعية بزيت الأرجان وفيتامين E.",
      priceInCents: 29900,
      comparePriceInCents: 39900,
      sku: "GB-SK-001",
      stock: 30,
      trackStock: true,
      status: "ACTIVE",
      isFeatured: false,
      tags: ["كريم", "ترطيب", "بشرة"],
      variants: [],
      totalOrders: 32,
      storeId: store2.id,
      categoryId: beautyCat2.id,
      images: {
        create: [
          { url: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg", alt: "كريم مرطب", order: 0 },
        ],
      },
    },
  });

  // Fashion Style products
  const product7 = await prisma.product.create({
    data: {
      name: "شنطة كلاسيكية جلد طبيعي",
      description: "شنطة أنيقة من الجلد الطبيعي الأصلي. مثالية للإطلالات العصرية والرسمية. متوفرة بعدة ألوان.",
      priceInCents: 59900,
      comparePriceInCents: 79900,
      sku: "FS-BG-001",
      stock: 12,
      trackStock: true,
      status: "ACTIVE",
      isFeatured: true,
      tags: ["شنطة", "جلد", "كلاسيك"],
      variants: [
        { name: "اللون", options: ["بني", "أسود", "بيج", "أحمر"] },
        { name: "الحجم", options: ["صغير", "متوسط", "كبير"] },
      ],
      totalOrders: 40,
      storeId: store3.id,
      categoryId: fashionCat1.id,
      images: {
        create: [
          { url: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg", alt: "شنطة كلاسيكية", order: 0 },
        ],
      },
    },
  });

  const product8 = await prisma.product.create({
    data: {
      name: "طقم إكسسوارات ذهبية فاخرة",
      description: "طقم كامل من الإكسسوارات الذهبية يشمل عقد وأساور وحلق. مصنوع من الذهب المطلي 18 قيراط.",
      priceInCents: 45000,
      comparePriceInCents: null,
      sku: "FS-AC-001",
      stock: 8,
      trackStock: true,
      status: "ACTIVE",
      isFeatured: false,
      tags: ["إكسسوارات", "ذهب", "طقم"],
      variants: [],
      totalOrders: 18,
      storeId: store3.id,
      categoryId: fashionCat2.id,
      images: {
        create: [
          { url: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg", alt: "إكسسوارات ذهبية", order: 0 },
        ],
      },
    },
  });

  // Update store product counts
  await prisma.store.update({ where: { id: store1.id }, data: { totalProducts: 4 } });
  await prisma.store.update({ where: { id: store2.id }, data: { totalProducts: 2 } });
  await prisma.store.update({ where: { id: store3.id }, data: { totalProducts: 2 } });

  console.log(`   ✓ ${8} products created`);

  // ── 10. Reviews ──────────────────────────────────────────────
  console.log("⭐ Creating reviews...");
  await prisma.review.createMany({
    data: [
      {
        reviewType: "STORE",
      rating: 5,
        comment: "منتج ممتاز وأسعار معقولة. التوصيل كان سريع والتغليف محترم.",
        isApproved: true,
        userId: customer.id,
        storeId: store1.id,
      },
      {
        reviewType: "PRODUCT",
      rating: 5,
        comment: "تجربة تسوق رائعة! التواصل عبر واتساب سهل جداً.",
        isApproved: true,
        userId: customer.id,
        productId: product1.id,
      },
      {
        reviewType: "STORE",
      rating: 5,
        comment: "العطر جميل جداً والتغليف احترافي. سأتسوق منهم مرة أخرى.",
        isApproved: true,
        userId: customer.id,
        storeId: store2.id,
      },
      {
        reviewType: "STORE",
      rating: 4,
        comment: "الشنطة جميلة ومطابقة للوصف. الجودة ممتازة.",
        isApproved: true,
        userId: customer.id,
        storeId: store3.id,
      },
    ],
  });
  console.log("   ✓ Reviews created");

  // ── 11. Sample Order ─────────────────────────────────────────
  console.log("🛒 Creating sample order...");
  const whatsappMsg = `السلام عليكم\nأرغب في طلب المنتجات التالية:\n\n1. ساعة ذكية سامسونج Galaxy Watch 6\n   الكمية: 1\n   اللون: أسود\n\nإجمالي الطلب: 1,199 ج.م\nاسم المتجر: Tech World\n\nشكراً`;

  await prisma.order.create({
    data: {
      orderNumber: "ORD-00001",
      status: "NEW",
      whatsappMessage: whatsappMsg,
      totalAmountInCents: 119900,
      itemCount: 1,
      customerId: customer.id,
      storeId: store1.id,
      items: {
        create: [
          {
            productId: product1.id,
            productName: "ساعة ذكية سامسونج Galaxy Watch 6 Classic",
            productImage: null,
            quantity: 1,
            priceInCents: 119900,
            selectedVariants: { اللون: "أسود", المقاس: "43mm" },
          },
        ],
      },
    },
  });
  console.log("   ✓ Sample order created");

  // ── 12. Store Follower ───────────────────────────────────────
  console.log("👥 Creating store follower...");
  await prisma.storeFollower.create({
    data: { userId: customer.id, storeId: store1.id },
  });
  console.log("   ✓ Store follower created");

  // ── 13. Notification ─────────────────────────────────────────
  console.log("🔔 Creating sample notifications...");
  await prisma.notification.createMany({
    data: [
      {
        title: "طلب جديد",
        message: "تلقيت طلباً جديداً من عمر خالد",
        type: "ORDER",
        userId: owner1.id,
        link: "/dashboard/store/orders",
      },
      {
        title: "تم تفعيل متجرك",
        message: "تم مراجعة متجرك Tech World وتفعيله بنجاح",
        type: "STORE",
        userId: owner1.id,
        isRead: true,
      },
      {
        title: "تم تأكيد طلبك",
        message: "متجر Tech World أكد طلبك رقم ORD-00001",
        type: "ORDER",
        userId: customer.id,
        link: "/dashboard/customer",
      },
    ],
  });
  console.log("   ✓ Notifications created");

  // ── 14. Coupon ───────────────────────────────────────────────
  console.log("🎟️  Creating sample coupon...");
  await prisma.coupon.create({
  data: {
    code: "WELCOME10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderValueInCents: 20000,
    maxUses: 100,
    isActive: true,
    storeId: store1.id,
  },
});
  console.log("   ✓ Coupon WELCOME10 created");

  // ── Summary ──────────────────────────────────────────────────
  console.log("\n✅ Seed completed successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 Login Credentials:");
  console.log("   Admin:    admin@mtajerzone.com   / Admin@123456");
  console.log("   Owner 1:  techworld@demo.com     / Owner@123456");
  console.log("   Owner 2:  glowbeauty@demo.com    / Owner@123456");
  console.log("   Owner 3:  fashionstyle@demo.com  / Owner@123456");
  console.log("   Customer: customer@demo.com      / Customer@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
