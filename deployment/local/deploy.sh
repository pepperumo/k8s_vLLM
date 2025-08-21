#!/bin/bash

# Build and deploy script for ChatGPT Platform
set -e

echo "🚀 ChatGPT Platform - Build and Deploy Script"
echo "============================================="

# Configuration
RELEASE_NAME=${1:-chatgpt-platform}
NAMESPACE=${2:-default}
BUILD_IMAGES=${3:-true}

echo "📋 Configuration:"
echo "   Release Name: $RELEASE_NAME"
echo "   Namespace: $NAMESPACE"
echo "   Build Images: $BUILD_IMAGES"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

if ! command -v helm &> /dev/null; then
    echo "❌ Helm is not installed or not in PATH"
    exit 1
fi

echo "✅ All prerequisites found"
echo ""

# Build Docker images
if [[ "$BUILD_IMAGES" == "true" ]]; then
    echo "🔨 Building Docker images..."
    
    echo "📦 Building frontend image..."
    docker build -t chatgpt-frontend:latest ./src/frontend
    
    echo "📦 Building backend image..."
    docker build -t chatgpt-backend:latest ./src/backend
    
    echo "✅ Docker images built successfully"
    echo ""
fi

# Create namespace if it doesn't exist
echo "🏗️  Creating namespace if needed..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy with Helm
echo "🚀 Deploying with Helm..."
helm upgrade --install $RELEASE_NAME ./helm-chart \
    --namespace $NAMESPACE \
    --set frontend.image.tag=latest \
    --set backend.image.tag=latest \
    --wait \
    --timeout=5m

echo ""
echo "✅ Deployment completed!"
echo ""

# Show deployment status
echo "📊 Deployment Status:"
kubectl get pods -l app.kubernetes.io/instance=$RELEASE_NAME -n $NAMESPACE

echo ""
echo "🌐 To access the application:"
echo "   Run: ./deployment/local/port-forward.sh $RELEASE_NAME $NAMESPACE"
echo ""
echo "🔍 To check logs:"
echo "   Frontend: kubectl logs -l app.kubernetes.io/component=frontend -n $NAMESPACE"
echo "   Backend:  kubectl logs -l app.kubernetes.io/component=backend -n $NAMESPACE"