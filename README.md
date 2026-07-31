# 🚢 SeaSafe AI

<div align="center">

### Smart Maritime Route Intelligence & Compliance Copilot

SeaSafe AI is an intelligent maritime dashboard that helps captains and shipping operators make safer navigation decisions using **live AIS ship tracking**, **weather visualization**, **interactive maps**, **route comparison**, and **AI-assisted operational insights**.

🌐 **Live Demo:** https://flourishing-kulfi-d7ae9e.netlify.app/

📂 **GitHub Repository:** https://github.com/utkarshStudio/TryHard-BuildWithBharat-SeaSafe

Built for **Build With Bharat National Hackathon**

</div>

---

# 📖 Overview

SeaSafe AI is a modern maritime decision support platform designed to improve operational awareness during voyage planning.

Shipping companies and vessel operators constantly deal with changing weather conditions, heavy vessel traffic, port congestion, and navigational hazards. Information is often spread across multiple systems, making route planning time-consuming and difficult.

SeaSafe combines these services into one unified dashboard where users can visualize maritime traffic, monitor weather conditions, compare voyage routes, and receive AI-assisted route assessments.

The project demonstrates how modern web technologies and real-time maritime data can simplify operational decision-making.

---

# ❓ Problem Statement

More than **95% of India's international trade** is transported by sea.

Every day ships travel through congested waterways, changing weather systems, and operational bottlenecks. Captains frequently switch between multiple platforms to gather information before making navigation decisions.

Current workflow typically involves:

- Vessel tracking websites
- Weather portals
- Navigation charts
- Email reports
- Manual route analysis

This fragmented workflow increases decision-making time.

SeaSafe addresses this challenge by bringing route intelligence, weather visualization, vessel tracking, and AI-generated insights together in one dashboard.

---

# 💡 Our Solution

SeaSafe provides a single intelligent bridge console where maritime operators can:

- Monitor nearby vessels
- Visualize live weather
- Compare navigation routes
- Analyze operational risks
- Receive AI-assisted assessments
- Make informed routing decisions

Everything is available through one interactive dashboard.

---

# ✨ Features

## 🚢 Live AIS Ship Tracking

SeaSafe displays real ships using live AIS data streamed through WebSockets.

Features include:

- Real-time ship locations
- Vessel names
- Ship types
- IMO numbers
- Continuous position updates

---

## 🗺 Interactive Maritime Map

The application provides a fully interactive map where users can:

- Zoom and pan
- Inspect ships
- Explore navigation routes
- View operational information
- Monitor surrounding traffic

---

## 🌍 Multiple Map Themes

Users can switch between different map styles including:

- Nautical Chart
- Satellite View
- Green Theme
- Blue Theme

These themes improve visualization for different operational scenarios.

---

## 🌦 Live Weather Visualization

Weather information is integrated directly into the dashboard.

Current overlays include:

- Wind
- Rain
- Weather systems
- Wave conditions

This allows operators to identify potentially hazardous weather before selecting a route.

---

## 🤖 AI Route Advisor

SeaSafe includes an AI-powered assessment engine.

When users click **Assess Situation**, the AI analyzes available information and generates an operational explanation describing:

- Current navigation conditions
- Weather impact
- Route observations
- Operational recommendations

---

## 📊 Route Comparison

The dashboard compares multiple voyage routes, allowing users to evaluate different navigation options before making a decision.

---

## 📄 Decision Card

After analysis, SeaSafe displays a decision card summarizing important operational information in a clear and concise format.

---

## ⚖ Compliance Awareness

The dashboard is designed to support compliance-aware route planning by displaying relevant operational information alongside navigation recommendations.

---

# 📡 Real Data vs Simulated Data

## ✅ Real Data

The following information is fetched from live services.

### 🚢 AIS Ship Tracking

Nearby vessels are real ships sailing on the ocean.

**Source:** AISStream WebSocket

---

### 🌦 Weather

Weather information is fetched from:

- Open-Meteo API

Including:

- Wind
- Rain
- Weather conditions

---

### 🗺 Maps

Map styles and satellite imagery are provided using real online map services.

---

### 🤖 AI Assessment

Operational assessment text is generated live using OpenAI's language model.

---

## 🟡 Simulated Data

The following data is intentionally simulated for demonstration purposes.

- Main vessel
- Route scenarios
- Alternative routes
- Port congestion

This allows the dashboard to demonstrate routing intelligence without requiring commercial maritime systems.

---

# 🏗 System Architecture

```
User

   │

   ▼

SeaSafe Dashboard

   │

   ├────────► AISStream WebSocket

   ├────────► Open-Meteo API

   ├────────► OpenAI

   ▼

Interactive Dashboard

   ▼

Decision Support
```

---

# 🛠 Technology Stack

| Category | Technologies |
|----------|--------------|
| Frontend | Next.js 16 |
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Maps | MapLibre GL |
| Visualization | deck.gl |
| AIS Tracking | AISStream |
| Weather | Open-Meteo API |
| AI | OpenAI |
| State Management | Zustand |

---

# 📁 Project Structure

```
SeaSafe/
│
├── app/                 # Application routes & API
├── components/          # UI components
├── lib/                 # Business logic & utilities
├── scripts/             # AIS collector
├── public/              # Static assets
├── styles/              # Styling
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/utkarshStudio/TryHard-BuildWithBharat-SeaSafe.git
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a file named `.env.local`

```env
AISSTREAM_API_KEY=187c98c9012253605cf7edcff61c608ced99ec6a
```

---

## 4. Start Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 5. Start AIS Stream

Open another terminal and run:

```bash
npx tsx scripts/ais-collector-ws.mjs
```

Keep this process running to display live ship positions.

---

# 🔄 Workflow

1. Start the application.
2. Connect to the AIS stream.
3. Load live weather information.
4. Display nearby vessels.
5. Select a navigation scenario.
6. Generate an AI assessment.
7. Review the Decision Card.
8. Compare available routes.

---

# 🎯 Use Cases

- Maritime navigation
- Voyage planning
- Route comparison
- Weather-aware navigation
- Ship traffic monitoring
- Maritime education
- Hackathon demonstrations

---

# 🔮 Future Improvements

- Global route planning
- Port congestion prediction
- Cyclone forecasting
- Fuel optimization
- Carbon emission analysis
- Multi-vessel fleet management
- Satellite weather integration
- Mobile application

---

# 👥 Team

**Team TryHard**

- Utkarsh Gupta
- Vaibhav Chaturvedi
- Utkarsh Keshari
- Anshu Kumar
- Umang Singh

**ABES Engineering College, Ghaziabad**

---

# 🌐 Links

**Live Demo**

https://flourishing-kulfi-d7ae9e.netlify.app/

**GitHub Repository**

https://github.com/utkarshStudio/TryHard-BuildWithBharat-SeaSafe

---

# 📜 License

This project was developed as part of the **Build With Bharat National Hackathon** for educational and demonstration purposes.

---

<div align="center">

### ⭐ If you like this project, consider giving it a Star on GitHub!

Built with ❤️ by **Team TryHard**

</div>
