# متاجر زون — Mtajer Zone

منصة المتاجر الرقمية عبر واتساب | WhatsApp Commerce Platform

---

## Stack

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js v5 (Credentials + Google OAuth)
- **Storage**: Cloudinary (images)
- **Email**: Nodemailer (SMTP)
- **Styling**: Tailwind CSS
- **Deployment**: Hostinger VPS (Ubuntu + PM2 + Nginx)

---

## Quick Start (Development)

```bash
# 1. Clone and install
npm install

# 2. Environment
cp .env.example .env.local
# Fill in all required values

# 3. Database
npx prisma migrate dev --name init
npx prisma db seed

# 4. Run
npm run dev
```

---

## Production Deployment (Hostinger VPS)

### 1. Server setup

```bash
# PostgreSQL
bash scripts/setup-vps-db.sh

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# PM2
npm install -g pm2
```

### 2. Environment

```bash
cp .env.example .env.production
# Set all values — especially:
#   NEXT_PUBLIC_APP_URL=https://yourdomain.com
#   DATABASE_URL=postgresql://...
#   AUTH_SECRET=$(openssl rand -base64 32)
```

### 3. Build and migrate

```bash
npm install --production=false
npx prisma generate
npx prisma db push          # creates collections + indexes
npx prisma db seed          # first deploy only
npm run build
```

### 4. PM2

```bash
pm2 start npm --name "mtajer-zone" -- start
pm2 save
pm2 startup
```

### 5. Nginx config

```nginx
server {
    listen 80;
    server_name mtajerzone.com www.mtajerzone.com;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets — served by Next.js directly
    location /_next/static {
        proxy_pass         http://localhost:3000;
        proxy_cache_bypass $http_upgrade;
        expires            365d;
        add_header         Cache-Control "public, immutable";
    }
}
```

```bash
# SSL with Let's Encrypt
sudo certbot --nginx -d mtajerzone.com -d www.mtajerzone.com
```

---

## Environment Variables Reference

See `.env.example` for all required variables.

Critical for production:
- `NEXT_PUBLIC_APP_URL` — must be the real domain
- `AUTH_SECRET` — run `openssl rand -base64 32`
- `DATABASE_URL` — PostgreSQL connection string
- `ADMIN_WHATSAPP_NUMBER` — admin number for store approval flow

---

## Business Model

Mtajer Zone is a **WhatsApp commerce directory** — not a traditional e-commerce platform.

- Store owners apply → admin approves manually via WhatsApp
- Products are listed on the platform
- Customers browse and click "اطلب عبر واتساب"
- Order saved to DB + WhatsApp message opens → customer talks directly to store owner
- **No online payments. No subscriptions billed online. No checkout.**

---

## Phases Completed

| Phase | Description |
|-------|-------------|
| 1 | Foundation (Next.js, Prisma, Tailwind, types, validators) |
| 2 | Database schema (22 models, PostgreSQL) |
| 3 | Authentication (Auth.js v5, RBAC, middleware) |
| 4 | Frontend migration (10 HTML pages → Next.js components) |
| 5.1 | Cart system (guest + auth, DB-backed, coupon support) |
| 5.2 | Wishlist + Follow store |
| 5.3 | Reviews + Notifications + Customer profile |
| 6 | Store owner system (products, orders, settings) |
| 7 | Admin system (approve/reject stores, users, categories, reviews) |
| 8 | WhatsApp ordering (order saved to DB before WA opens) |
| 9 | SEO, sitemap, robots, structured data, performance |
