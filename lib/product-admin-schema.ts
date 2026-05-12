import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(8000),
  price: z.number().positive().max(999_999),
  category: z.string().min(1).max(100),
  stock: z.number().int().min(0).max(999_999),
  isActive: z.boolean().optional(),
  slug: z.string().min(1).max(200).optional(),
  images: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string().min(1).max(80)).max(50).optional(),
});

export const updateProductSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(8000).optional(),
    price: z.number().positive().max(999_999).optional(),
    category: z.string().min(1).max(100).optional(),
    stock: z.number().int().min(0).max(999_999).optional(),
    isActive: z.boolean().optional(),
    slug: z.string().min(1).max(200).optional(),
    images: z.array(z.string().min(1)).optional(),
    tags: z.array(z.string().min(1).max(80)).max(50).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No fields to update" });
