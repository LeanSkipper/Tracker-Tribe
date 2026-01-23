'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, Bot } from 'lucide-react';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

export default function CoachPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I am your LAPIS Coach. I'm here to help you define your ambitious vision using the methods of the 'Protocole du Leader'. Shall we start by exploring your main Goal (Vision)?"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] })
            });

            if (!res.ok) throw new Error('Failed to fetch response');

            const data = await res.json();
            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error(error);
            // Fallback interaction if API fails
            setMessages(prev => [...prev, {
                id: 'error',
                role: 'assistant',
                content: "I'm having trouble connecting to my inner wisdom (API Error). Let's try that again?"
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white max-w-3xl mx-auto px-4 shadow-sm">
            <header className="py-4 border-b border-gray-100 flex items-center justify-between">
                <h1 className="text-xl font-bold text-[var(--primary)] flex items-center gap-2">
                    <Bot size={24} /> LAPIS Coach
                </h1>
                <span className="text-sm text-gray-400">Onboarding</span>
            </header>

            <main className="flex-1 overflow-y-auto py-6 space-y-6">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'user' ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-[var(--primary)]'}
            `}>
                            {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                        </div>

                        <div className={`
              max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user'
                                ? 'bg-[var(--primary)] text-white rounded-tr-none'
                                : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'}
            `}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 text-sm text-gray-400 animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="py-4 border-t border-gray-100 bg-white">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your response..."
                        className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] transition-colors"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="p-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </footer>
        </div>
    );
}
