#!/bin/bash

# Quick start script for ChatGPT Platform
echo "🚀 ChatGPT Platform - Quick Start"
echo "================================="

# Check if Mistral API is running
echo "🔍 Checking Mistral API availability..."
if curl -s http://127.0.0.1:1234/v1/models >/dev/null 2>&1; then
    echo "✅ Mistral API is running at http://127.0.0.1:1234"
else
    echo "⚠️  Mistral API is not accessible at http://127.0.0.1:1234"
    echo "   Please ensure your Mistral LLM server is running before proceeding."
    echo ""
    echo "💡 Start your Mistral server with something like:"
    echo "   python -m vllm.entrypoints.openai.api_server --model mistralai/Mistral-7B-Instruct-v0.1 --port 1234"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🐳 Starting with Docker Compose..."
docker-compose up --build

echo ""
echo "🎉 ChatGPT Platform started!"
echo "🌍 Frontend: http://localhost:3000"
echo "🔗 Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop"