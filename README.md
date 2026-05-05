# Ready2Cook

Production-ready Next.js 14 e-commerce platform for `ready2cook.co.uk`.

## Local Setup

1. Copy `.env.example` to `.env` and fill all values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run Prisma:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run db:seed
   ```
4. Start development:
   ```bash
   npm run dev
   ```

## Required GitHub Secrets For Deployment

Add all values in GitHub: Settings -> Secrets -> Actions.

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Domain Cutover Checklist (`ready2cook.co.uk`)

- Set `A` record for `ready2cook.co.uk` to VPS public IP.
- Set `A` record for `www.ready2cook.co.uk` to VPS public IP (or CNAME to apex).
- Configure Nginx for both domains with HTTP -> HTTPS redirect.
- Issue SSL certs via Certbot for apex + `www`.
- Set `NEXTAUTH_URL=https://ready2cook.co.uk`.
- Set Stripe webhook endpoint to `https://ready2cook.co.uk/api/webhooks/stripe`.
