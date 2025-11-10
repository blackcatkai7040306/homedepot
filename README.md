# Next.js Sample Project

A modern Next.js application built with TypeScript and TailwindCSS, featuring a clean folder architecture.

## Features

- ⚡ Next.js 14 with App Router
- 📘 TypeScript for type safety
- 🎨 TailwindCSS for styling
- 🏗️ Modern folder architecture
- 🧩 Reusable UI components

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                    # App Router directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   ├── about/             # About page
│   └── contact/           # Contact page
├── components/            # React components
│   ├── ui/               # UI components
│   └── ContactForm.tsx   # Form component
├── lib/                   # Utility functions
│   └── utils.ts
├── types/                 # TypeScript types
│   └── index.ts
└── public/                # Static assets
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

