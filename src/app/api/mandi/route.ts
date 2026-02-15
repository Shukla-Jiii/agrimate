import { NextResponse } from "next/server";

/**
 * Government Mandi Prices API
 * Source: data.gov.in — Ministry of Agriculture
 * Resource: Current Daily Price of Various Commodities from Various Markets (Mandi)
 */

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE_URL = "https://api.data.gov.in/resource";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const commodity = searchParams.get("commodity");
        const state = searchParams.get("state");
        const market = searchParams.get("market");
        const district = searchParams.get("district");
        const limit = searchParams.get("limit") || "50";
        const offset = searchParams.get("offset") || "0";

        const apiKey = process.env.DATA_GOV_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Mandi API key not configured." },
                { status: 500 }
            );
        }

        // Build URL with filters
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

        const response = await fetch(apiUrl, {
            next: { revalidate: 300 }, // Cache 5 min
        });

        if (!response.ok) {
            throw new Error(`data.gov.in API error: ${response.status}`);
        }

        const raw = await response.json();

        // Transform records to clean format
        interface MandiRecord {
            state: string;
            district: string;
            market: string;
            commodity: string;
            variety: string;
            grade: string;
            arrival_date: string;
            min_price: string | number;
            max_price: string | number;
            modal_price: string | number;
        }

        const records = (raw.records || []).map((r: MandiRecord) => ({
            state: r.state,
            district: r.district,
            market: r.market,
            commodity: r.commodity,
            variety: r.variety,
            grade: r.grade,
            arrivalDate: r.arrival_date,
            minPrice: Number(r.min_price),
            maxPrice: Number(r.max_price),
            modalPrice: Number(r.modal_price),
        }));

        // Extract unique filter options from data
        const uniqueStates = [...new Set(records.map((r: { state: string }) => r.state))].sort();
        const uniqueCommodities = [...new Set(records.map((r: { commodity: string }) => r.commodity))].sort();
        const uniqueMarkets = [...new Set(records.map((r: { market: string }) => r.market))].sort();

        return NextResponse.json({
            records,
            total: raw.total || records.length,
            count: raw.count || records.length,
            filters: {
                states: uniqueStates,
                commodities: uniqueCommodities,
                markets: uniqueMarkets,
            },
            source: "Ministry of Agriculture & Farmers Welfare, Govt. of India",
            lastUpdated: raw.updated_date || new Date().toISOString(),
        });
    } catch (error) {
        console.error("Mandi API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch mandi prices." },
            { status: 500 }
        );
    }
}
