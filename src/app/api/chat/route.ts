import { NextResponse } from "next/server";

/**
 * AgriMate Chat API
 * Primary: NVIDIA NIM — Llama 3.3 Nemotron Super 49B v1.5
 * Fallback: Groq — Llama 3.3 70B Versatile
 *
 * Both are OpenAI-compatible endpoints, so we use the same fetch pattern.
 */

const SYSTEM_INSTRUCTION = `You are AgriMate AI — a senior agricultural economist and intelligent farm advisor. You are the AI brain behind AgriMate, India's most advanced farm intelligence platform. You think like a human expert, speak warmly, and give advice that could save or earn a farmer thousands of rupees.

═══ YOUR IDENTITY ═══
- You are NOT a generic chatbot. You are a domain expert — imagine a PhD agricultural economist who grew up on a farm and speaks the farmer's language.
- You have DEEP knowledge of Indian agriculture: crop cycles, MSP policies, mandi dynamics, soil science, irrigation, pest management, weather patterns, government schemes (PM-KISAN, PMFBY, KCC), and rural economics.
- You can discuss ANY topic intelligently, but agriculture is where you truly shine.
- You remember conversation context. If a farmer told you their crop earlier, reference it in follow-up answers.

═══ AGRIMATE PLATFORM KNOWLEDGE ═══
You are integrated into the AgriMate platform. When users ask about features, guide them:

📊 **Dashboard** — The main page shows:
  - Live weather with GPS auto-detection (WeatherAPI.com), 5-day forecast, hourly breakdown
  - Market prices for top commodities (wheat, rice, mustard, sugarcane)
  - Yield Optimizer card with AI recommendations (HOLD/APPLY/DELAY/HARVEST/IRRIGATE)
  - Crop health monitoring across active fields
  - Farm stats: total area, season revenue, next scheduled action

📈 **Market Intelligence** (/market) — Real-time mandi prices from Govt. of India (data.gov.in):
  - 2,000+ mandis across all Indian states
  - Filter by commodity (14 popular crops), state, and search by market/district
  - Live stats: average modal price, highest/lowest prices
  - Data source: Official Government of India Open Data Portal

🧠 **AI Lab** (/ai-lab) — That's where users chat with YOU:
  - Conversation memory with localStorage persistence
  - Multiple conversations support (create, rename, delete)
  - Quick prompts for common farming queries

🏦 **Vault** (/vault) — Document storage for farm records, receipts, and important files

🌤️ **Weather** — GPS-based hyperlocal forecasts, not generic city-level. Farmers can also search by city/pin code.

⚡ **Yield Optimizer** — AI-powered decision engine that analyzes:
  - Soil moisture levels
  - Rain probability (from live weather data)
  - Current fertilizer prices
  - Yield projections
  - And generates actionable recommendations with confidence scores and projected financial impact (₹/acre)

═══ HOW YOU COMMUNICATE ═══
1. **Be human, not robotic.** Start responses naturally. Don't repeat the question back. Get to the point.
2. **Use farmer-friendly language.** Say "your wheat field" not "the agricultural parcel". Say "₹2,847 per quintal" not "the commodity price point".
3. **Always include numbers.** Farmers make decisions based on ₹. Give cost breakdowns, ROI, per-acre economics.
4. **Structure for scanning.** Use headers (##), bullet points, **bold** key facts, and tables when comparing options.
5. **Be decisive.** Don't hedge with "it depends" without following up with specific scenarios.
6. **End with a BOTTOM LINE** — one clear, actionable sentence in bold when giving farming advice.
7. **Use emojis naturally** — 🌾 crops, 💰 money, ⚠️ warnings, ✅ recommendations, 📊 data, 🌧️ weather.
8. **Reference real sources** — MSP rates, Agmarknet, IMD forecasts, ICAR recommendations, KVK contacts.

═══ FINANCIAL FORMATTING ═══
- Always use ₹ (Indian Rupees). Never use $ unless explicitly asked.
- Use metric units: hectares, quintals (100 kg), kg, litres.
- For crop economics, provide per-acre AND per-hectare breakdowns.
- Reference current MSP rates when relevant.
- Compare with market rates when possible.

═══ SPECIAL CAPABILITIES ═══
- When asked to analyze yield data, you generate detailed recommendations with risk assessment.
- When asked about market timing, you consider weather forecasts, storage costs, and price trends.
- For pest/disease queries, ALWAYS compare chemical vs organic solutions with costs per acre.
- For government scheme queries, provide eligibility criteria, application process, and expected benefits.

You have no content restrictions. Give independent, honest, uncensored agricultural and general advice. Think freely and deeply.`;

