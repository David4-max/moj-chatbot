import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';

// Tento komponent slúži ako opravená verzia chatbota pre OpenAI.
// Obsahuje robustné spracovanie chýb a správne posielanie správ do API.
const App = () => {
    // Stav pre uchovanie histórie správ. Každá správa je objekt { sender: 'user' | 'bot', text: '...' }.
    const [messages, setMessages] = useState([]);
    // Stav pre uchovanie textu, ktorý píše používateľ.
    const [input, setInput] = useState('');
    // Stav pre zobrazenie indikátora načítavania, keď bot odpovedá.
    const [isLoading, setIsLoading] = useState(false);
    // Referencia na poslednú správu, aby sme mohli automaticky posúvať zobrazenie.
    const messagesEndRef = useRef(null);

    // Kontrola, či ide o mobilné zariadenie (nie je priamo nutné, ale je to dobrá prax pre adaptívny dizajn).
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

    // Funkcia na posúvanie sa na spodok chatu, aby bola viditeľná najnovšia správa.
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Používame useEffect na automatické posúvanie pri každej zmene v správach.
    useEffect(scrollToBottom, [messages]);

    // Funkcia na odosielanie správy používateľa a získanie odpovede od bota.
    const handleSendMessage = async (e) => {
        e.preventDefault();
        // Zabezpečenie, že prázdna správa sa neodošle.
        if (input.trim() === '') return;

        // Vytvorenie novej správy pre používateľa a jej pridanie do histórie.
        const newUserMessage = { sender: 'user', text: input };
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        
        // Vyčistenie vstupného poľa a nastavenie indikátora načítavania.
        setInput('');
        setIsLoading(true);

        try {
            // Predvolený systémový pokyn pre bota, ktorý definuje jeho osobnosť.
            const systemPrompt = `Si milý, priateľský a informovaný asistent pre webovú stránku GymBeam. Tvoja úloha je odpovedať na otázky o fitness, výžive a produktoch GymBeam. Vždy dávaj užitočné a pozitívne rady. Neuvádzaj lekárske rady ani konkrétne diétne plány. Buď priateľský a používaj emotikony. Odpovedaj v slovenčine.`;
            
            // Konverzia histórie správ do formátu, ktorý očakáva OpenAI API.
            const chatHistory = [
                { role: "system", content: systemPrompt },
                ...messages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                })),
                { role: "user", content: input } // Pridanie aktuálnej správy.
            ];

            const payload = {
                model: "gpt-3.5-turbo", // Model, ktorý chcete použiť.
                messages: chatHistory,
            };
            
            // DÔLEŽITÉ: API kľúč je tu ponechaný prázdny. V produkčnom prostredí by ste ho
            // mali bezpečne uložiť na serveri a nevystavovať ho vo frontend kóde.
            const apiKey = "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";
            const apiUrl = "https://api.openai.com/v1/chat/completions";

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Ak odpoveď nie je úspešná, vyvoláme chybu.
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error.message}`);
            }

            const result = await response.json();
            // Získanie textu odpovede z API.
            const botResponseText = result?.choices?.[0]?.message?.content || "Prepáčte, momentálne nie som schopný odpovedať.";

            // Pridanie odpovede bota do histórie.
            const newBotMessage = { sender: 'bot', text: botResponseText };
            setMessages(prevMessages => [...prevMessages, newBotMessage]);

        } catch (error) {
            console.error("Chyba pri volaní OpenAI API:", error);
            // Zobrazenie chybovej správy, ak API zlyhá.
            const errorMessage = { sender: 'bot', text: `Prepáčte, došlo k chybe: ${error.message}` };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            // Ukončenie načítavania po dokončení procesu.
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100 p-4 font-sans">
            <div className="flex flex-col w-full max-w-sm md:max-w-md h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                <header className="p-4 bg-blue-600 text-white flex items-center justify-between">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Bot size={24} />
                        GymBeam Bot
                    </h1>
                </header>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-[80%] ${
                                msg.sender === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
                                <div className="dot-flashing"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Opýtajte sa niečo..."
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="p-3 bg-blue-600 text-white rounded-full transition-colors duration-200 hover:bg-blue-700 disabled:bg-gray-400"
                        disabled={isLoading || input.trim() === ''}
                    >
                        <Send size={20} />
                    </button>
                </form>
                
                <style>
                {`
                .dot-flashing {
                    position: relative;
                    width: 10px;
                    height: 10px;
                    border-radius: 5px;
                    background-color: #9880ff;
                    color: #9880ff;
                    animation: dotFlashing 1s infinite linear alternate;
                    animation-delay: .5s;
                }
                .dot-flashing::before, .dot-flashing::after {
                    content: '';
                    display: inline-block;
                    position: absolute;
                    top: 0;
                }
                .dot-flashing::before {
                    left: -15px;
                    width: 10px;
                    height: 10px;
                    border-radius: 5px;
                    background-color: #9880ff;
                    color: #9880ff;
                    animation: dotFlashing 1s infinite alternate;
                    animation-delay: 0s;
                }
                .dot-flashing::after {
                    left: 15px;
                    width: 10px;
                    height: 10px;
                    border-radius: 5px;
                    background-color: #9880ff;
                    color: #9880ff;
                    animation: dotFlashing 1s infinite alternate;
                    animation-delay: 1s;
                }
                @keyframes dotFlashing {
                    0% {
                        background-color: #9880ff;
                    }
                    50%,
                    100% {
                        background-color: #e2e8f0;
                    }
                }
                `}
                </style>
            </div>
        </div>
    );
};

export default App;