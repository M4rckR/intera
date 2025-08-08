import { z } from "zod";

export const checkConnectionSchema = z.object({
    isReady: z.boolean(),
    qrCodeUrl: z.string().nullable(),
    error: z.string().optional(),
    message: z.string().optional()
});

