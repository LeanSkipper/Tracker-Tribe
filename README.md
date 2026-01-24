# 💎 Lapis Platform - Tracker & Tribe (Beta MVP)

**Status:** Beta Release 🚀
**Live URL:** [https://www.tntlapis.com](https://www.tntlapis.com)

## Overview

Lapis Platform is an advanced accountability ecosystem designed to help high-performers structure their goals, join powerful tribes, and execute with relentless discipline. It combines OKR tracking, gamification, and peer accountability into a single platform.

## Key Features

### 🎯 Goal Tracking System (GPS)

- **OKRs & KPIs**: Structure your vision with Objectives, Key Results, and Key Performance Indicators.
- **Action Plans**: break down big goals into weekly actionable steps.
- **Real-Time Tracking**: Visualize progress with dynamic charts.

### 🤝 Tribe & Community

- **Create & Join Tribes**: Form accountability groups around shared missions.
- **Shared Goals**: Collaborate on collective objectives.
- **Peer Accountability**: View member stats and keep each other on track.

### 🏆 Gamification

- **XP & Levels**: Earn experience for consistent action and engagement.
- **Reputation Score**: Build trust within the community.
- **Badges**: Unlock achievements for milestones.

### 💰 Monetization (Grand Slam)

- **Creator Tools**: Launch paid tribes and monetize your leadership.
- **Subscription Management**: Integrated with Stripe for seamless payments.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Tech) + Prisma ORM
- **Auth**: NextAuth.js (Google, Credentials)
- **Styling**: Tailwind CSS
- **Payments**: Stripe

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/LeanSkipper/Tracker-Tribe.git
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file based on `.env.example` (ensure `DATABASE_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `STRIPE_SECRET_KEY` are set).

4. **Run Database Migrations**

   ```bash
   npx prisma db push
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

## Deployment

Deployed on **Vercel**. Setup requires configuring Environment Variables in the Vercel Dashboard, including `NEXTAUTH_URL` set to `https://www.tntlapis.com`.
