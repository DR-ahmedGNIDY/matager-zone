# MongoDB Atlas Migration Guide — Mtajer Zone

## Connection String

```
mongodb+srv://matager2026:<db_password>@cluster0.aaf0giw.mongodb.net/mtajerzone?retryWrites=true&w=majority&appName=Cluster0
```

Replace `<db_password>` with your actual password.

## .env.local (development)

```env
DATABASE_URL="mongodb+srv://matager2026:<db_password>@cluster0.aaf0giw.mongodb.net/mtajerzone?retryWrites=true&w=majority&appName=Cluster0"
```

## .env.production (Hostinger VPS)

```env
DATABASE_URL="mongodb+srv://matager2026:<db_password>@cluster0.aaf0giw.mongodb.net/mtajerzone?retryWrites=true&w=majority&appName=Cluster0&ssl=true"
```

## MongoDB Atlas Dashboard Setup

1. Log in to https://cloud.mongodb.com
2. Go to **Network Access** → Add IP Address
   - For development: Add your current IP
   - For production: Add your Hostinger VPS IP
   - Or add `0.0.0.0/0` (allow all — less secure)
3. Go to **Database Access** → Verify user `matager2026` exists with readWrite role on `mtajerzone` database
4. Go to **Clusters** → Connect → Drivers → copy the connection string

## First Deploy Steps

```bash
# 1. Set environment variable
export DATABASE_URL="mongodb+srv://matager2026:<password>@cluster0.aaf0giw.mongodb.net/mtajerzone?retryWrites=true&w=majority"

# 2. Generate Prisma client (no migrations needed for MongoDB)
npx prisma generate

# 3. Push schema to MongoDB (creates collections and indexes)
npx prisma db push

# 4. Seed initial data
npm run db:seed

# 5. Build and start
npm run build
npm start
```

## Key Differences from PostgreSQL

| PostgreSQL | MongoDB |
|-----------|---------|
| `prisma migrate deploy` | `prisma db push` (no migrations) |
| `@id @default(cuid())` | `@id @default(auto()) @map("_id") @db.ObjectId` |
| PostgreSQL enums | String fields with app-level validation |
| `$executeRaw` SQL functions | Native Prisma `update` with `{ increment: 1 }` |
| `@db.Text` for long strings | Not needed — MongoDB has no TEXT type limit |
| Full-text search via tsvector | Use `mode: "insensitive"` regex queries |

## Indexes (auto-created by `prisma db push`)

All `@@index` declarations in schema.prisma are automatically
created as MongoDB indexes when you run `prisma db push`.

## No Migration Files Needed

MongoDB with Prisma does NOT use migration files.
The `prisma/migrations/` directory is not used.
All schema changes are applied directly with `prisma db push`.

## Auth.js Compatibility

Auth.js v5 with PrismaAdapter works with MongoDB.
The `Account`, `Session`, and `VerificationToken` models
are fully compatible with the MongoDB provider.
