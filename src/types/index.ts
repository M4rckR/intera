import { checkConnectionSchema } from "@/schemas/checkConnection";
import { z } from "zod";

export type DataConnection = z.infer<typeof checkConnectionSchema>;