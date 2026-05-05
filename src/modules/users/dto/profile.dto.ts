import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  experienceYears: z.number().min(0).optional(),
  education: z.string().min(2).optional(),
  resumeUrl: z.string().url().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
