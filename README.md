# 🚢 SeaSafe AI

<div align="center">

# Smart Maritime Route Intelligence & Compliance Copilot

**SeaSafe AI** is an intelligent maritime decision support platform that helps captains and shipping operators make safer, smarter, and faster navigation decisions.

It combines **live AIS ship tracking**, **interactive maritime maps**, **weather visualization**, **AI-assisted route analysis**, and **route comparison** into a single Bridge Console designed for modern maritime operations.

[🌐 Live Demo](https://flourishing-kulfi-d7ae9e.netlify.app/) •
[📂 GitHub Repository](https://github.com/utkarshStudio/TryHard-BuildWithBharat-SeaSafe)

Built for **Build With Bharat National Hackathon**

</div>

---

# 📑 Table of Contents

- Overview
- Problem Statement
- Our Solution
- Key Features
- System Architecture
- Real vs Simulated Data
- Technology Stack
- Project Structure
- Installation
- Environment Variables
- Running the Project
- Workflow
- Future Scope
- Team
- License

---

# 📖 Overview

SeaSafe AI is a modern maritime route intelligence platform that provides captains and shipping operators with a unified dashboard for navigation awareness and route planning.

Instead of relying on multiple disconnected systems, SeaSafe centralizes operational information into a single interface where users can monitor vessel traffic, inspect weather conditions, compare navigation routes, and receive AI-assisted operational recommendations.

The dashboard is designed to improve situational awareness, simplify operational decision-making, and demonstrate how modern web technologies can enhance maritime safety.

SeaSafe combines interactive visualization with intelligent route analysis, making maritime information easier to understand and act upon.

---

# ❓ Problem Statement

Maritime transportation carries more than **95% of India's international trade**, making shipping one of the country's most critical industries.

Every voyage is affected by multiple dynamic factors including:

- Heavy vessel traffic
- Changing weather conditions
- Port congestion
- Navigation hazards
- Maritime chokepoints
- Operational risks

Today, bridge officers and operators often depend on several independent platforms to gather this information.

Typical workflow includes switching between:

- Vessel tracking websites
- Weather forecasting platforms
- Navigation charts
- Email advisories
- PDF reports
- Manual route planning tools

This fragmented process increases operational complexity and slows down decision-making during critical situations.

---

# 💡 Our Solution

SeaSafe AI solves this problem by bringing multiple maritime services into a single intelligent dashboard.

The platform enables operators to:

- Monitor nearby vessels in real time
- View live maritime weather conditions
- Compare multiple navigation routes
- Analyze operational risks
- Receive AI-assisted route assessments
- Improve overall voyage awareness

Instead of switching between multiple applications, operators can access all essential navigation information from one Bridge Console.

---

# 🌟 Why SeaSafe?

SeaSafe focuses on providing an intuitive and intelligent maritime experience.

Unlike traditional systems that separate navigation, weather, and traffic information, SeaSafe integrates them into one interactive workspace.

The platform is designed to provide:

- Better situational awareness
- Faster operational decisions
- Improved route understanding
- Interactive visualization
- Modern user experience
- AI-assisted operational guidance

This makes SeaSafe an effective demonstration of how intelligent software can support safer maritime navigation.

---

# ✨ Key Features

## 🚢 Live AIS Ship Tracking

SeaSafe displays live vessel positions received through the AISStream WebSocket service.

Operators can monitor nearby ships in real time while viewing detailed vessel information such as:

- Ship Name
- MMSI
- IMO Number
- Vessel Type
- Live Position
- Heading
- Speed

The map updates continuously as new AIS messages arrive.

---

## 🗺 Interactive Maritime Map

The dashboard is centered around a fully interactive maritime map built using MapLibre GL.

Users can:

- Zoom
- Pan
- Inspect vessels
- Explore routes
- Monitor surrounding traffic
- Navigate across different regions

The map serves as the primary operational interface of the application.

---

## 🌍 Multiple Map Themes

SeaSafe provides multiple visualization styles to improve readability under different scenarios.

Available themes include:

- Nautical Chart
- Satellite View
- Green Theme
- Blue Theme

Users can instantly switch between themes without interrupting the navigation experience.

---

## 🌦 Live Weather Visualization

SeaSafe integrates live weather information directly into the maritime map.

Weather visualization includes:

- Wind conditions
- Rain information
- Weather overlays
- Environmental conditions

## 🤖 AI Route Advisor

SeaSafe includes an intelligent AI Orchestrator that assists operators in evaluating maritime situations and understanding route conditions.

When the **Assess Situation** button is clicked, the AI processes the selected voyage scenario together with available route, weather, and operational information to generate a clear assessment.

The AI provides:

- Route assessment
- Operational observations
- Weather impact analysis
- Navigation recommendations
- Decision support summary

The AI is powered by **Local Llama 3.2 running through Ollama**, allowing inference to run locally without relying on cloud-based AI services.

---

## 📊 Route Comparison

SeaSafe allows operators to compare multiple navigation routes before making operational decisions.

Each available route can be evaluated using important voyage parameters, helping users understand the trade-offs between different navigation options.

The comparison interface provides information such as:

- Estimated route distance
- Estimated travel time
- Fuel consumption estimate
- Route safety considerations
- Operational observations

This enables users to make informed navigation decisions based on available information.

---

## 📄 Decision Card

After route analysis, SeaSafe generates a Decision Card that summarizes the overall voyage assessment.

The Decision Card acts as a quick operational briefing by presenting important route information in an easy-to-read format.

Typical information includes:

- Recommended route
- Operational assessment
- AI-generated reasoning
- Weather observations
- Route comparison summary
- Navigation advice

This helps operators quickly understand the current situation without reviewing multiple data sources.

---

## ⚖ Compliance Awareness

SeaSafe is designed with compliance-aware route planning in mind.

The system is capable of presenting relevant operational and regulatory information alongside route analysis to encourage safer maritime decision-making.

Compliance support helps demonstrate how operational intelligence and maritime regulations can work together within a single dashboard.

---

# 📡 Real Data vs Simulated Data

SeaSafe combines live maritime information with simulated voyage scenarios to create an interactive demonstration platform.

## ✅ Live Data

### 🚢 AIS Ship Tracking

Nearby vessels displayed on the map are real ships.

The application receives vessel positions through the AISStream WebSocket service, allowing continuous updates of ship locations.

Live vessel information includes:

- Ship Name
- MMSI
- IMO Number
- Vessel Type
- Current Position
- Heading

---

### 🌦 Live Weather

Weather information is fetched in real time using the Open-Meteo API.

Available weather information includes:

- Wind
- Rain
- Weather conditions
- Environmental overlays

This allows users to evaluate weather conditions alongside vessel traffic.

---

### 🗺 Map Services

SeaSafe uses real online map services to provide high-quality visualization.

Available map styles include:

- Nautical charts
- Satellite imagery
- Custom maritime themes

---

## 🟡 Simulated Data

Some components are intentionally simulated for demonstration purposes.

These include:

- Primary vessel
- Voyage scenarios
- Alternative routes
- Port congestion
- Route comparison values

Using simulated voyage scenarios allows users to test the complete workflow without requiring access to commercial maritime systems.

---

# 🏗 System Architecture

```
                 User

                   │

                   ▼

        SeaSafe Bridge Console

        ├─────────────────────────────┐
        │                             │
        ▼                             ▼

 AISStream WebSocket          Open-Meteo API

        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼

            AI Orchestrator
       (Local Llama 3.2 via Ollama)

                       │

                       ▼

             Route Analysis Engine

                       │

                       ▼

               Decision Card UI
```

The dashboard integrates multiple data sources into a single workflow where live vessel information, weather conditions, and simulated voyage data are analyzed before presenting route recommendations to the user.

---

# 🛠 Technology Stack

| Category | Technology |
|-----------|------------|
| Frontend | Next.js 16 |
| UI Library | React 19 |
| Programming Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Mapping | MapLibre GL |
| Visualization | deck.gl |
| AIS Data | AISStream WebSocket |
| Weather | Open-Meteo API |
| AI | Local Llama 3.2 (Ollama) |
| State Management | Zustand |
| Routing Engine | searoute-js |

---

# 📂 Project Structure

```
SeaSafe/
│
├── app/                    # Next.js App Router
├── components/             # Reusable UI components
├── lib/                    # AI, routing, weather and utilities
├── scripts/                # AIS WebSocket collector
├── public/                 # Static assets
├── styles/                 # Global styling
├── package.json
├── next.config.ts
└── README.md
```

The project follows a modular architecture, making it easier to maintain, extend, and integrate additional maritime services in the future.

---

This allows operators to understand weather impact while planning navigation routes.

---

# 🚀 Getting Started

Follow the steps below to set up and run SeaSafe AI on your local machine.

## Prerequisites

Before starting, ensure the following software is installed on your system.

- Node.js (Latest LTS Version)
- npm
- Git
- Ollama
- Modern Web Browser (Chrome, Edge, Firefox)

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/utkarshStudio/TryHard-BuildWithBharat-SeaSafe.git
cd TryHard-BuildWithBharat-SeaSafe
```

---

## 2️⃣ Install Dependencies

Install all required packages.

```bash
npm install
```

---

## 3️⃣ Configure Environment Variables

Create a file named **.env.local**

```env
AISSTREAM_API_KEY=YOUR_AISSTREAM_API_KEY
```

Replace the placeholder with your own AISStream API key.

---

## 4️⃣ Install Ollama

Download Ollama from

https://ollama.com/

After installation, pull the required model.

```bash
ollama pull llama3.2
```

Start Ollama locally.

```bash
ollama serve
```

SeaSafe communicates with the local Ollama server running on:

```
http://localhost:11434
```

---

## 5️⃣ Start the Development Server

```bash
npm run dev
```

Open your browser and visit

```
http://localhost:3000
```

---

## 6️⃣ Start Live AIS Streaming

Open another terminal window.

Run:

```bash
npx tsx scripts/ais-collector-ws.mjs
```

Keep this process running to receive live vessel updates.

---

# ▶ How SeaSafe Works

The application follows a simple operational workflow.

### Step 1

The dashboard loads and initializes the maritime map.

↓

### Step 2

Live AIS data begins streaming nearby vessel positions.

↓

### Step 3

Weather layers are fetched from Open-Meteo.

↓

### Step 4

The operator selects or explores a voyage scenario.

↓

### Step 5

The AI Orchestrator processes the available information.

↓

### Step 6

SeaSafe compares available navigation routes.

↓

### Step 7

A Decision Card is generated containing operational recommendations.

↓

### Step 8

The operator reviews the information and selects the preferred navigation strategy.

---

# 🎯 Use Cases

SeaSafe can be used for a variety of maritime applications including:

- Maritime route planning
- Voyage risk assessment
- Operational awareness
- Navigation demonstrations
- Maritime education
- Research projects
- Smart shipping solutions
- Hackathon demonstrations
- AI-assisted navigation research

---

# 🔮 Future Improvements

SeaSafe has been designed with extensibility in mind.

Possible future enhancements include:

- Live global route optimization
- Real-time cyclone prediction
- Fuel consumption optimization
- Carbon emission estimation
- Fleet management dashboard
- Port congestion prediction
- Satellite weather integration
- Automatic rerouting
- Emergency alert system
- Mobile application
- Offline map caching
- Historical voyage analytics

---

# 👨‍💻 Team

## Team TryHard

- **Utkarsh Gupta**
- **Vaibhav Chaturvedi**
- **Utkarsh Keshari**
- **Anshu Kumar**
- **Umang Singh**

**College**

ABES Engineering College, Ghaziabad

**Hackathon**

Build With Bharat National Hackathon

---

# 🌐 Project Links

## 🚀 Live Demo

https://flourishing-kulfi-d7ae9e.netlify.app/

---

## 💻 GitHub Repository

https://github.com/utkarshStudio/TryHard-BuildWithBharat-SeaSafe

---

# 🤝 Contributing

Contributions are welcome.

If you would like to improve SeaSafe, you can:

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

Please ensure that your code follows the existing project structure and coding standards.

---

# 📜 License

This project was developed as part of the **Build With Bharat National Hackathon** for educational, research, and demonstration purposes.

---

# 🙏 Acknowledgements

Special thanks to:

- Build With Bharat
- Microsoft
- ABES Engineering College
- AISStream
- Open-Meteo
- MapLibre GL
- deck.gl
- Ollama
- Meta Llama 3.2
- Next.js
- React
- Tailwind CSS
- The Open Source Community

---

<div align="center">

## ⭐ If you found this project interesting, don't forget to Star the repository!

Made with ❤️ by **Team TryHard**

</div>
