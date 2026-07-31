# SeaSafe AI - Quick Guide

Welcome to **SeaSafe**! This is a smart maritime dashboard. It helps captains and operators choose the safest shipping routes by looking at weather, port traffic, and safety hazards.

---

## 🚀 How to Run the Project (Simple Steps)

### Step 1: Install Node.js Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

### Step 2: Add your API Key
Create a new file named `.env.local` in the project folder. Add your free key from [aisstream.io](https://aisstream.io/) like this:
```env
AISSTREAM_API_KEY=187c98c9012253605cf7edcff61c608ced99ec6a
```

### Step 3: Start the Map Website (Frontend)
Run this command to start the dashboard website:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to see it.

### Step 4: Start the Live Ship Tracker (Backend)
Open a second terminal window and run:
```bash
npx tsx scripts/ais-collector-ws.mjs
```
*Keep this running to see real ships moving on the map!*

---

## 🔍 What is Real Data vs. Simulated (Fake) Data?

To understand how the app works, here is a simple breakdown of the data shown:

### 🟢 Real Data (100% Live)
* **Other Ships on the Map**: The blue/cyan ship icons are **real ships** sailing in the ocean right now. The data comes live from satellite and radio receivers via a WebSocket stream.
* **Weather & Storms**: Live wave heights, wind corridors, and rain bands are fetched in real-time from the **Open-Meteo API** (all fake scenarios/cyclones have been disabled).
* **Map Styles & Satellite Images**: The map views (nautical charts, satellite photos, green/blue themes) use real global map servers.
* **AI Explanations**: The assessment text is written live by OpenAI's language model (ChatGPT).

### 🟡 Simulated Data (Scripts)
* **Our Main Ship & Route**: The main vessel and its alternative routes (the colored lines) are simulated voyage scenarios.
* **Port Congestion**: The queue wait times at ports are simulated to show how the system routes around busy harbors.

---

## 🌟 Main Features

1. **Live AIS Ship Radar**: Real-world ships are shown on the map at their actual coordinates. Hovering over a ship shows its real name, type, and IMO number.
2. **ECDIS Nautical Maps**: You can click the theme selector in the top-right header to switch to a classic yellow-and-cyan nautical chart view, a satellite photo view, or a custom green-and-blue map.
3. **AI Route Advisor**: Click "Assess Situation" to see the AI agent run calculations and explain the safest path to avoid bad weather or traffic.
