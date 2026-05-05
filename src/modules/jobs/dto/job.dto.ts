import { z } from 'zod';

export const jobSkillSchema = z.object({
  name: z.string().min(1),
  weight: z.number().min(1).max(5).default(3),
});

export const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  skills: z.array(jobSkillSchema).min(1),
});

export type CreateJobDto = z.infer<typeof createJobSchema>;
export type JobSkillDto = z.infer<typeof jobSkillSchema>;
