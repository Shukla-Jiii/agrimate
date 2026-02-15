/* ─── Yield Optimizer — Live Analysis API ─── */

export interface FarmInput {
    crop: string;
    area: number;       // hectares
    state: string;
    soilType: string;
}

export interface WeatherSnapshot {
    temperature: number;
    humidity: number;
    rainChance: number;
    windSpeed: number;
    condition: string;
    location: string;
}

export interface MarketSnapshot {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    recordCount: number;
}

export interface AnalysisResult {
    weather: WeatherSnapshot | null;
    market: MarketSnapshot | null;
    aiAnalysis: string;
    recommendation: {
        action: "HOLD" | "APPLY" | "DELAY" | "HARVEST" | "IRRIGATE";
        riskLevel: "critical" | "warning" | "optimal" | "neutral";
        headline: string;
        rationale: string;
        projectedImpact: number;
        confidence: number;
    };
    soilMoisture: number;
    yieldProjection: number;
}

/* ─── Fetch Weather ─── */
async function fetchWeatherData(): Promise<WeatherSnapshot | null> {
    try {
        const res = await fetch("/api/weather");
        const data = await res.json();
        if (!data.current) return null;

        const todayForecast = data.forecast?.[0];
        return {
            temperature: data.current.temperature,
            humidity: data.current.humidity,
            rainChance: todayForecast?.rainChance ?? 0,
            windSpeed: data.current.windSpeed,
            condition: data.current.condition.text,
            location: `${data.location.name}, ${data.location.region}`,
        };
    } catch {
        return null;
    }
}

/* ─── Fetch Mandi Prices ─── */
async function fetchMarketData(crop: string): Promise<MarketSnapshot | null> {
    try {
        const res = await fetch(`/api/mandi?commodity=${encodeURIComponent(crop)}&limit=50`);
        const data = await res.json();
        if (!data.records || data.records.length === 0) return null;

        const prices = data.records.map((r: { modalPrice: number; minPrice: number; maxPrice: number }) => ({
            modal: r.modalPrice,
            min: r.minPrice,
            max: r.maxPrice,
        }));

        const avgPrice = Math.round(prices.reduce((s: number, p: { modal: number }) => s + p.modal, 0) / prices.length);
        const minPrice = Math.min(...prices.map((p: { min: number }) => p.min));
        const maxPrice = Math.max(...prices.map((p: { max: number }) => p.max));

        return { avgPrice, minPrice, maxPrice, recordCount: data.records.length };
    } catch {
        return null;
    }
}

/* ─── Get AI Analysis ─── */
async function getAIAnalysis(
    input: FarmInput,
    weather: WeatherSnapshot | null,
    market: MarketSnapshot | null
): Promise<string> {
    const prompt = `You are the AgriMate Yield Optimizer AI. Analyze this farm data and give a STRUCTURED recommendation.

FARM DATA:
- Crop: ${input.crop}
- Area: ${input.area} hectares
- State: ${input.state}
- Soil Type: ${input.soilType}

${weather ? `LIVE WEATHER (${weather.location}):
- Temperature: ${weather.temperature}°C
- Humidity: ${weather.humidity}%
- Rain Probability Today: ${weather.rainChance}%
- Wind: ${weather.windSpeed} km/h
- Condition: ${weather.condition}` : "WEATHER: Unavailable"}

${market ? `LIVE MARKET PRICES (${input.crop}):
- Average Modal Price: ₹${market.avgPrice.toLocaleString()}/quintal
- Price Range: ₹${market.minPrice.toLocaleString()} — ₹${market.maxPrice.toLocaleString()}/quintal
- Data from ${market.recordCount} mandis` : "MARKET DATA: Unavailable"}

RESPOND IN THIS EXACT JSON FORMAT (no markdown, no code blocks, just raw JSON):
{
    "action": "HOLD|APPLY|DELAY|HARVEST|IRRIGATE",
    "riskLevel": "critical|warning|optimal|neutral",
    "headline": "One-line decision headline",
    "rationale": "2-3 sentence explanation with specific numbers and ₹ figures",
    "projectedImpact": <number, positive=gain negative=loss in ₹/acre>,
    "confidence": <0-100>,
    "soilMoistureEstimate": <0-100 based on weather/season/soil type>,
    "yieldProjection": <quintals per hectare estimate>,
    "fullAnalysis": "Detailed 4-5 paragraph analysis covering: 1) Current conditions assessment 2) Market opportunity 3) Risk factors 4) Recommended action plan with timeline 5) Expected returns calculation in ₹"
}`;

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: prompt, history: [] }),
        });
        const data = await res.json();
        return data.reply || "";
    } catch {
        return "";
    }
}

/* ─── Parse AI Response ─── */
function parseAIResponse(raw: string): AnalysisResult["recommendation"] & { soilMoisture: number; yieldProjection: number; fullAnalysis: string } {
    // Try to extract JSON from the response
    let json: Record<string, unknown> = {};
    try {
        // Try direct parse first
        json = JSON.parse(raw);
    } catch {
        // Try to find JSON in the text
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                json = JSON.parse(match[0]);
            } catch {
                // Fallback
            }
        }
    }

    const validActions = ["HOLD", "APPLY", "DELAY", "HARVEST", "IRRIGATE"] as const;
    const validRisks = ["critical", "warning", "optimal", "neutral"] as const;

    const action = validActions.includes(json.action as typeof validActions[number])
        ? (json.action as typeof validActions[number])
        : "DELAY";

    const riskLevel = validRisks.includes(json.riskLevel as typeof validRisks[number])
        ? (json.riskLevel as typeof validRisks[number])
        : "neutral";

    return {
        action,
        riskLevel,
        headline: (json.headline as string) || "Analysis complete — review recommendations below.",
        rationale: (json.rationale as string) || "Based on available data, a cautious approach is recommended.",
        projectedImpact: (json.projectedImpact as number) || 0,
        confidence: Math.min(100, Math.max(0, (json.confidence as number) || 70)),
        soilMoisture: (json.soilMoistureEstimate as number) || 50,
        yieldProjection: (json.yieldProjection as number) || 30,
        fullAnalysis: (json.fullAnalysis as string) || raw,
    };
}

/* ═══ MAIN EXPORT ═══ */
export async function fetchYieldAnalysis(input: FarmInput): Promise<AnalysisResult & { fullAnalysis: string }> {
    // Fetch weather and market data in parallel
    const [weather, market] = await Promise.all([
        fetchWeatherData(),
        fetchMarketData(input.crop),
    ]);

    // Get AI analysis
    const aiRaw = await getAIAnalysis(input, weather, market);
    const parsed = parseAIResponse(aiRaw);

    return {
        weather,
        market,
        aiAnalysis: aiRaw,
        recommendation: {
            action: parsed.action,
            riskLevel: parsed.riskLevel,
            headline: parsed.headline,
            rationale: parsed.rationale,
            projectedImpact: parsed.projectedImpact,
            confidence: parsed.confidence,
        },
        soilMoisture: parsed.soilMoisture,
        yieldProjection: parsed.yieldProjection,
        fullAnalysis: parsed.fullAnalysis,
    };
}
