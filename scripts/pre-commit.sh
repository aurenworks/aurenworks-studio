#!/bin/bash

# Pre-commit hook for aurenworks-studio
# Runs linting, format checking, and type checking before commits

set -e

echo "🔍 Running pre-commit checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root."
    exit 1
fi

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is not installed or not in PATH."
    echo "Please install pnpm: npm install -g pnpm"
    exit 1
fi

# Run type checking
echo "📝 Running TypeScript type checking..."
if ! pnpm type-check; then
    echo "❌ TypeScript type checking failed!"
    echo "Please fix the type errors before committing."
    exit 1
fi
echo "✅ Type checking passed"

# Run format checking
echo "🎨 Checking code formatting..."
if ! pnpm format:check; then
    echo "❌ Code formatting check failed!"
    echo "Please run 'pnpm format' to fix formatting issues."
    exit 1
fi
echo "✅ Format checking passed"

# Run linting
echo "🔧 Running ESLint..."
if ! pnpm lint; then
    echo "❌ ESLint found issues!"
    echo "Please run 'pnpm lint:fix' to automatically fix some issues."
    exit 1
fi
echo "✅ Linting passed"

echo "🎉 All pre-commit checks passed! Proceeding with commit..."
exit 0
