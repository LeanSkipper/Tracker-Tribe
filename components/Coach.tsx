'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, BrainCircuit, Target } from 'lucide-react';

type MonthlyData = { monthId: string; year: number; target: number | null; actual: number | null; };
type GoalCategory = { id: string; category: string; title: string; rows: any[]; };

interface CoachProps {
    goals: GoalCategory[];
    className?: string;
}

type Message = {
    id: string;
    sender: 'user' | 'coach';
    text: string;
    type?: 'text' | 'action';
    options?: string[];
};

export default function Coach({ goals, className = '' }: CoachProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'coach', text: "Hello! I'm Lapis, your Personal Growth Architect.", type: 'text' },
        { id: '2', sender: 'coach', text: "I can help you structure new goals or analyze your current progress using Lean methodologies. What would you like to do?", type: 'text', options: ["New Goal", "Analyze Progress", "Problem Solving"] }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Simple Rule-Based "AI"
    const processResponse = (userInput: string) => {
        setIsTyping(true);
        const lowerInput = userInput.toLowerCase();

        setTimeout(() => {
            let responseText = "I'm focusing on your request...";
            let options: string[] | undefined = undefined;

            if (lowerInput.includes('new goal') || lowerInput.includes('create')) {
                responseText = "Great! Let's turn your story into a structured strategy. What is the 'Vision' or big dream you want to achieve? (e.g., 'Become an Ironman', 'Financial Freedom')";
            } else if (lowerInput.includes('ironman') || lowerInput.includes('financial') || lowerInput.includes('health')) {
                responseText = "That's a powerful vision. Now, let's break it down. What is the ONE main result metric (OKR) that proves you achieved this? (e.g., 'Race Time', 'Net Worth')";
            } else if (lowerInput.includes('analyze') || lowerInput.includes('progress')) {
                // Holistic Analysis of Props
                const redMetrics = goals.flatMap(g => g.rows.filter(r => 'monthlyData' in r)).flatMap(r => {
                    // Simplified check for last active month
                    const lastData = r.monthlyData.find(d => d.actual !== null);
                    if (lastData && lastData.target && ((r.targetValue > r.startValue && lastData.actual! < lastData.target) || (r.targetValue < r.startValue && lastData.actual! > lastData.target))) {
                        return `${r.label}`;
                    }
                    return null;
                }).filter(Boolean);

                if (redMetrics.length > 0) {
                    responseText = `I've analyzed your holistic scorecard. I noticed ${redMetrics.length} metrics are off-track: ${redMetrics.slice(0, 2).join(', ')}. \n\nShall we apply the "5 Whys" method to find the root cause for **${redMetrics[0]}**?`;
                    options = ["Start 5 Whys", "Show me Pareto"];
                } else {
                    responseText = "Your holistic system looks healthy! All reported metrics are on track. Is there a specific habit (Input Metric) you want to optimize further?";
                }
            } else if (lowerInput.includes('5 whys') || lowerInput.includes('why')) {
                responseText = "Let's dig deeper. Why do you think the result was missed this month? (Be honest, look at your process)";
            } else if (lowerInput.includes('because')) {
                responseText = "And why did that happen? (We need to reach the root cause, usually 5 levels down)";
            } else if (lowerInput.includes('problem') || lowerInput.includes('solve')) {
                responseText = "For structured problem solving, I recommend the 8D approach or PDCA. \n\n1. **Plan**: Define the gap.\n2. **Do**: Execute a countermeasure.\n3. **Check**: Measure effect.\n4. **Act**: Standardize.\n\nWhich stage are you stuck in?";
            } else {
                responseText = "I'm listening. How does this align with your long-term Vision in the 'GPS'? Remember, systems drive behavior.";
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'coach', text: responseText, options }]);
            setIsTyping(false);
        }, 1200);
    };

    const handleSend = (text: string = input) => {
        if (!text.trim()) return;
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
        setInput('');
        processResponse(text);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-2 font-bold ${className}`}
            >
                <Sparkles size={20} className="animate-pulse" />
                <span className="pr-1">Lapis Coach</span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 z-50 w-[380px] h-[600px] bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-sans ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                        <BrainCircuit size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Lapis Coach AI</h3>
                        <p className="text-[10px] opacity-80 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online • Personal Dev Specialist</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full"><X size={18} /></button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                            max-w-[85%] p-3 rounded-2xl text-sm shadow-sm
                            ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'}
                        `}>
                            <p className="leading-relaxed">{msg.text}</p>
                            {msg.sender === 'coach' && <div className="text-[9px] opacity-50 mt-1 flex justify-end">Lapis AI</div>}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}
                {/* Visual Options Quick Select */}
                {messages[messages.length - 1]?.sender === 'coach' && messages[messages.length - 1]?.options && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {messages[messages.length - 1].options!.map(opt => (
                            <button key={opt} onClick={() => handleSend(opt)} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100 font-bold hover:bg-indigo-100 transition-colors">
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:ring-2 ring-indigo-100 transition-all">
                    <input
                        className="flex-1 bg-transparent px-3 text-sm outline-none text-gray-700 placeholder:text-gray-400"
                        placeholder="Ask me anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={() => handleSend()} className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-sm transition-colors">
                        <Send size={16} />
                    </button>
                </div>
                <p className="text-[10px] text-center text-gray-300 mt-2">Powered by holistic system methodology</p>
            </div>
        </div>
    );
}
