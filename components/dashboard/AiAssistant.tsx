import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Paperclip, X } from 'lucide-react';
import { MockData, Asset } from '../../types';
import { generateContentStream } from '../../services/geminiService';

interface AiAssistantProps {
    mockData: MockData;
    getAllAssets: () => Asset[];
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    text: string;
    imageUrl?: string;
}

const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

const AiAssistant: React.FC<AiAssistantProps> = ({ mockData, getAllAssets, isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: "Hello! I'm the Instrumental Co-Pilot. How can I help you analyze your asset data?" }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        if (attachedFile) {
            const url = URL.createObjectURL(attachedFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreviewUrl(null);
    }, [attachedFile]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const sendPrompt = async (promptText: string, file: File | null) => {
        setIsLoading(true);
        
        const summarizedAssets = getAllAssets().map(asset => {
            const { timeSeriesData, ...rest } = asset;
            return rest;
        });

        const systemInstruction = `
            You are an expert maintenance and operations assistant for an industrial plant, acting as an Instrumental Co-Pilot.
            Your knowledge base contains information about potential failures and their consequences.
            You also have access to the current live status of all assets.
            When asked a question, use the provided knowledge base and live data to give a comprehensive and actionable answer.
            If an image is provided, analyze it in the context of the user's question and the asset data. For example, it could be a photo of a damaged component or an error message on a screen.
            
            KNOWLEDGE BASE:
            ${JSON.stringify(mockData.knowledgeBase, null, 2)}

            LIVE ASSET DATA (summarized, without detailed time-series):
            ${JSON.stringify(summarizedAssets, null, 2)}
        `;

        // Add a placeholder message for streaming
        const aiMessage: Message = { role: 'assistant', text: '' };
        setMessages(prev => [...prev, aiMessage]);

        try {
            const contentParts: any[] = [{ text: promptText }];
            if (file) {
                const base64Data = await readFileAsBase64(file);
                contentParts.push({
                    inlineData: {
                        mimeType: file.type,
                        data: base64Data,
                    },
                });
            }
            
            await generateContentStream(contentParts, systemInstruction, (streamingText) => {
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'assistant', text: streamingText };
                    return newMessages;
                });
            });

        } catch (error) {
            console.error("Error in AI Assistant component:", error);
            const errorMessage: Message = { role: 'assistant', text: "An unexpected error occurred while generating a response." };
             if (error instanceof Error) {
                errorMessage.text = `Error: ${error.message}`;
            }
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = errorMessage;
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        const userMessage: Message = { role: 'user', text: input, imageUrl: previewUrl ?? undefined };
        setMessages(prev => [...prev, userMessage]);
        sendPrompt(input, attachedFile);
        setInput('');
        setAttachedFile(null);
    };

    const handlePredefinedPrompt = (prompt: string) => {
        if (isLoading) return;
        const userMessage: Message = { role: 'user', text: prompt };
        setMessages(prev => [...prev, userMessage]);
        sendPrompt(prompt, null);
    };

    const predefinedPrompts = [
        "Summarize the most critical issues.",
        "Which assets are overdue for calibration?",
        "List all assets with 'Failure' status.",
        "What are the recommended actions for a sensor failure?",
    ];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setAttachedFile(event.target.files[0]);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md h-[70vh] max-h-[600px] flex flex-col border border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out">
            <header className="flex items-center justify-between p-4 border-b dark:border-gray-700 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Sparkles className="text-blue-500" />
                    Instrumental Co-Pilot
                </h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <X className="h-5 w-5" />
                </button>
            </header>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                           {msg.imageUrl && <img src={msg.imageUrl} alt="User attachment" className="rounded-md mb-2 max-h-48" />}
                           {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                           {msg.role === 'assistant' && isLoading && index === messages.length - 1 && !msg.text && (
                               <span className="inline-block w-2 h-5 bg-gray-500 animate-pulse ml-1"></span>
                           )}
                        </div>
                    </div>
                ))}

                 <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t dark:border-gray-700 flex-shrink-0">
                <div className="flex flex-wrap gap-2 mb-2">
                    {predefinedPrompts.map((prompt) => (
                        <button key={prompt} onClick={() => handlePredefinedPrompt(prompt)} disabled={isLoading} className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                            {prompt}
                        </button>
                    ))}
                </div>
                 {previewUrl && (
                    <div className="relative w-24 h-24 mb-2 p-1 border rounded-md">
                        <img src={previewUrl} alt="File preview" className="w-full h-full object-cover rounded-md" />
                        <button onClick={() => setAttachedFile(null)} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                 )}
                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-black dark:text-white font-bold p-2 rounded-lg disabled:opacity-50">
                        <Paperclip className="h-5 w-5"/>
                    </button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about your assets..."
                        disabled={isLoading}
                        className="flex-grow w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-blue-500 hover:bg-blue-600 text-white font-bold p-2 rounded-lg disabled:bg-blue-300 disabled:cursor-not-allowed">
                        <Send className="h-5 w-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiAssistant;
