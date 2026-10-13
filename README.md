# Rupshi-Cosmetic (রূপসী - কসমেটিক শপ)

A full-stack e-commerce website for a Bangladeshi cosmetic shop, built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **MongoDB (Mongoose)**. All UI text is in Bengali with a pink (#db2777) theme.

## Features

- 🏠 Homepage with hero section & category cards
- 🛍️ Product shop page (responsive grid, BDT pricing)
- 🛒 Shopping cart (React Context + localStorage persistence, toast notifications)
- 💵 Checkout flow with order validation (server-side price verification)
- 🎉 Order success page with confetti animation
- 🔐 Admin panel (`/admin`) — product CRUD & order status management (demo password: `rupshi2024`)
- 🌐 MongoDB Atlas ready with connection caching for dev mode

## Tech Stack

| Layer     | Technology                           |
| --------- | ------------------------------------ |
| Framework | Next.js 14 (App Router)              |
| Styling   | Tailwind CSS                         |
| Database  | MongoDB + Mongoose                   |
| State     | React Context + localStorage         |
| Fonts     | Noto Sans Bengali (next/font/google) |

## Getting Started (Development)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template and fill in your MongoDB URI
cp .env.example .env.local

# 3. (Optional) Seed demo products into your database
node scripts/seed.mjs

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See [.env.example](./.env.example). Required variables:

| Variable               | Required | Description                                                 |
| ---------------------- | -------- | ----------------------------------------------------------- |
| `MONGODB_URI`          | ✅       | MongoDB connection string (local or Atlas)                  |
| `NEXT_PUBLIC_BASE_URL` | ❌       | Absolute base URL for server-side fetches (optional on Vercel) |

## Project Structure

```
src/
├── app/
│   ├── admin/            # Password-protected admin panel (products & orders)
│   ├── api/
│   │   ├── products/     # GET / POST / PUT / DELETE product endpoints
│   │   └── orders/       # POST/GET + [id] PATCH (status update)
│   ├── cart/             # Shopping cart page
│   ├── checkout/         # Checkout form
│   ├── order-success/    # Order confirmation
│   ├── shop/             # Product listing
│   ├── layout.js         # Root layout (font + CartProvider)
│   └── page.js           # Homepage
├── components/           # Navbar, Toast
├── context/              # CartContext (localStorage-backed)
├── lib/mongodb.js        # Cached Mongoose connection
└── models/               # Product, Order schemas
```

## Deployment to Vercel

The project is pre-configured for Vercel ([vercel.json](./vercel.json) sets the framework, build/install commands and output directory; Next.js App Router works out of the box — API routes deploy as serverless functions automatically).

### Steps

1. **Push the repository to GitHub/GitLab/Bitbucket**

   ```bash
   git add .
   git commit -m "Rupshi-Cosmetic v1"
   git push origin main
   ```

2. **Import the repo on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Choose your repository and click **Import**
   - Vercel auto-detects Next.js; confirm the defaults (build command `npm run build`, output `.next`)

3. **Add environment variables** (Settings → Environment Variables):
   - `MONGODB_URI` → your **MongoDB Atlas** connection string, e.g.
     `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/rupshi-cosmetic`
   - Add it for *Production*, *Preview* and *Development* environments

   > ⚠️ **MongoDB Atlas tips:**
   > - Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
   > - Under **Network Access**, allow `0.0.0.0/0` (Vercel's IPs are dynamic)
   > - Create a **database user** and copy its connection string into `MONGODB_URI`

4. **Deploy**
   - Click **Deploy** — Vercel builds and gives you a live URL like `rupshi-cosmetic.vercel.app`
   - Every subsequent `git push` triggers an automatic redeploy

   Or deploy via CLI:

   ```bash
   npm i -g vercel
   vercel --prod
   ```

5. **Seed products in production** (optional): run `node scripts/seed.mjs` locally with `MONGODB_URI` pointed at your Atlas cluster.

### Post-deployment checklist

- [ ] `/shop` loads products from Atlas
- [ ] Add to cart → checkout → order appears in `/admin` → অর্ডার ম্যানেজমেন্ট
- [ ] Admin login works (password `rupshi2024`)
- [ ] Replace the demo admin password check with real authentication before going fully public (this is a demo-phase client-side gate only)

## Admin Panel

Visit `/admin` and log in with the demo password: **`rupshi2024`**

- **প্রোডাক্ট ম্যানেজমেন্ট** — add / edit (modal) / delete (confirmation dialog) products
- **অর্ডার ম্যানেজমেন্ট** — view all orders, filter by status, change status (pending → processing → delivered)

> 🔒 Note: this is intentionally a simple client-side password gate for the demo phase. For production, replace it with proper authentication (e.g. NextAuth.js or middleware-based auth) and protect the API routes as well.

## License

MIT
