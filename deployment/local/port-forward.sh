#!/bin/bash

# Port forwarding script for local development
echo "🚀 Setting up port forwarding for ChatGPT Platform..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Get the release name (assuming default)
RELEASE_NAME=${1:-chatgpt-platform}
NAMESPACE=${2:-default}

echo "📋 Using release: $RELEASE_NAME in namespace: $NAMESPACE"

# Function to check if pods are ready
check_pods_ready() {
    echo "⏳ Checking if pods are ready..."
    
    frontend_ready=$(kubectl get pods -l "app.kubernetes.io/name=chatgpt-platform,app.kubernetes.io/instance=$RELEASE_NAME,app.kubernetes.io/component=frontend" -n $NAMESPACE --no-headers 2>/dev/null | grep -c "Running")
    backend_ready=$(kubectl get pods -l "app.kubernetes.io/name=chatgpt-platform,app.kubernetes.io/instance=$RELEASE_NAME,app.kubernetes.io/component=backend" -n $NAMESPACE --no-headers 2>/dev/null | grep -c "Running")
    
    if [[ $frontend_ready -eq 0 ]] || [[ $backend_ready -eq 0 ]]; then
        echo "❌ Pods are not ready yet. Please wait for deployment to complete."
        echo "   Frontend pods running: $frontend_ready"
        echo "   Backend pods running: $backend_ready"
        echo ""
        echo "💡 Run the following to check pod status:"
        echo "   kubectl get pods -l app.kubernetes.io/instance=$RELEASE_NAME -n $NAMESPACE"
        exit 1
    fi
    
    echo "✅ All pods are ready!"
}

# Check pods
check_pods_ready

# Start port forwarding in background
echo "🌐 Starting port forwarding..."

# Frontend port forwarding
echo "📱 Forwarding frontend (port 8080 -> 80)..."
kubectl port-forward svc/$RELEASE_NAME-frontend 8080:80 -n $NAMESPACE &
FRONTEND_PID=$!

# Backend port forwarding  
echo "🔧 Forwarding backend (port 3001 -> 80)..."
kubectl port-forward svc/$RELEASE_NAME-backend 3001:80 -n $NAMESPACE &
BACKEND_PID=$!

# Wait a moment for port forwarding to establish
sleep 3

# Check if port forwarding is working
if ps -p $FRONTEND_PID > /dev/null && ps -p $BACKEND_PID > /dev/null; then
    echo ""
    echo "🎉 Port forwarding is active!"
    echo ""
    echo "🌍 Frontend: http://localhost:8080"
    echo "🔗 Backend:  http://localhost:3001"
    echo "🏥 Health:   http://localhost:3001/health"
    echo ""
    echo "Press Ctrl+C to stop port forwarding"
    echo ""
    
    # Function to cleanup on exit
    cleanup() {
        echo ""
        echo "🛑 Stopping port forwarding..."
        kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
        echo "✅ Port forwarding stopped"
        exit 0
    }
    
    # Trap signals
    trap cleanup SIGINT SIGTERM
    
    # Wait for user to stop
    wait
else
    echo "❌ Failed to start port forwarding"
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 1
fi