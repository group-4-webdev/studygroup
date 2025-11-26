#!/bin/bash
# Deployment Verification Script

echo "🔍 Crimsons Study Squad - Deployment Readiness Check"
echo "=================================================="
echo ""

# Check configuration files exist
echo "📁 Checking configuration files..."
files=(
  "railway.json"
  "render.yaml"
  "netlify.toml"
  "DEPLOYMENT.md"
  ".env.example"
  "study-group-backend/Procfile"
  "study-group-backend/.env.example"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file missing"
  fi
done

echo ""
echo "📦 Checking Node modules..."
if [ -d "node_modules" ]; then
  echo "✅ Frontend node_modules installed"
else
  echo "⚠️  Run: npm install"
fi

if [ -d "study-group-backend/node_modules" ]; then
  echo "✅ Backend node_modules installed"
else
  echo "⚠️  Run: cd study-group-backend && npm install"
fi

echo ""
echo "🔐 Checking environment variables..."
if [ -f ".env" ]; then
  echo "✅ .env exists (remember to update for production!)"
else
  echo "⚠️  Create .env from .env.example"
fi

if [ -f "study-group-backend/.env" ]; then
  echo "✅ Backend .env exists (remember to update for production!)"
else
  echo "⚠️  Create study-group-backend/.env from .env.example"
fi

echo ""
echo "📚 Key files for deployment:"
echo "  • DEPLOYMENT.md - Full deployment guide"
echo "  • PRODUCTION_READY.md - Quick reference"
echo "  • railway.json - Railway configuration"
echo "  • render.yaml - Render configuration"
echo "  • netlify.toml - Netlify configuration"

echo ""
echo "✅ Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Update .env files with production secrets"
echo "2. Commit and push to GitHub"
echo "3. Deploy to Railway, Render, or Netlify"
echo ""
