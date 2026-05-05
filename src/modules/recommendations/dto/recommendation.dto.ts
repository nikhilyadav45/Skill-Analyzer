import { z } from 'zod';

export const recommendationSchema = z.object({
  missingSkills: z.array(z.string()).min(1),
});

export type RecommendationDto = z.infer<typeof recommendationSchema>;
