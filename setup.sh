#!/bin/bash
# FoodAisle Inventory System - Setup & Run Script

echo "🚀 FoodAisle Grocery Store - Inventory Management System"
echo "=================================================="
echo ""

# Step 1: Check Node.js
echo "✓ Checking Node.js installation..."
node -v
npm -v
echo ""

# Step 2: Install dependencies
echo "✓ Installing dependencies..."
npm install
cd backend
npm install
cd ..
echo ""

# Step 3: Database setup
echo "⚠️  Database Setup Required:"
echo "   1. Ensure MySQL is running"
echo "   2. Run: mysql -u root -e \"CREATE DATABASE foodaisle_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""
echo "   3. Run: cd backend && npm run prisma:migrate && npm run prisma:seed"
echo ""

# Step 4: Environment files
echo "✓ Environment files created:"
echo "   - .env (backend configuration)"
echo "   - .env.frontend (frontend configuration)"
echo ""

echo "📖 Documentation:"
echo "   - SETUP.md - Comprehensive setup guide"
echo "   - QUICKSTART.md - Quick start (5 minutes)"
echo "   - API_DOCUMENTATION.md - API reference"
echo "   - DATABASE_SETUP.md - Database configuration"
echo ""

echo "🎬 To start development:"
echo ""
echo "Terminal 1 (Backend):"
echo "  $ cd backend"
echo "  $ npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  $ npm run dev"
echo ""
echo "Login credentials:"
echo "  📧 Email: admin@foodaisle.com"
echo "  🔑 Password: admin123"
echo ""
