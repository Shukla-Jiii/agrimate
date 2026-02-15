import { NextResponse } from "next/server";

/**
 * Weather API using WeatherAPI.com
 * Supports: lat,lon | city name | pin code
 * Default: auto:ip (auto-detect from server IP)
 */

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const lat = searchParams.get("lat");
        const lon = searchParams.get("lon");
        const city = searchParams.get("city");

        // Build query: prefer lat/lon, then city, then default to New Delhi
        let query = "New Delhi";
        if (lat && lon) {
            query = `${lat},${lon}`;
        } else if (city) {
            query = city;
        }

        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Weather API key not configured." },
                { status: 500 }
            );
        }

        const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=5&aqi=no&alerts=yes`;

        const response = await fetch(apiUrl, {
            next: { revalidate: 600 }, // Cache 10 min
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("WeatherAPI Error:", response.status, errData);
            throw new Error(`WeatherAPI error: ${response.status}`);
        }

        const raw = await response.json();

        // Transform to clean format
        const weather = {
            location: {
                name: raw.location.name,
                region: raw.location.region,
                country: raw.location.country,
                lat: raw.location.lat,
                lon: raw.location.lon,
                localtime: raw.location.localtime,
            },
            current: {
                temperature: raw.current.temp_c,
                feelsLike: raw.current.feelslike_c,
                humidity: raw.current.humidity,
                windSpeed: raw.current.wind_kph,
                windDir: raw.current.wind_dir,
                pressure: raw.current.pressure_mb,
                uv: raw.current.uv,
                cloud: raw.current.cloud,
                condition: {
                    text: raw.current.condition.text,
                    icon: `https:${raw.current.condition.icon}`,
                    code: raw.current.condition.code,
                },
                isDay: raw.current.is_day === 1,
            },
            forecast: raw.forecast.forecastday.map((day: {
                date: string;
                day: {
                    maxtemp_c: number;
                    mintemp_c: number;
                    avgtemp_c: number;
                    maxwind_kph: number;
                    totalprecip_mm: number;
                    avghumidity: number;
                    daily_chance_of_rain: number;
                    condition: { text: string; icon: string; code: number };
                    uv: number;
                };
                astro: {
                    sunrise: string;
                    sunset: string;
                    moon_phase: string;
                };
                hour: {
                    time: string;
                    temp_c: number;
                    condition: { text: string; icon: string; code: number };
                    chance_of_rain: number;
                    humidity: number;
                    wind_kph: number;
                    feelslike_c: number;
                }[];
            }) => ({
                date: day.date,
                maxTemp: day.day.maxtemp_c,
                minTemp: day.day.mintemp_c,
                avgTemp: day.day.avgtemp_c,
                maxWind: day.day.maxwind_kph,
                totalPrecip: day.day.totalprecip_mm,
                avgHumidity: day.day.avghumidity,
                rainChance: day.day.daily_chance_of_rain,
                condition: {
                    text: day.day.condition.text,
                    icon: `https:${day.day.condition.icon}`,
                    code: day.day.condition.code,
                },
                uv: day.day.uv,
                astro: {
                    sunrise: day.astro.sunrise,
                    sunset: day.astro.sunset,
                    moonPhase: day.astro.moon_phase,
                },
                hourly: day.hour.map((h: {
                    time: string;
                    temp_c: number;
                    condition: { text: string; icon: string; code: number };
                    chance_of_rain: number;
                    humidity: number;
                    wind_kph: number;
                    feelslike_c: number;
                }) => ({
                    time: h.time,
                    temp: h.temp_c,
                    condition: {
                        text: h.condition.text,
                        icon: `https:${h.condition.icon}`,
                    },
                    rainChance: h.chance_of_rain,
                    humidity: h.humidity,
                    wind: h.wind_kph,
                    feelsLike: h.feelslike_c,
                })),
            })),
            lastUpdated: new Date().toISOString(),
        };

        return NextResponse.json(weather);
    } catch (error) {
        console.error("Weather API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch weather data." },
            { status: 500 }
        );
    }
}
