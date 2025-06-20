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
        console.log("Recibido userId:", userId); // Añade esta línea
        if(!userThreads[userId]){
            console.log("Creando nuevo hilo para userId:", userId); // Añade esta línea
            const thread = await openai.beta.threads.create();
            userThreads[userId] = thread.id;
            console.log("Hilo creado, ID:", thread.id); // Añade esta línea
        }

        const threadId = userThreads[userId];
        console.log("Usando threadId:", threadId); // Añade esta línea

        // Añadir mensaje al hilo de mi asistente
        await openai.beta.threads.messages.create(threadId, {
            role: "user", content: message
        });

        // Ejecutar petición al asistente
        const myAssistant = await openai.beta.threads.runs.create(threadId, {
            assistant_id: "asst_rZSoq6klJ2rFoHiFoP2O2Hlo"
        });

        console.log("Ejecución creada:", myAssistant.id,
                    "Status inicial:", myAssistant.status);

                    const runId = myAssistant.id;
        const currentThreadId = threadId;

        // Esperar que la petición al asistente se complete
        let runStatus = myAssistant;
        let attemps = 0;
        const maxAttemps = 30;

        while(runStatus.status !== "completed" && attemps < maxAttemps){
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log(`Dentro del bucle - Usando threadId: ${currentThreadId}, runId: ${runId}`);

            // DEBUG: Verificar los valores exactos antes de la llamada
            console.log("DEBUG - Valores antes de retrieve:");
            console.log("currentThreadId:", currentThreadId);
            console.log("typeof currentThreadId:", typeof currentThreadId);
            console.log("runId:", runId);
            console.log("typeof runId:", typeof runId);
            
            //runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, runId);

            // Versión correcta en OpenAI v5.5.1
            runStatus = await openai.beta.threads.runs.retrieve(runId, {
                thread_id: currentThreadId
            });

            attemps ++;

            console.log(`Intento: ${attemps} - Status: ${runStatus.status}`);
        }

        console.log("Status final del run después del bucle:", runStatus.status);
        if(runStatus.status !== "completed"){
            throw new Error(`La ejecución del asistente no se ha completado. Estado final: ${runStatus.status}`)
        }

        // Sacar los mensajes
        const messages = await openai.beta.threads.messages.list(currentThreadId);

        console.log("Total de mensajes en el hilo:", messages.data.length);
        
        // Filtrar los mensajes del hilo de conversación con la IA
        const assistantMessages = messages.data.filter(msg => msg.role === "assistant")

        console.log("Mensajes del asistente encontrados:", assistantMessages.length);

        // Sacar la respuesta más reciente
        const reply = assistantMessages
                        .sort((a, b) => b.created_at - a.created_at)[0]
                        .content[0].text.value;

        console.log("Respuesta del asistente:", reply);

        return res.status(200).json({reply});

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