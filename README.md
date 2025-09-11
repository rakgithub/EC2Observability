EC2 Observability Prototype

A lightweight dashboard to visualize EC2 usage, costs, and inefficiencies – designed to help bioinformaticians and research teams make better infrastructure decisions without needing deep AWS knowledge.

Built with Next.js, Tailwind CSS, and Recharts.

🚀 Features
🔍 EC2 Instance Utilization

CPU, RAM, GPU, uptime, and cost/hr

Flags underutilized servers with color indicators

Sorting & filtering by region and instance type

💰 Cost Attribution Panel

Breaks down spend by region, instance type, and job (tag-based)

Toggle between table view and chart view (bar/pie)

Highlights anomalies (e.g., heavy spend concentrated in one region)

📈 Cloud Cost Overview

KPIs: Total cost, Daily burn, Projected monthly spend

Trend chart (7d) with anomaly markers and recommendations

Simple, scannable view to spot spikes or changes at a glance

⚡ Tech Stack

Next.js
 – React framework

Tailwind CSS
 – Utility-first styling

Recharts
 – Data visualization

AWS SDK
 (optional) – Live data integration

Mock data (/data/mock.json) – For development/demo mode

🔧 Setup
# Clone repo
git clone <your-repo-url>
cd ec2-observability

# Install dependencies
npm install

# Run locally
npm run dev


App will be available at: http://localhost:3000

📊 Data Sources

This prototype can run in two modes:

Mock Data (default)

Uses /data/mock.json for consistent demo behavior

Great for prototyping without AWS setup

AWS API Integration (optional)

Requires IAM role with read-only access to:

EC2

CloudWatch

Cost Explorer

To enable:

Add credentials in .env.local

Restart the dev server (npm run dev)

Example .env.local:

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1

✍️ Design Notes

Focused on quick, actionable insights instead of raw metrics.

Example: “Instance idle for 3 days → $50 wasted” is more valuable than just a CPU % chart.

Used mock data for speed and reliability during prototyping.

Future extension: add team/job-level attribution via AWS tags for finer accountability.

📸 Screenshots

(Add your screenshots of Utilization Table, Cost Attribution, and Cost Overview here)

✅ Deliverables

Working prototype (this repo)

Design write-up (separate doc)

Supports both mock and live AWS data
