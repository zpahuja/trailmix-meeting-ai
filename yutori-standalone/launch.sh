#!/bin/bash

# Yutori API Test Suite Launcher
# This script opens the test suite in your default browser

echo "🚀 Launching Yutori API Test Suite..."
echo ""

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Path to the HTML file
HTML_FILE="$DIR/index.html"

# Check if file exists
if [ ! -f "$HTML_FILE" ]; then
    echo "❌ Error: index.html not found at $HTML_FILE"
    exit 1
fi

echo "📂 Opening: $HTML_FILE"
echo ""

# Open in default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$HTML_FILE"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "$HTML_FILE"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start "$HTML_FILE"
else
    echo "⚠️  Could not detect OS. Please open index.html manually."
    exit 1
fi

echo "✅ Test suite opened in your default browser!"
echo ""
echo "📖 Features:"
echo "   • Scout Creation with custom queries"
echo "   • Real-time polling with progress tracking"
echo "   • Beautiful results display"
echo "   • Email follow-up generator"
echo "   • Complete API debug logger"
echo ""
echo "🔑 API Key is pre-filled. Just click 'Start Research'!"
echo ""
