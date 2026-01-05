import { NextResponse } from 'next/server';

// Mock context references from "Le Protocole du Leader"
const PROTOCOL_CONTEXT = {
    philosophy: "The LAPIS method emphasizes 'Simplicity', 'Skin in the game', and 'Altruism'. A leader must be specific, measurable, and committed.",
    grow_questions: {
        G: "What is your main Goal? Be ambitious. Think 'Vision'.",
        R: "What is your current Reality? Be honest about where you are starting from.",
        O: "What acts/Options do you have to bridge the gap?",
        W: "What Will you commit to doing this week? Define the Way forward."
    }
};

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || "";

        // Simple Heuristic Coach Logic (State Machine Mock)
        let response = "";

        // Detect context from history length roughly maps to stage of conversation
        // 1. Initial -> (Assistant Greeted) -> User replies to Greet (or Goal)
        // 2. Goal -> Reality
        // 3. Reality -> Options
        // 4. Options -> Will
        // 5. Will -> Finish

        const historyLength = messages.filter((m: any) => m.role === 'user').length;

        if (historyLength <= 1) {
            response = "That sounds like a start. " + PROTOCOL_CONTEXT.grow_questions.G + " Remember to make it specific (SMART).";
        } else if (historyLength === 2) {
            response = "Understood. Now, " + PROTOCOL_CONTEXT.grow_questions.R;
        } else if (historyLength === 3) {
            response = "I see. " + PROTOCOL_CONTEXT.grow_questions.O + " List 2-3 potential paths.";
        } else if (historyLength === 4) {
            response = "Great options. Now, " + PROTOCOL_CONTEXT.grow_questions.W + " What is your specific commitment for the 'Poker' table?";
        } else {
            response = "Excellent. You have defined your path. I will log this into your Vision GROW. You are ready to join the Tribe.";
        }

        // Add some "Protocol" flavor if user is vague (simple keyword check)
        if (lastUserMessage.length < 10) {
            response = "Can you elaborate? A leader speaks with precision. " + response;
        }

        return NextResponse.json({ response });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
