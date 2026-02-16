# 🌾 AgriMate — AI-Driven Decision Intelligence for Small Farmers

> **[🚀 Live Demo → agrimate-eight.vercel.app](https://agrimate-eight.vercel.app)**

AgriMate is a real-time **farm decision intelligence platform** that helps small-scale Indian farmers make data-driven decisions using AI, live weather, and market data.

![AgriMate Dashboard](https://agrimate-eight.vercel.app/og-image.png)

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI Decision Engine** | Real-time recommendations: when to apply fertilizer, optimal harvest timing, risk alerts |
| 🌦️ **Live Weather** | GPS-based hyperlocal weather forecasts integrated into decision-making |
| 📊 **Mandi Prices** | Live market prices from government data (data.gov.in) for Wheat, Rice, Mustard |
| 🤖 **AI Lab** | Interactive AI chat powered by Groq & NVIDIA for farm-specific queries |
| 🏦 **Vault** | Financial planning and farm expense tracking with premium UI |
| 🎨 **Premium UI** | Calm fintech dark theme, glassmorphic sidebar, animated transitions |

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS + Tailwind with custom design tokens
- **AI**: Groq (Llama) + NVIDIA NIM APIs
- **Data**: WeatherAPI, data.gov.in Mandi API
- **Deployment**: Vercel
- **Animations**: Framer Motion, CountUp, SVG sparklines

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/Shukla-Jiii/agrimate.git
cd agrimate

# Install
npm install

# Add your API keys
cp .env.example .env.local
# Edit .env.local with your keys

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Environment Variables

| Variable | Source |
|----------|--------|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `NVIDIA_API_KEY` | [build.nvidia.com](https://build.nvidia.com) |
| `WEATHER_API_KEY` | [weatherapi.com](https://weatherapi.com) |
| `DATA_GOV_API_KEY` | [data.gov.in](https://data.gov.in) |

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Dashboard with Decision Card
│   ├── market/           # Live Mandi prices
│   ├── ai-lab/           # AI Chat interface
│   ├── vault/            # Financial planning
│   └── api/              # Server routes (chat, weather, mandi)
├── components/
│   ├── features/         # Yield Optimizer Card
│   ├── layout/           # App Shell, Sidebar
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities & API helpers
├── stores/               # Zustand state management
└── types/                # TypeScript definitions
```

## 📄 License

MIT — Built with ❤️ for Indian farmers.