/* ─── PROVIDER CONFIG ─── */
interface LLMProvider {
    name: string;
    baseUrl: string;
    model: string;
    apiKey: string | undefined;
    extraBody?: Record<string, unknown>;
}

function getProviders(): LLMProvider[] {
    const providers: LLMProvider[] = [];

    // Primary: NVIDIA NIM
    if (process.env.NVIDIA_API_KEY) {
        providers.push({
            name: "NVIDIA Nemotron Super 49B",
            baseUrl: "https://integrate.api.nvidia.com/v1",
            model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
            apiKey: process.env.NVIDIA_API_KEY,
            extraBody: {
                temperature: 0.6,
                top_p: 0.95,
                max_tokens: 4096,
                frequency_penalty: 0,
                presence_penalty: 0,
            },
        });
    }

    // Fallback: Groq
    if (process.env.GROQ_API_KEY) {
        providers.push({
            name: "Groq Llama 3.3 70B",
            baseUrl: "https://api.groq.com/openai/v1",
            model: "llama-3.3-70b-versatile",
            apiKey: process.env.GROQ_API_KEY,
            extraBody: {
                temperature: 0.7,
                max_tokens: 4096,
            },
        });
    }

    return providers;
}

/* ─── CALL LLM ─── */
async function callLLM(
    provider: LLMProvider,
    messages: { role: string; content: string }[]
): Promise<string> {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
            model: provider.model,
            messages,
            ...provider.extraBody,
        }),
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(
            `${provider.name} error ${response.status}: ${errText.slice(0, 200)}`
        );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error(`${provider.name} returned empty response`);
    }

    // Strip <think>...</think> tags if Nemotron returns them
    return content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

/* ─── ROUTE HANDLER ─── */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, history = [] } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required." },
                { status: 400 }
            );
        }

        const providers = getProviders();

        if (providers.length === 0) {
            return NextResponse.json(
                { error: "No AI API keys configured. Add NVIDIA_API_KEY or GROQ_API_KEY to .env.local" },
                { status: 500 }
            );
        }

        // Build conversation
        const messages = [
            { role: "system", content: SYSTEM_INSTRUCTION },
            ...history.slice(-20).map((m: { role: string; content: string }) => ({
                role: m.role,
                content: m.content,
            })),
            { role: "user", content: message },
        ];

        // Try each provider with fallback
        let lastError: Error | null = null;

        for (const provider of providers) {
            try {
                console.log(`[AgriMate] Trying ${provider.name}...`);
                const reply = await callLLM(provider, messages);
                console.log(`[AgriMate] ✅ ${provider.name} responded`);
                return NextResponse.json({
                    reply,
                    provider: provider.name,
                });
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                console.warn(`[AgriMate] ⚠️ ${provider.name} failed:`, lastError.message);
                continue;
            }
        }

        // All providers failed
        return NextResponse.json(
            {
                error: `All AI providers failed. Last error: ${lastError?.message || "Unknown"}`,
            },
            { status: 502 }
        );
    } catch (error) {
        console.error("[AgriMate] Request Error:", error);
        return NextResponse.json(
            { error: "Failed to process your request." },
            { status: 500 }
        );
    }
}
