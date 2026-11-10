import { z } from 'zod';
export const contactSchema = z.object({ name: z.string().trim().min(1).max(120), company: z.string().trim().max(160), phone: z.string().trim().max(40), email: z.union([z.literal(''), z.string().email().max(254)]), value: z.coerce.number().min(0).max(999999999) });
export const companySchema = z.string().trim().min(1).max(120);
export const inviteSchema = z.string().trim().email().max(254).transform(v => v.toLowerCase());
