import { useState } from "react"; 
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./Chatbox.css";

// Inicializa la API de Google Gemini
const genAI = new GoogleGenerativeAI("AIzaSyCaK7n4c74Qns7ZC-qrgaSU4uEXHjzvZhE");

const Chatbox = () => {
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false); // Estado para el efecto de "escribiendo..."

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");
        setIsTyping(true); // Mostrar efecto de "escribiendo..."

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Responde solo sobre gatos, razas, comportamiento, cuidados y curiosidades felinas. Pregunta: ${input}`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            setTimeout(() => {
                setMessages([...newMessages, { sender: "bot", text }]);
                setIsTyping(false); // Ocultar efecto de "escribiendo..."
            }, 1500);
        } catch (error) {
            console.error("Error en Gemini", error);
            setMessages([...newMessages, { sender: "bot", text: "Lo siento, solo puedo responder sobre gatos." }]);
            setIsTyping(false);
        }
    };

    return (
        <div className="chatbox">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === "user" ? "user-message" : "bot-message"}>
                        {msg.text}
                    </div>
                ))}
                {isTyping && <div className="typing-indicator">El bot está escribiendo...</div>}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pregúntame sobre gatos..."
                />
                <button onClick={sendMessage}>Enviar</button>
            </div>
        </div>
    );
};

export default Chatbox;
