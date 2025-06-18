// Importar dependencias
import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

// Cargar configuración API Key
dotenv.config();

// Cargar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Servir FrontEnd
app.use("/", express.static("public"));

// Middleware para procesar JSON (convierto JSON a un Objeto de JavaScript)
app.use(express.json());

// Instancia de OpenAI y pasarle el API Key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

console.log("API KEY:", process.env.OPENAI_API_KEY);

// Ruta/endpoint/url

let userThreads = {};

app.post("/api/chatbot", async(req, res) => {

    // Recibir pregunta del usuario
    const { userId, message } = req.body

    if(!message) return res.status(404).json({error: "Has mandado un mensaje vacío!!"});

    // Petición al modelo de IA
    try {

        if(!userThreads[userId]){
            const thread = await openai.beta.threads.createAndRun();
            userThreads[userId] = thread.id;
        }

        const threadId = userThreads[userId];

        // Añadir mensaje al hilo de mi asistente
        await openai.beta.threads.messages.createAndRun(threadId, {
            role: "user", content: message
        });

        // Ejecutar petición al asistente
        const myAssistant = await openai.beta.threads.runs.create(threadId, {
            assistant_id: "asst_rZSoq6klJ2rFoHiFoP2O2Hlo"
        });

        console.log("Ejecución creada:", myAssistant.id,
                    "Status inicial:", myAssistant.status);

        // Esperar que la petición al asistente se complete
        let runStatus = myAssistant;
        let attemps = 0;
        const maxAttemps = 30;

        while(runStatus.status !== completed && attemps > maxAttemps){
            await new Promise(resolve => setTimeout(resolve, 1000));

            runStatus = await openai.beta.threads.runs.retrieve(threadId, myAssistant.id);

            attemps ++;

            console.log(`Intento: ${attemps} - Status: ${runStatus.status}`);
        }

        if(runStatus.status !== "completed"){
            throw new Error(`La ejecución del asistente no se ha completado. Estado final: ${runStatus.status}`)
        }

        // Sacar los mensajes
        const messages = await openai.beta.threads.messages.list(threadId);

        console.log("Total de mensajes en el hilo:", messages.data.length);
        
        // Filtrar los mensajes del hilo de conversación con la IA
        const assistantMessages = messages.data.filter(msg => msg.role === "assistant")

        console.log("Mensajes del asistente encontrados:", assistantMessages.length);

        // Sacar la respuesta más reciente

    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({error: "Error al generar la respuesta"});
    }

    

    //return res.json({message: "Hola, qué tal"})
});

// Servir el BackEnd
app.listen(PORT, () =>  {
    console.log("Servidor corriendo correctamente en http://localhost:" + PORT);
});