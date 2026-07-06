#!/bin/bash

cd "$(dirname "$0")"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo "❌ Wrangler not installed. Install it with:"
  echo "   npm install -g wrangler"
  exit 1
fi

# Check if API token is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ CLOUDFLARE_API_TOKEN not set in .env file"
  echo "   Create token at: https://dash.cloudflare.com/profile/api-tokens"
  echo "   Permissions: Account → Cloudflare Pages → Edit"
  exit 1
fi

echo "🔍 Finding all *.preview.tsx files..."
mkdir -p .component-preview/dist

find . -name "*.preview.tsx" -not -path "*/node_modules/*" -not -path "*/.component-preview/*" | while read preview; do
  echo "📦 Building $preview..."
  relative_path="${preview#./}"
  safe_name=$(echo "$relative_path" | sed 's|/|_|g' | sed 's|\.preview\.tsx||')
  node build-cli.js --entry "$relative_path" --out ".component-preview/dist/$safe_name"
done

echo "✅ All previews built to .component-preview/dist/"
echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy .component-preview/dist --project-name=component-preview --commit-dirty=true