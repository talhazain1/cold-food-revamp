import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

/** Romero Original Ready To Cook menu — prices exclude delivery (see flyer). */
const READY_TO_COOK_CATEGORY = "Ready To Cook";

const readyToCookProducts = [
  {
    slug: "10-inch-pizza-dough-ball",
    name: `10" Pizza Dough Ball`,
    description:
      '280g. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities and sizes available on request (01254 824141; phone 5pm–10pm, WhatsApp anytime).',
    price: 1.5,
    tags: ["280g", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/pizza%20dough.jpg"],
  },
  {
    slug: "grated-mozzarella-cheese",
    name: "Grated 100% Mozzarella Cheese",
    description:
      "240g. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities available on request.",
    price: 2.0,
    tags: ["240g", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/Grated-mozzrela-cheese.jpg"],
  },
  {
    slug: "garlic-butter-ready-to-cook",
    name: "Garlic Butter",
    description:
      "250g. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities available on request.",
    price: 2.0,
    tags: ["250g", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/garlic-butter.jpg"],
  },
  {
    slug: "pizza-sauce-ready-to-cook",
    name: "Pizza Sauce",
    description:
      "250ml. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities available on request.",
    price: 2.0,
    tags: ["250ml", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/pizza-sauce.jpg"],
  },
  {
    slug: "marinated-chicken-ready-to-cook",
    name: "Marinated Chicken",
    description:
      "500g. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities available on request.",
    price: 6.0,
    tags: ["500g", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/marinated%20chicken.jpg"],
  },
  {
    slug: "marinated-shish-ready-to-cook",
    name: "Marinated Shish",
    description:
      "500g. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities available on request.",
    price: 10.0,
    tags: ["500g", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/Marinated-shish.jpg"],
  },
  {
    slug: "salted-caramel-cookie-dough",
    name: "Salted Caramel Cookie Dough",
    description:
      "120g. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities available on request.",
    price: 2.5,
    tags: ["120g", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/Salted%20Caramel%20Cookie%20Dough.jpg"],
  },
  {
    slug: "chocolate-brownie-ready-to-cook",
    name: "Chocolate Brownie",
    description:
      "120g. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities available on request.",
    price: 2.5,
    tags: ["120g", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/chocolate-brownie.jpg"],
  },
  {
    slug: "10-inch-margherita-pizza",
    name: `10" Margherita Pizza`,
    description:
      "400g. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities available on request.",
    price: 2.5,
    tags: ["400g", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/Margarita-pizza.jpg"],
  },
  {
    slug: "10-inch-garlic-bread-cheese",
    name: `10" Garlic Bread with Cheese`,
    description:
      "400g. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities available on request.",
    price: 2.5,
    tags: ["400g", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/garlic-bread.jpg"],
  },
  {
    slug: "10-inch-vegetarian-pizza",
    name: `10" Vegetarian Pizza`,
    description:
      "750g. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities available on request.",
    price: 3.0,
    tags: ["750g", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/veg-pizza.jpg"],
  },
  {
    slug: "10-inch-meat-feast-pizza",
    name: `10" Meat Feast Pizza`,
    description:
      "750g. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities available on request.",
    price: 3.5,
    tags: ["750g", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/meat-pizza.jpg"],
  },
  {
    slug: "chilli-or-garlic-sauce-bottle",
    name: "Chilli or Garlic Sauce Bottle",
    description:
      "500ml. Romero Original Ready To Cook — pre-order only: order at least 24 hours before your preferred collection or delivery time. Price excludes delivery charges. Larger quantities available on request.",
    price: 4.5,
    tags: ["500ml", "Pre-order", "Price excl. delivery"],
    stock: 999,
    images: ["/assets/chilli-garlic-sauce.jpg"],
  },
];

async function seedReadyToCookCatalogue() {
  const placeholderImage = "/placeholder.svg";
  for (const row of readyToCookProducts) {
    const images =
      Array.isArray(row.images) && row.images.length > 0 ? row.images : [placeholderImage];
    await prisma.product.upsert({
      where: { slug: row.slug },
      update: {
        name: row.name,
        description: row.description,
        price: row.price,
        category: READY_TO_COOK_CATEGORY,
        tags: row.tags,
        stock: row.stock,
        isActive: true,
        images,
      },
      create: {
        slug: row.slug,
        name: row.name,
        description: row.description,
        price: row.price,
        category: READY_TO_COOK_CATEGORY,
        tags: row.tags,
        stock: row.stock,
        isActive: true,
        images,
      },
    });
  }
}

async function main() {
  const adminPassword = await bcrypt.hash("Admin12345", 10);
  await prisma.user.upsert({
    where: { email: "admin@ready2cook.co.uk" },
    update: { role: Role.ADMIN },
    create: {
      name: "Ready2Cook Admin",
      email: "admin@ready2cook.co.uk",
      phone: "07123456789",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const sliderCount = await prisma.sliderItem.count();
  if (sliderCount === 0) {
    await prisma.sliderItem.createMany({
      data: [
        { text: "Free delivery over £40 this week", order: 1, isActive: true },
        { text: "Fresh meal kits delivered across the UK", order: 2, isActive: true },
      ],
    });
  }

  if (!(await prisma.deliverySettings.findFirst())) {
    await prisma.deliverySettings.create({
      data: { under48h: 3.5, between48and72h: 2.5 },
    });
  }

  await seedReadyToCookCatalogue();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
