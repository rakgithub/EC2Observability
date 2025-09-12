I will improve the README for better readability, a more modern feel, and ensure all key information is present. I'll use a clear structure with headings, modern emojis, and bolded text to make it scannable for the hiring manager.

-----

# EC2 Observability Prototype

## 🚀 Overview

This project is a prototype built for the Tracer take-home assessment. It's designed to help bioinformaticians and research teams gain visibility into their AWS infrastructure. The dashboard visualizes EC2 usage, costs, and potential waste in a clear, actionable way.

## ✨ Core Features

### EC2 Instance Utilization Table

  - **Metrics**: Displays key metrics like CPU, RAM, GPU, uptime, and **Cost/hr**.
  - **Insights**: Flags underutilized servers with color-coded indicators.
  - **Filtering**: Allows for sorting and filtering by region and instance type to quickly isolate relevant resources.

### Cost Attribution Panel

  - **Breakdown**: Visualizes spending broken down by region and instance type.
  - **Views**: Provides toggleable table and chart views for different perspectives.
  - **Anomalies**: Highlights heavy spending in specific regions or on particular instance types.

### Live Cloud Cost Overview

  - **Key Performance Indicators (KPIs)**: Shows total cost, daily burn rate, and a projected monthly spend.
  - **Trend Analysis**: Includes a 7-day trend chart with markers for cost anomalies.

## ⚙️ Tech Stack

  - **Next.js**: A modern React framework for building fast, scalable applications.
  - **Tailwind CSS**: A utility-first CSS framework for rapid and consistent styling.
  - **Recharts**: A composable charting library for building custom data visualizations.
  - **Data Source**: Configurable to use either mock data or the AWS API (SDK).

## 🚀 Getting Started

### Prerequisites

  - Node.js (v18+)
  - npm

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/rakgithub/ec2-observability
    cd ec2-observability
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000).

## 📊 Data Configuration

The prototype also has mock data for a consistent experience.

to access mock data -> config.js -> USE_MOCK_DATA = true

### Using Real AWS Data (Optional)

To use real data from your AWS account, follow these steps:

1.  Create an `.env.example` file in the project root.
2.  Copy it and rename it to .env.local
3.  Set your AWS credentials and region.
    ```env
    AWS_ACCESS_KEY_ID=your_access_key
    AWS_SECRET_ACCESS_KEY=your_secret_key
    AWS_REGION=your_aws_region
    ```
4.  Ensure the IAM role has read-only access to **EC2, CloudWatch, and Cost Explorer**.
5.  Restart the development server (`npm run dev`).
