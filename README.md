
# 🚢 SeaSafe AI

SeaSafe AI is a smart maritime route intelligence and decision support platform built to help captains and shipping operators make safer navigation decisions. It combines live ship tracking, weather monitoring, interactive maps, route comparison, and AI-assisted route analysis into a single, easy-to-use dashboard.



# 📖 Overview

SeaSafe provides an interactive Bridge Console that allows users to monitor maritime traffic, visualize weather conditions, compare voyage routes, and receive intelligent route assessments.

Instead of switching between multiple tools, operators can access important navigation information from one dashboard, improving situational awareness and supporting better operational decisions.

---

# ✨ Features

- 🚢 **Live AIS Ship Tracking**
  - Displays nearby ships with real-time vessel information.
  - Shows vessel name, type, and position.

- 🗺️ **Interactive Maritime Map**
  - Explore shipping routes and surrounding maritime areas.
  - Smooth zooming and navigation.

- 🌦️ **Live Weather Visualization**
  - Displays weather conditions directly on the map.
  - Helps understand environmental impact on navigation.

- 📊 **Route Comparison**
  - Compare multiple navigation routes.
  - Review operational differences before selecting a route.

- 🤖 **AI Route Advisor**
  - Generates intelligent route assessments.
  - Assists operators in making informed decisions.

- 📄 **Decision Card**
  - Displays route recommendations.
  - Summarizes important operational information.

- ⚖️ **Compliance-Aware Design**
  - Supports operational awareness with route-related information.

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/utkarshStudio/TryHard-BuildWithBharat-SeaSafe.git
cd TryHard-BuildWithBharat-SeaSafe
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env.local` file.

```env
AISSTREAM_API_KEY=187c98c9012253605cf7edcff61c608ced99ec6a
```

## 4. Start the Development Server

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

## 5. Start Live AIS Tracking

```bash
npx tsx scripts/ais-collector-ws.mjs
```

Keep this process running to receive live ship updates.
