import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { makeSlug } from "../lib/utils";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin12345", 10);
  await prisma.user.upsert({
    where: { email: "admin@ready2cook.co.uk" },
    update: {},
    create: {
      name: "Ready2Cook Admin",
      email: "admin@ready2cook.co.uk",
      phone: "07123456789",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const products = [
    { name: "Spicy Chicken Tikka Kit", category: "Meal Kits", price: 8.99, stock: 24 },
    { name: "Classic Butter Chicken Kit", category: "Meal Kits", price: 9.5, stock: 18 },
    { name: "Lamb Karahi Kit", category: "Meal Kits", price: 10.99, stock: 14 },
    { name: "Fresh Roti Pack", category: "Bread", price: 2.99, stock: 40 },
    { name: "Masala Base Sauce", category: "Sauces", price: 3.49, stock: 55 },
    { name: "Premium Basmati Rice", category: "Pantry", price: 4.99, stock: 65 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: makeSlug(product.name) },
      update: {},
      create: {
        ...product,
        slug: makeSlug(product.name),
        description: `${product.name} prepared with premium Ready2Cook ingredients.`,
        images: ["https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"],
      },
    });
  }

  await prisma.sliderItem.createMany({
    data: [
      { text: "Free delivery over £40 this week", order: 1, isActive: true },
      { text: "Fresh meal kits delivered across the UK", order: 2, isActive: true },
    ],
    skipDuplicates: true,
  });

  if (!(await prisma.deliverySettings.findFirst())) {
    await prisma.deliverySettings.create({
      data: { under48h: 3.5, between48and72h: 2.5 },
    });
  }
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
