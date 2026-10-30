import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuthenticatedUser } from '@/lib/auth';
import { RequestError, clientAddress, enforceRateLimit, readJsonRequest, requestErrorResponse } from '@/lib/serverSecurity';
import { getOpenAiKey } from '@/lib/serverSecrets';

export const dynamic = 'force-dynamic';

type Step = { name: string; reason: string };

function outlineProject(idea: string): { message: string; suggestions: Step[] } {
    const text = idea.toLowerCase();
    const businessSystem = /\berp\b|\bcrm\b|customer relationship|inventory management|sales pipeline|business operations/.test(text);
    const software = businessSystem || /website|web app|mobile|app|dashboard|api|platform|software|saas|database|portal/.test(text);
    const hardware = /robot|sensor|device|circuit|arduino|esp32|iot|prototype|embedded|motor|irrigat|automation/.test(text);
    const focus = software && hardware ? 'a connected software and hardware project' : businessSystem ? 'a custom ERP or CRM system' : software ? 'a software project' : hardware ? 'a hardware project' : 'a custom project';
    const suggestions: Step[] = [
        { name: 'Define the outcome', reason: 'Clarify who will use it, the problem it solves, and what a successful first version must do.' },
        ...(software ? [{ name: businessSystem ? 'Map the workflow' : 'Design the software', reason: businessSystem ? 'Identify your teams, records, approvals, and existing tools before choosing the first modules.' : 'Map the screens, data, integrations, and core user journey before development.' }] : []),
        ...(hardware ? [{ name: 'Prototype the hardware', reason: 'Plan the electronics, enclosure, power, and real-world testing needed for a working build.' }] : []),
        { name: 'Build and validate', reason: 'Create a focused prototype, test the key scenarios, then refine it with your feedback.' },
    ];
    return {
        message: `This sounds like ${focus}. We can help turn the idea into a scoped brief and a working deliverable. Share your goal, deadline, and any must-have features so our team can review the right approach.`,
        suggestions,
    };
}

export async function POST(req: NextRequest) {
    try {
        await enforceRateLimit('chat-global', 'all', 2000, 60_000);
        await enforceRateLimit('chat-ip', clientAddress(req), 40, 60_000);
        const body = await readJsonRequest<Record<string, unknown>>(req, 32 * 1024);
        const messages = body?.messages;
        if (!Array.isArray(messages) || messages.length < 1 || messages.length > 10 ||
            messages.some(message => !['user', 'assistant'].includes(message?.role) || typeof message.content !== 'string' || message.content.length < 1 || message.content.length > 1500) ||
            messages.reduce((total, message) => total + message.content.length, 0) > 12_000) {
            return NextResponse.json({ error: 'Describe your project idea to continue.' }, { status: 400 });
        }
        const lastUserMessage = [...messages].reverse().find(message => message.role === 'user')?.content;
        if (!lastUserMessage) return NextResponse.json({ error: 'Describe your project idea to continue.' }, { status: 400 });

        const fallback = outlineProject(lastUserMessage);
        const openAiKey = getOpenAiKey();
        if (!openAiKey) return NextResponse.json(fallback);
        const user = await getAuthenticatedUser(req);
        if (!user || user.email_verified !== true) return NextResponse.json(fallback);
        await enforceRateLimit('paid-chat-user', user.uid, 10, 60_000);
        await enforceRateLimit('paid-chat-global', 'all', 100, 60_000);
        try {
            // Reserve before the provider call; failed calls also consume quota.
            await enforceRateLimit('paid-chat-user-daily', user.uid, 20, 86_400_000);
            await enforceRateLimit('paid-chat-site-daily', 'all', 200, 86_400_000);
        } catch (error) {
            if (error instanceof RequestError && error.status === 429) {
                return NextResponse.json({ ...fallback, message: `Today's AI planning allowance has been reached. Here is a basic project outline; you can still send your brief to our team. ${fallback.message}` });
            }
            throw error;
        }

        try {
            const completion = await new OpenAI({ apiKey: openAiKey, timeout: 20_000, maxRetries: 0 }).chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are OPAC Labs project planning assistant. OPAC Labs provides custom software, ERP and CRM, and hardware project services; it does not sell components. Only answer questions related to planning OPAC software, hardware, ERP, CRM, or portfolio projects. Briefly redirect unrelated requests to project planning. Return JSON with a concise message and 2-4 suggestions, each with name and reason. Suggest scope, architecture, prototype, testing, or delivery steps. Do not quote prices, claim a project is accepted, or promise a deadline. Ask for missing requirements when needed.' },
                    ...messages.map(message => ({ role: message.role as 'user' | 'assistant', content: message.content as string })),
                ],
                response_format: { type: 'json_object' },
                max_tokens: 700,
            });
            const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
            const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 4).filter((step: Step) => typeof step?.name === 'string' && typeof step?.reason === 'string').map((step: Step) => ({ name: step.name.slice(0, 80), reason: step.reason.slice(0, 240) })) : fallback.suggestions;
            return NextResponse.json({ message: typeof parsed.message === 'string' ? parsed.message.slice(0, 2000) : fallback.message, suggestions });
        } catch (error) {
            console.error('AI project planning unavailable:', error);
            return NextResponse.json(fallback);
        }
    } catch (error) {
        if (!(error instanceof RequestError)) console.error('Project planning request failed:', error);
        return requestErrorResponse(error, 'Could not plan this project. Please try again.');
    }
}
