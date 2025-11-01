# 🏠 Home Depot Clearance Deals

A modern web application that aggregates clearance and discounted product data from Home Depot stores nationwide, allowing users to browse deals, filter ultra-low-price items, and scan barcodes to check real-time local prices.

## 🚀 Features

- **🔥 Deal Aggregation**: Browse clearance items from Home Depot stores nationwide
- **💰 Ultra-Low Price Filter**: Find items priced at $0.10 and below
- **📱 Barcode Scanner**: Scan products to verify local in-store pricing
- **📍 Location Awareness**: Get deals relevant to your local area
- **🎯 Smart Filtering**: Search by category, price, and discount percentage
- **💾 Price History**: Track scanned prices across different store locations
- **📊 Real-time Stats**: View deal counts, savings, and availability

## 📋 Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Prisma](https://prisma.io/) with PostgreSQL
- **Icons**: [Lucide React](https://lucide.dev/)
- **Barcode Scanning**: Camera API with barcode detection
- **Geolocation**: Browser Geolocation API

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── products/      # Product data endpoints
│   │   ├── scanned-products/ # Barcode scan data
│   │   ├── stores/        # Store location APIs
│   │   └── geocoding/     # Location services
│   ├── globals.css        # Global styles with theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main deals dashboard
├── components/            # React components
│   ├── deals/             # Deal listing and filtering
│   ├── scanner/           # Barcode scanner component
│   ├── location/          # Geolocation features
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
│   ├── use-geolocation.ts # Location detection
│   ├── use-debounce.ts   # Search optimization
│   └── use-local-storage.ts # Data persistence
├── lib/                   # Utility functions
├── types/                 # TypeScript definitions
├── prisma/               # Database schema
└── scripts/              # Data scraping scripts
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (optional for MVP - uses mock data)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd homedepot-clearance-deals
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your database connection and API keys:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/homedepot_deals"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database (optional)**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push database schema
   npm run db:push

   # View database (optional)
   npm run db:studio
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🔍 Data Scraping (Optional)

Run the scraping script to collect sample data:

```bash
npm run scrape
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run scrape` - Run Home Depot scraper

## 🎯 Key Features Explained

### 🔥 Deal Aggregation

- Browse clearance items from Home Depot stores nationwide
- Real-time pricing updates and availability
- Category-based filtering (Tools, Garden, Hardware, etc.)
- Search functionality across product titles and descriptions

### 💰 Ultra-Low Price Zone

- Dedicated tab for items priced at $0.10 and below
- Special highlighting for "penny deals" ($0.01 items)
- Statistics showing total potential savings
- Warning notices about rapid price changes

### 📱 Barcode Scanner

- Camera-based barcode scanning using device camera
- Manual price entry fallback option
- Local price verification and storage
- Product matching with UPC codes
- Geolocation-based store assignment

### 📍 Location Features

- Automatic location detection using browser GPS
- Nearest store finder with distance calculation
- Location-specific pricing when available
- ZIP code-based deal filtering
- Store-specific inventory tracking

### 🎨 UI Components

Built with a comprehensive design system:

- **Product Cards** - eBay-style product listings with images, pricing, and actions
- **Scanner Modal** - Full-screen barcode scanner with camera access
- **Filter Tabs** - Clean tabbed interface for deal categories
- **Location Header** - Smart location display with status indicators
- **Stats Cards** - Overview statistics with trend indicators

## 🔧 Customization

### Tailwind Configuration

Customize the design system by editing `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: 'hsl(var(--primary))',
      // Add your custom colors
    },
  },
},
```

### CSS Variables

Modify the color scheme in `src/app/globals.css`:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96%;
  /* Add your custom variables */
}
```

## 📊 Data Sources & APIs

### Current Implementation

- **Mock Data**: Sample clearance products for demonstration
- **Simulated Scraping**: Demo scraper with realistic product data
- **Location Services**: Browser geolocation with geocoding simulation

### Production Considerations

- **Home Depot API**: Use official APIs when available
- **Web Scraping**: Implement respectful scraping with rate limiting
- **Database**: PostgreSQL with Prisma for scalable data storage
- **Caching**: Redis for fast product lookup and pricing

## ⚖️ Legal & Compliance

⚠️ **Important Notice**: This is a prototype for educational purposes.

- Always respect robots.txt and terms of service
- Consider using official APIs before web scraping
- Implement proper rate limiting and respectful crawling
- Ensure compliance with local laws regarding price aggregation

## 📚 Learning Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Prisma Database Toolkit](https://www.prisma.io/docs)
- [Tailwind CSS Framework](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Web APIs (Camera, Geolocation)](https://developer.mozilla.org/en-US/docs/Web/API)

## 🚀 Future Enhancements

- **Mobile App**: React Native version for iOS/Android
- **User Accounts**: Save favorites, price alerts, and scanning history
- **Push Notifications**: Price drop alerts and new deal notifications
- **Store Integration**: Direct integration with multiple retailers
- **AI Features**: Smart deal recommendations and price predictions
- **Social Features**: Deal sharing and community verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/barcode-improvements`)
3. Commit your changes (`git commit -m 'Improve barcode scanning accuracy'`)
4. Push to the branch (`git push origin feature/barcode-improvements`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

If you have questions or need help:

- Open an issue in the repository
- Check existing issues for common problems
- Review the documentation in the `/docs` folder

---

🏠 Built for deal hunters and bargain enthusiasts using Next.js, TypeScript, and modern web technologies.
