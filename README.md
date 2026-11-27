# ARCH-AID (Next.js)

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Motion · Zod · Prisma (Postgres, schema ready).

```bash
npm install
cp .env.example .env     # fill in later phases
npm run dev              # http://localhost:3000
```

- Content (copy, projects, team, contact details): `src/lib/content.ts`
- Enquiry form → `src/app/api/enquiries/route.ts` (validated; DB + email hooks marked TODO)
- Database: set `DATABASE_URL`, then `npm run db:push`; client is in `src/lib/db.ts`
- Payments: `Payment` model is in `prisma/schema.prisma`; add `/api/payments/*` routes with Razorpay (INR) or Stripe
- Deploy: Vercel (push to GitHub, import repo, add env vars)
