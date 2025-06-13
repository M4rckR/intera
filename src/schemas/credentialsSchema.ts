import { z } from "zod";

export const credentialsSchema = z.object({
    username: z.string().min(1, { message: "El nombre de usuario es requerido" }),
    password: z.string().min(4, { message: "La contraseña es requerida" }),
});

export const userSchema = z.object({
    id: z.number(),
    username: z.string(),
    phones: z.array(z.object({
        id: z.number(),
        number: z.string(),
        botState: z.object({
            id: z.number(),
            is_bot_active: z.boolean()
        }).nullable()
    }))
});

