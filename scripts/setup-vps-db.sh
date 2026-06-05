#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# MTAJER ZONE — PostgreSQL Setup Script for Hostinger VPS
# Ubuntu 24.04
# Run as root: bash setup-vps-db.sh
# ═══════════════════════════════════════════════════════════════

set -e

DB_NAME="mtajerzone"
DB_USER="mtajerzone"
DB_PASS="$(openssl rand -base64 24 | tr -d '/@+=' | head -c 20)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Mtajer Zone — PostgreSQL VPS Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Update system ─────────────────────────────────────────
echo "📦 Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# ── 2. Install PostgreSQL ────────────────────────────────────
echo "🐘 Installing PostgreSQL 16..."
apt-get install -y postgresql postgresql-contrib

# Start and enable
systemctl start postgresql
systemctl enable postgresql

echo "   ✓ PostgreSQL installed and started"

# ── 3. Create database and user ──────────────────────────────
echo "🔧 Creating database and user..."
sudo -u postgres psql << PSQLEOF
-- Create user
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';

-- Create database
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};

-- Connect to database and grant schema privileges
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\q
PSQLEOF

echo "   ✓ Database '${DB_NAME}' created"
echo "   ✓ User '${DB_USER}' created"

# ── 4. Configure PostgreSQL for performance ──────────────────
echo "⚡ Optimizing PostgreSQL configuration..."
PG_CONF=$(sudo -u postgres psql -t -c "SHOW config_file;" | xargs)
PG_DIR=$(dirname "$PG_CONF")

sudo -u postgres tee -a "$PG_CONF" << PGEOF

# Mtajer Zone Performance Tuning
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 768MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
min_wal_size = 1GB
max_wal_size = 4GB
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
PGEOF

# Reload PostgreSQL
systemctl reload postgresql
echo "   ✓ PostgreSQL optimized"

# ── 5. Configure pg_hba.conf for local connections ───────────
echo "🔒 Configuring authentication..."
PG_HBA=$(find /etc/postgresql -name "pg_hba.conf" 2>/dev/null | head -1)
if [ -f "$PG_HBA" ]; then
    # Ensure local connections use md5
    sed -i 's/local\s*all\s*all\s*peer/local   all             all                                     md5/' "$PG_HBA"
    systemctl reload postgresql
    echo "   ✓ Authentication configured"
fi

# ── 6. Save credentials ──────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Database Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Database Credentials:"
echo "   Host:     localhost"
echo "   Port:     5432"
echo "   Database: ${DB_NAME}"
echo "   User:     ${DB_USER}"
echo "   Password: ${DB_PASS}"
echo ""
echo "🔗 DATABASE_URL for .env:"
echo "   DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}\""
echo ""
echo "⚠️  Save these credentials securely!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Save to file
cat > /root/db-credentials.txt << CREDEOF
# Mtajer Zone Database Credentials
# Generated: $(date)
# KEEP THIS FILE SECURE

DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
CREDEOF

chmod 600 /root/db-credentials.txt
echo "💾 Credentials saved to /root/db-credentials.txt"
