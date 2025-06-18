const sendButton = document.querySelector("#sendButton");

const inputText = document.querySelector("#inputText");
const messagesContainer = document.querySelector(".chat__messages");

const userId = Date.now() + Math.floor(777 + Math.random() * 7000);

const sendMessage = async() =>  {

    // Obtener el valor del input
    const myMessage = inputText.value.trim();

    if(!myMessage) return false;

    // Meter el mensaje del usuario en la caja de mensajes
    messagesContainer.innerHTML += `<div class="chat__message chat__message--user">Yo: ${myMessage}</div>`;

    // Vaciar el input del usuario
    inputText.value = " ";

    // Petición al BackEnd para que me responda la IA
    try {

        const response = await fetch("/api/chatbot", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                userId,
                message: myMessage})
        }) 
        // Incrustar mensaje del bot en el chat
        const data = await response.json();

        messagesContainer.innerHTML += `<div class="chat__message chat__message--bot">Carmen: ${data.reply}</div>`;
        
    } catch (error) {
        console.log("error:", error)
    }

    // Mover el scroll hacia abajo
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

sendButton.addEventListener("click", sendMessage);
inputText.addEventListener("keypress", (event) => {
    if(event.key === "Enter"){
        event.preventDefault();
        sendMessage();
    }
});