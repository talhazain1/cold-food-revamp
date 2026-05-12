import { z } from "zod";

export const createBundleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(8000).optional().default(""),
  price: z.number().positive().max(999_999),
  terms: z.string().max(16000).optional().default(""),
  productIds: z.array(z.string().min(1)).min(1),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const updateBundleSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(8000).optional(),
    price: z.number().positive().max(999_999).optional(),
    terms: z.string().max(16000).optional(),
    productIds: z.array(z.string().min(1)).min(1).optional(),
    isActive: z.boolean().optional(),
    expiresAt: z.string().datetime().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No fields to update" });
