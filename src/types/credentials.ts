import { z } from "zod";
import { credentialsSchema, userSchema } from "@/schemas/credentialsSchema";

export type Credentials = z.infer<typeof credentialsSchema>;
export type User = z.infer<typeof userSchema>;