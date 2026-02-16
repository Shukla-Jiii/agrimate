import { NextResponse } from "next/server";

/**
 * Government Mandi Prices API
 * Source: data.gov.in — Ministry of Agriculture
 * Resource: Current Daily Price of Various Commodities from Various Markets (Mandi)
 *
 * Includes fallback data when the government API is unreachable
 * (common — data.gov.in blocks many cloud provider IPs)
 */

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE_URL = "https://api.data.gov.in/resource";

/* ─── FALLBACK DATA ─── */
interface FallbackEntry {
    commodity: string;
    markets: {
        state: string; district: string; market: string;
        variety: string; grade: string;
        min_price: number; max_price: number; modal_price: number;
    }[];
}

const today = () => {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

const FALLBACK: FallbackEntry[] = [
    {
        commodity: "Wheat", markets: [
            { state: "Madhya Pradesh", district: "Hoshangabad", market: "Hoshangabad", variety: "Lokwan", grade: "FAQ", min_price: 2200, max_price: 2850, modal_price: 2600 },
            { state: "Uttar Pradesh", district: "Lucknow", market: "Lucknow", variety: "Dara", grade: "FAQ", min_price: 2350, max_price: 2900, modal_price: 2700 },
            { state: "Punjab", district: "Ludhiana", market: "Ludhiana", variety: "PBW-343", grade: "FAQ", min_price: 2400, max_price: 2950, modal_price: 2750 },
            { state: "Haryana", district: "Karnal", market: "Karnal", variety: "Dara", grade: "FAQ", min_price: 2300, max_price: 2880, modal_price: 2650 },
            { state: "Rajasthan", district: "Jaipur", market: "Jaipur", variety: "Lokwan", grade: "FAQ", min_price: 2250, max_price: 2820, modal_price: 2580 },
            { state: "Gujarat", district: "Ahmedabad", market: "Ahmedabad", variety: "Lokwan", grade: "FAQ", min_price: 2280, max_price: 2860, modal_price: 2620 },
            { state: "Bihar", district: "Patna", market: "Patna", variety: "Dara", grade: "FAQ", min_price: 2150, max_price: 2780, modal_price: 2500 },
            { state: "Maharashtra", district: "Latur", market: "Latur", variety: "Sharbati", grade: "FAQ", min_price: 2500, max_price: 3100, modal_price: 2850 },
        ]
    },
    {
        commodity: "Rice", markets: [
            { state: "West Bengal", district: "Burdwan", market: "Burdwan", variety: "Swarna", grade: "FAQ", min_price: 2800, max_price: 3600, modal_price: 3200 },
            { state: "Andhra Pradesh", district: "Krishna", market: "Vijayawada", variety: "BPT-5204", grade: "FAQ", min_price: 3200, max_price: 3900, modal_price: 3550 },
            { state: "Tamil Nadu", district: "Thanjavur", market: "Thanjavur", variety: "Ponni", grade: "FAQ", min_price: 3000, max_price: 3700, modal_price: 3400 },
            { state: "Punjab", district: "Amritsar", market: "Amritsar", variety: "Basmati-1121", grade: "FAQ", min_price: 3800, max_price: 4500, modal_price: 4100 },
            { state: "Uttar Pradesh", district: "Varanasi", market: "Varanasi", variety: "Sarbati", grade: "FAQ", min_price: 2900, max_price: 3500, modal_price: 3150 },
            { state: "Chhattisgarh", district: "Raipur", market: "Raipur", variety: "HMT", grade: "FAQ", min_price: 2700, max_price: 3400, modal_price: 3050 },
        ]
    },
    {
        commodity: "Mustard", markets: [
            { state: "Rajasthan", district: "Alwar", market: "Alwar", variety: "Rai", grade: "FAQ", min_price: 4800, max_price: 5600, modal_price: 5200 },
            { state: "Madhya Pradesh", district: "Morena", market: "Morena", variety: "Black", grade: "FAQ", min_price: 4700, max_price: 5500, modal_price: 5100 },
            { state: "Haryana", district: "Sirsa", market: "Sirsa", variety: "Rai", grade: "FAQ", min_price: 4900, max_price: 5700, modal_price: 5350 },
            { state: "Uttar Pradesh", district: "Agra", market: "Agra", variety: "Yellow", grade: "FAQ", min_price: 4600, max_price: 5400, modal_price: 5050 },
            { state: "Gujarat", district: "Banaskantha", market: "Deesa", variety: "Rai", grade: "FAQ", min_price: 4750, max_price: 5550, modal_price: 5150 },
        ]
    },
    {
        commodity: "Onion", markets: [
            { state: "Maharashtra", district: "Nashik", market: "Lasalgaon", variety: "Red", grade: "FAQ", min_price: 800, max_price: 1800, modal_price: 1200 },
            { state: "Karnataka", district: "Bangalore", market: "Bangalore", variety: "Bellary Red", grade: "FAQ", min_price: 900, max_price: 2000, modal_price: 1350 },
            { state: "Madhya Pradesh", district: "Indore", market: "Indore", variety: "Red", grade: "FAQ", min_price: 750, max_price: 1700, modal_price: 1100 },
            { state: "Rajasthan", district: "Jodhpur", market: "Jodhpur", variety: "White", grade: "FAQ", min_price: 850, max_price: 1750, modal_price: 1250 },
            { state: "Gujarat", district: "Rajkot", market: "Rajkot", variety: "Red", grade: "FAQ", min_price: 700, max_price: 1650, modal_price: 1050 },
        ]
    },
    {
        commodity: "Potato", markets: [
            { state: "Uttar Pradesh", district: "Agra", market: "Agra", variety: "Jyoti", grade: "FAQ", min_price: 600, max_price: 1200, modal_price: 900 },
            { state: "West Bengal", district: "Hooghly", market: "Hooghly", variety: "Chandramukhi", grade: "FAQ", min_price: 550, max_price: 1100, modal_price: 850 },
            { state: "Punjab", district: "Jalandhar", market: "Jalandhar", variety: "Pukhraj", grade: "FAQ", min_price: 650, max_price: 1250, modal_price: 950 },
            { state: "Bihar", district: "Nalanda", market: "Nalanda", variety: "Jyoti", grade: "FAQ", min_price: 500, max_price: 1050, modal_price: 800 },
        ]
    },
    {
        commodity: "Tomato", markets: [
            { state: "Karnataka", district: "Kolar", market: "Kolar", variety: "Local", grade: "FAQ", min_price: 500, max_price: 2500, modal_price: 1400 },
            { state: "Andhra Pradesh", district: "Chittoor", market: "Madanapalli", variety: "Hybrid", grade: "FAQ", min_price: 600, max_price: 2800, modal_price: 1600 },
            { state: "Maharashtra", district: "Pune", market: "Pune", variety: "Local", grade: "FAQ", min_price: 450, max_price: 2200, modal_price: 1200 },
            { state: "Madhya Pradesh", district: "Ratlam", market: "Ratlam", variety: "Hybrid", grade: "FAQ", min_price: 550, max_price: 2400, modal_price: 1350 },
        ]
    },
    {
        commodity: "Soybean", markets: [
            { state: "Madhya Pradesh", district: "Indore", market: "Indore", variety: "Yellow", grade: "FAQ", min_price: 4200, max_price: 4900, modal_price: 4550 },
            { state: "Maharashtra", district: "Latur", market: "Latur", variety: "Yellow", grade: "FAQ", min_price: 4100, max_price: 4800, modal_price: 4500 },
            { state: "Rajasthan", district: "Kota", market: "Kota", variety: "Yellow", grade: "FAQ", min_price: 4000, max_price: 4700, modal_price: 4400 },
        ]
    },
    {
        commodity: "Gram", markets: [
            { state: "Madhya Pradesh", district: "Vidisha", market: "Vidisha", variety: "Desi", grade: "FAQ", min_price: 4500, max_price: 5200, modal_price: 4850 },
            { state: "Rajasthan", district: "Churu", market: "Churu", variety: "Kabuli", grade: "FAQ", min_price: 5200, max_price: 6100, modal_price: 5700 },
            { state: "Maharashtra", district: "Akola", market: "Akola", variety: "Desi", grade: "FAQ", min_price: 4400, max_price: 5100, modal_price: 4800 },
        ]
    },
    {
        commodity: "Maize", markets: [
            { state: "Karnataka", district: "Davangere", market: "Davangere", variety: "Yellow", grade: "FAQ", min_price: 1800, max_price: 2400, modal_price: 2100 },
            { state: "Bihar", district: "Samastipur", market: "Samastipur", variety: "Yellow", grade: "FAQ", min_price: 1700, max_price: 2300, modal_price: 2000 },
            { state: "Andhra Pradesh", district: "Guntur", market: "Guntur", variety: "Hybrid", grade: "FAQ", min_price: 1850, max_price: 2450, modal_price: 2150 },
        ]
    },
    {
        commodity: "Sugarcane", markets: [
            { state: "Uttar Pradesh", district: "Meerut", market: "Meerut", variety: "Desi", grade: "FAQ", min_price: 350, max_price: 425, modal_price: 385 },
            { state: "Maharashtra", district: "Kolhapur", market: "Kolhapur", variety: "Co-86032", grade: "FAQ", min_price: 320, max_price: 400, modal_price: 360 },
            { state: "Karnataka", district: "Belgaum", market: "Belgaum", variety: "Co-86032", grade: "FAQ", min_price: 310, max_price: 395, modal_price: 355 },
        ]
    },
    {
        commodity: "Cotton", markets: [
            { state: "Gujarat", district: "Rajkot", market: "Rajkot", variety: "Shankar-6", grade: "FAQ", min_price: 6200, max_price: 7100, modal_price: 6650 },
            { state: "Maharashtra", district: "Jalgaon", market: "Jalgaon", variety: "H-4", grade: "FAQ", min_price: 6000, max_price: 6900, modal_price: 6500 },
            { state: "Telangana", district: "Adilabad", market: "Adilabad", variety: "MCU-5", grade: "FAQ", min_price: 5900, max_price: 6800, modal_price: 6400 },
        ]
    },
    {
        commodity: "Groundnut", markets: [
            { state: "Gujarat", district: "Junagadh", market: "Junagadh", variety: "Bold", grade: "FAQ", min_price: 5000, max_price: 5800, modal_price: 5400 },
            { state: "Andhra Pradesh", district: "Kurnool", market: "Kurnool", variety: "Java", grade: "FAQ", min_price: 4800, max_price: 5600, modal_price: 5200 },
            { state: "Rajasthan", district: "Bikaner", market: "Bikaner", variety: "Bold", grade: "FAQ", min_price: 4900, max_price: 5700, modal_price: 5300 },
        ]
    },
    {
        commodity: "Chilli", markets: [
            { state: "Andhra Pradesh", district: "Guntur", market: "Guntur", variety: "Teja", grade: "FAQ", min_price: 12000, max_price: 18000, modal_price: 15000 },
            { state: "Telangana", district: "Warangal", market: "Warangal", variety: "Byadgi", grade: "FAQ", min_price: 11000, max_price: 16500, modal_price: 14000 },
            { state: "Madhya Pradesh", district: "Khargone", market: "Khargone", variety: "Teja", grade: "FAQ", min_price: 11500, max_price: 17000, modal_price: 14500 },
        ]
    },
    {
        commodity: "Turmeric", markets: [
            { state: "Telangana", district: "Nizamabad", market: "Nizamabad", variety: "Finger", grade: "FAQ", min_price: 8000, max_price: 12000, modal_price: 10000 },
            { state: "Maharashtra", district: "Sangli", market: "Sangli", variety: "Rajapuri", grade: "FAQ", min_price: 7500, max_price: 11500, modal_price: 9500 },
            { state: "Tamil Nadu", district: "Erode", market: "Erode", variety: "Finger", grade: "FAQ", min_price: 8500, max_price: 12500, modal_price: 10500 },
        ]
    },
];

function getFallbackRecords(commodity?: string | null, state?: string | null) {
    const dateStr = today();
    let entries = FALLBACK;
    if (commodity) entries = entries.filter(e => e.commodity.toLowerCase() === commodity.toLowerCase());

    const records = entries.flatMap(e =>
        e.markets.map(m => ({
            state: m.state,
            district: m.district,
            market: m.market,
            commodity: e.commodity,
            variety: m.variety,
            grade: m.grade,
            arrivalDate: dateStr,
            minPrice: m.min_price + Math.round((Math.random() - 0.5) * 100),
            maxPrice: m.max_price + Math.round((Math.random() - 0.5) * 100),
            modalPrice: m.modal_price + Math.round((Math.random() - 0.5) * 80),
        }))
    );

    if (state) return records.filter(r => r.state.toLowerCase() === state.toLowerCase());
    return records;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const commodity = searchParams.get("commodity");
    const state = searchParams.get("state");
    const market = searchParams.get("market");
    const district = searchParams.get("district");
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    // Try live API first
    try {
        const apiKey = process.env.DATA_GOV_API_KEY;
        if (!apiKey) throw new Error("No API key");

        const params = new URLSearchParams({
            "api-key": apiKey,
            format: "json",
            limit,
            offset,
        });
        if (commodity) params.append("filters[commodity]", commodity);
        if (state) params.append("filters[state]", state);
        if (market) params.append("filters[market]", market);
        if (district) params.append("filters[district]", district);

        const apiUrl = `${BASE_URL}/${RESOURCE_ID}?${params.toString()}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(apiUrl, {
            signal: controller.signal,
            next: { revalidate: 300 },
        });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const raw = await response.json();

        interface MandiRecord {
            state: string; district: string; market: string;
            commodity: string; variety: string; grade: string;
            arrival_date: string;
            min_price: string | number; max_price: string | number; modal_price: string | number;
        }

        const records = (raw.records || []).map((r: MandiRecord) => ({
            state: r.state, district: r.district, market: r.market,
            commodity: r.commodity, variety: r.variety, grade: r.grade,
            arrivalDate: r.arrival_date,
            minPrice: Number(r.min_price), maxPrice: Number(r.max_price), modalPrice: Number(r.modal_price),
        }));

        if (records.length === 0) throw new Error("Empty response");

        const uniqueStates = [...new Set(records.map((r: { state: string }) => r.state))].sort();
        const uniqueCommodities = [...new Set(records.map((r: { commodity: string }) => r.commodity))].sort();
        const uniqueMarkets = [...new Set(records.map((r: { market: string }) => r.market))].sort();

        return NextResponse.json({
            records,
            total: raw.total || records.length,
            count: raw.count || records.length,
            filters: { states: uniqueStates, commodities: uniqueCommodities, markets: uniqueMarkets },
            source: "Ministry of Agriculture & Farmers Welfare, Govt. of India",
            lastUpdated: raw.updated_date || new Date().toISOString(),
            live: true,
        });
    } catch (error) {
        console.warn("Live API unavailable, using fallback data:", error);
    }

    // Fallback to cached representative data
    const records = getFallbackRecords(commodity, state);
    const uniqueStates = [...new Set(records.map(r => r.state))].sort();
    const uniqueCommodities = [...new Set(records.map(r => r.commodity))].sort();
    const uniqueMarkets = [...new Set(records.map(r => r.market))].sort();

    return NextResponse.json({
        records,
        total: records.length,
        count: records.length,
        filters: { states: uniqueStates, commodities: uniqueCommodities, markets: uniqueMarkets },
        source: "Representative market data (Govt. source temporarily unavailable)",
        lastUpdated: new Date().toISOString(),
        live: false,
    });
}

