import { checkConnectionSchema } from "@/schemas/checkConnection";
import axios from "axios";

const urlCheckConnection = "https://chatbot-api-3o54.onrender.com/api/whatsapp/status";

export const fetchConnection = async () => {
    try {
        if (!urlCheckConnection) {
            throw new Error("API_URL no está definida en las variables de entorno");
        }

        const {data} = await axios.get(urlCheckConnection);

        const dataResponse = checkConnectionSchema.safeParse(data);
            
        if(!dataResponse.success) {
            throw new Error(`Error al validar el schema: ${JSON.stringify(dataResponse.error)}`);
        }

        return dataResponse.data;

    } catch(error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Error de API: ${error.message}`);
        }
        throw error;
    }
};
