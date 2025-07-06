#!/bin/bash

echo "🚀 Initializing Smart LMS Frontend Project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f ".env.local" ]; then
    echo "📄 Creating environment file..."
    cp .env.example .env.local
    echo "✅ Please update .env.local with your configuration"
else
    echo "⚠️  .env.local already exists"
fi

# Run setup script
echo "🔧 Setting up project structure..."
node scripts/setup.js

# Initialize Git hooks (if using Husky)
if [ -f "package.json" ] && grep -q "husky" package.json; then
    echo "🪝 Setting up Git hooks..."
    npm run prepare
fi

echo ""
echo "🎉 Project initialization complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Happy coding! 🚀"