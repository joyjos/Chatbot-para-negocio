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
app.post("/api/chatbot", async(req, res) => {

    const contexto = `
        Eres un asistente de soporte para el Supermercado "El Córner".
        Información del negocio:
            Ubicación: Calle Asturias, 23, Gijón
            Horario: Lunes a Sábado de 8:00 a 15:00. Domingos de 10:00 a 13:00
            Productos: Pan, leche, huevos, pescado, verduras, frutas y bebidas
            Marcas: Pascual, Kaiku, Central Lechera Asturiana, Fanta, Coca-Cola, Pepsi
            Métodos de pago: Efectivo, Tarjeta y Bizum
        Solo puedes responder preguntas sobre el Supermercado. Cualquier otra pregunta está prohibida.
    `;

    // Recibir pregunta del usuario


    // Petición al modelo de IA


    // Devolver respuesta

    //return res.json({message: "Hola, qué tal"})
});

// Servir el BackEnd
app.listen(PORT, () =>  {
    console.log("Servidor corriendo correctamente en http://localhost:" + PORT);
});