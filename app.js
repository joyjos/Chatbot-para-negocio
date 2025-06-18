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
const context = `
        Eres un asistente de soporte para el Supermercado "El Córner".
        Información del negocio:
            Ubicación: Calle Asturias, 23, Gijón
            Horario: Lunes a Sábado de 8:00 a 15:00. Domingos de 10:00 a 13:00
            Productos: Pan, leche, huevos, pescado, verduras, frutas y bebidas (solo y exclusivamente tenemos estos productos)
            Marcas: Pascual, Kaiku, Central Lechera Asturiana, Fanta, Coca-Cola, Pepsi
            Métodos de pago: Efectivo, Tarjeta y Bizum
        Solo puedes responder preguntas sobre el Supermercado. Cualquier otra pregunta está prohibida.
    `;

let conversations = {};

app.post("/api/chatbot", async(req, res) => {

    // Recibir pregunta del usuario
    const { userId, message } = req.body

    if(!message) return res.status(404).json({error: "Has mandado un mensaje vacío!!"});

    if(!conversations[userId]){
        conversations[userId] = [];
    }

    conversations[userId].push({role: "user", content: message});

    // Petición al modelo de IA
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "system", content: context},
                {role: "system", content: "Debes responder de la forma más corta y directa posible, usando los mínimos tokens posibles"},
                ...conversations[userId]
            ],
            max_tokens: 200,
            response_format: {type: "text"}
        });

        // Devolver respuesta
        const reply = response.choices[0].message.content;

        // Añadir al asistente la respuesta
        conversations[userId].push({role: "assistant", content: reply});

        // Limitar número de mensajes
        if(conversations[userId].length > 12){
            conversations[userId] = conversations[userId].slice(-10);
        }

        console.log(conversations);

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