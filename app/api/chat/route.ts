import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { products } from '@/lib/data';


// Compact product list for the system prompt
const productCatalog = products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    description: p.description,
}));

const SYSTEM_PROMPT = `You are a helpful electronics project assistant for OPAC Labs, an electronics store for students in India.

When a student describes a project idea, suggest the relevant components from our catalog.

CATALOG:
${JSON.stringify(productCatalog, null, 2)}

RULES:
- Always respond with a JSON object in this exact format:
{
  "message": "friendly explanation of the project and why these components are needed",
  "suggestions": [
    { "id": <product_id_number>, "name": "<product_name>", "reason": "<why this component is needed>" }
  ]
}
- Only suggest products that exist in the catalog (use exact id and name).
- Suggest 3–6 relevant components.
- Keep the message conversational and helpful.
- If the idea is unclear, ask a clarifying question but still return the JSON format with empty suggestions array.
- Always return valid JSON only, no markdown, no extra text.`;

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        const { messages } = await req.json();

        if (!apiKey) {
            // Local dev fallback if OpenAI API key is not configured
            const lastMessage = messages[messages.length - 1]?.content || '';
            const matchedProducts = products.filter(p => 
                lastMessage.toLowerCase().includes(p.name.toLowerCase()) || 
                lastMessage.toLowerCase().includes(p.category.toLowerCase())
            ).slice(0, 3);

            const fallbackSuggestions = matchedProducts.length > 0 
                ? matchedProducts.map(p => ({ id: p.id, name: p.name, reason: `Suitable component matching: ${p.name}` }))
                : [
                    { id: 1, name: "Arduino Uno R3", reason: "Standard microcontroller for control logic." },
                    { id: 4, name: "HC-SR04 Ultrasonic Sensor", reason: "For range finding and distance sensing." }
                  ];

            return NextResponse.json({
                message: `[Mock Assistant] To build this project, you'll need a microcontroller and some basic sensors. (Set OPENAI_API_KEY in .env.local to enable full GPT-4 suggestions).`,
                suggestions: fallbackSuggestions
            });
        }

        const openai = new OpenAI({ apiKey });

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages,
            ],
            temperature: 0.7,
            max_tokens: 800,
        });

        const raw = completion.choices[0].message.content || '{}';

        // Parse and validate the JSON response
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch {
            parsed = { message: raw, suggestions: [] };
        }

        return NextResponse.json(parsed);
    } catch (error: unknown) {
        console.error('Chat API error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
