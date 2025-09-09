EC2 Observability Prototype
🚀 Overview

This prototype is part of the Tracer take-home assessment.
It visualises EC2 usage, costs, and waste in a simple dashboard built with Next.js + Tailwind + Recharts.

The goal: help bioinformaticians and research teams make smarter infrastructure decisions without needing deep AWS knowledge.

📦 Features

EC2 Instance Utilisation Table

CPU, RAM, GPU, uptime, cost/hr

Flags underutilised servers with color indicators

Sorting & filtering by region and instance type

Cost Attribution Panel

Breaks down spend by region & instance type

Toggleable table and chart view

Highlights anomalies (e.g., heavy spend in one region)

Live Cloud Cost Overview

KPIs: total cost, daily burn, projected monthly spend

Trend chart (7d) with anomaly markers

⚡ Tech Stack

Next.js
 – React framework

Tailwind CSS
 – Styling

Recharts
 – Charts & graphs

[Mock Data / AWS SDK] – Data source (depending on config)

🔧 Setup
# Clone repo
git clone <your-repo-url>
cd ec2-observability

# Install dependencies
npm install

# Run locally
npm run dev


App will be available at http://localhost:3000.

📊 Data Source

This prototype works with either:

Mock data (default) – included in /data/mock.json.

AWS API integration (optional) – requires IAM role with read-only access to EC2, CloudWatch, and Cost Explorer.

To use AWS data:

Set credentials in .env.local

Run npm run dev

✍️ Notes on Design

Assumption: Users want quick, actionable insights (e.g., “Instance idle for 3 days → $50 wasted”) instead of raw metrics.

Tradeoff: Used mock data for consistency and speed instead of full AWS integration.

Not Implemented: Team/job-level attribution (would extend cost breakdown with metadata tags).

📸 Screenshots

(Add screenshots of the 3 main components here)

✅ Deliverables

Working prototype (this repo)

Short write-up with design decisions (sent separately)