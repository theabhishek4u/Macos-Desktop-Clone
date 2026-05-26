#!/bin/bash
# ============================================
# macOS Desktop Clone - GitHub Push Script
# ============================================
# 
# STEPS TO PUSH TO GITHUB:
# 
# 1. Create a new repository on GitHub:
#    - Go to https://github.com/new
#    - Name: macos-desktop-clone
#    - Description: macOS Desktop Clone built with Next.js, TypeScript, and Tailwind CSS
#    - Make it Public or Private (your choice)
#    - Do NOT initialize with README, .gitignore, or license
#    - Click "Create repository"
#
# 2. Run this script with your GitHub username:
#    chmod +x push-to-github.sh
#    ./push-to-github.sh YOUR_GITHUB_USERNAME
#
# OR manually run these commands:
#    git remote add origin https://github.com/YOUR_USERNAME/macos-desktop-clone.git
#    git branch -M main
#    git push -u origin main
# ============================================

if [ -z "$1" ]; then
    echo "❌ Error: GitHub username required!"
    echo "Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME"
    echo ""
    echo "Example: ./push-to-github.sh johndoe"
    exit 1
fi

USERNAME=$1
REPO_NAME="macos-desktop-clone"
REMOTE_URL="https://github.com/${USERNAME}/${REPO_NAME}.git"

echo "🚀 Pushing macOS Desktop Clone to GitHub..."
echo "📦 Repository: ${REMOTE_URL}"
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "🔄 Updating existing remote origin..."
    git remote set-url origin "$REMOTE_URL"
else
    echo "➕ Adding remote origin..."
    git remote add origin "$REMOTE_URL"
fi

# Ensure we're on main branch
echo "🌿 Setting branch to main..."
git branch -M main

# Push to GitHub
echo "📤 Pushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your project at: https://github.com/${USERNAME}/${REPO_NAME}"
else
    echo ""
    echo "❌ Push failed. Common fixes:"
    echo "   1. Make sure the repository exists on GitHub"
    echo "   2. Check your GitHub credentials"
    echo "   3. Try: git push -u origin main --force"
    echo "   4. For SSH: change URL to git@github.com:${USERNAME}/${REPO_NAME}.git"
fi
