# ChatGPT Platform with Mistral LLM

A simple ChatGPT-like web platform built with React frontend and Node.js backend, deployed on Kubernetes using Helm, and integrated with a local Mistral LLM server.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React         │    │   Node.js       │    │   Mistral LLM   │
│   Frontend      │◄──►│   Backend       │◄──►│   Server        │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 1234)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- **Docker** and **Docker Compose**
- **Kubernetes** cluster (local or remote)
- **Helm** v3.x
- **kubectl** configured
- **Mistral LLM server** running on `http://127.0.0.1:1234`

## 🚀 Quick Start

### Option 1: Docker Compose (Easiest)

1. **Start Mistral LLM server** (in a separate terminal):
   ```bash
   # Example with vLLM
   python -m vllm.entrypoints.openai.api_server \
     --model mistralai/Mistral-7B-Instruct-v0.1 \
     --port 1234
   ```

2. **Run the platform**:
   ```bash
   ./deployment/local/quick-start.sh
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Option 2: Kubernetes with Helm

1. **Build and deploy**:
   ```bash
   ./deployment/local/deploy.sh
   ```

2. **Set up port forwarding**:
   ```bash
   ./deployment/local/port-forward.sh
   ```

3. **Access the application**:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
k8s_vLLM/
├── README.md
├── docker-compose.yml
├── helm-chart/                 # Helm chart for Kubernetes deployment
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── _helpers.tpl
│       ├── configmap.yaml
│       ├── frontend-deployment.yaml
│       ├── frontend-service.yaml
│       ├── backend-deployment.yaml
│       ├── backend-service.yaml
│       ├── ingress.yaml
│       └── NOTES.txt
├── src/
│   ├── frontend/               # React frontend application
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── nginx.conf
│   │   ├── public/
│   │   └── src/
│   │       ├── App.js
│   │       ├── App.css
│   │       ├── index.js
│   │       └── components/
│   │           └── ChatInterface.js
│   └── backend/                # Node.js Express backend
│       ├── Dockerfile
│       ├── package.json
│       ├── server.js
│       ├── .env.example
│       └── routes/
│           └── chat.js
└── deployment/
    └── local/
        ├── deploy.sh           # Build and deploy script
        ├── port-forward.sh     # Port forwarding for local access
        └── quick-start.sh      # Quick start with Docker Compose
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```bash
NODE_ENV=development
PORT=3001
MISTRAL_API_URL=http://127.0.0.1:1234
FRONTEND_URL=http://localhost:3000
MISTRAL_TIMEOUT=30000
```

**Frontend**:
```bash
REACT_APP_BACKEND_URL=http://localhost:3001
```

### Helm Values

Edit `helm-chart/values.yaml` to customize:

```yaml
backend:
  env:
    MISTRAL_API_URL: "http://host.docker.internal:1234"
    
ingress:
  enabled: true
  hosts:
    - host: chatgpt-local.dev
```

## 🐳 Docker Commands

### Build Images
```bash
# Frontend
docker build -t chatgpt-frontend:latest ./src/frontend

# Backend  
docker build -t chatgpt-backend:latest ./src/backend
```

### Run with Docker Compose
```bash
# Start services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down
```

## ☸️ Kubernetes Commands

### Deploy with Helm
```bash
# Install
helm install chatgpt-platform ./helm-chart

# Upgrade
helm upgrade chatgpt-platform ./helm-chart

# Uninstall
helm uninstall chatgpt-platform
```

### Manual Kubernetes Commands
```bash
# Create namespace
kubectl create namespace chatgpt

# Deploy to specific namespace
helm install chatgpt-platform ./helm-chart -n chatgpt

# Port forward
kubectl port-forward svc/chatgpt-platform-frontend 8080:80
kubectl port-forward svc/chatgpt-platform-backend 3001:80

# Check logs
kubectl logs -l app.kubernetes.io/component=frontend
kubectl logs -l app.kubernetes.io/component=backend

# Check pods
kubectl get pods -l app.kubernetes.io/instance=chatgpt-platform
```

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:3001/health

# Test Mistral connection
curl http://localhost:3001/chat/test

# Send chat message
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

### Test Frontend
- Open http://localhost:3000 (Docker) or http://localhost:8080 (Kubernetes)
- Type a message and press send
- Verify response from Mistral LLM

## 🔍 Troubleshooting

### Common Issues

1. **Mistral API not accessible**:
   ```bash
   # Check if Mistral server is running
   curl http://127.0.0.1:1234/v1/models
   
   # For Docker: Use host.docker.internal:1234
   # For Kubernetes: Update values.yaml with correct endpoint
   ```

2. **Frontend can't reach backend**:
   ```bash
   # Check backend health
   curl http://localhost:3001/health
   
   # Verify CORS settings in backend
   # Check REACT_APP_BACKEND_URL environment variable
   ```

3. **Kubernetes pods not starting**:
   ```bash
   # Check pod status
   kubectl get pods -l app.kubernetes.io/instance=chatgpt-platform
   
   # Check logs
   kubectl logs -l app.kubernetes.io/component=backend
   
   # Describe pod for events
   kubectl describe pod <pod-name>
   ```

4. **Port forwarding issues**:
   ```bash
   # Kill existing port forward processes
   pkill -f "kubectl port-forward"
   
   # Start fresh port forwarding
   ./deployment/local/port-forward.sh
   ```

## 🎯 Features

- ✅ Real-time chat interface
- ✅ Message history display
- ✅ Loading indicators during LLM processing
- ✅ Error handling for API failures
- ✅ Responsive design
- ✅ Markdown support in responses
- ✅ Docker containerization
- ✅ Kubernetes deployment with Helm
- ✅ Health checks and monitoring
- ✅ CORS and security headers
- ✅ Rate limiting
- ✅ Graceful error handling

## 🔒 Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Non-root Docker containers
- Health checks for container monitoring

## 📈 Monitoring

### Health Endpoints
- Frontend: `http://localhost:3000/` (returns React app)
- Backend: `http://localhost:3001/health` (returns JSON status)
- Backend Test: `http://localhost:3001/chat/test` (tests Mistral connection)

### Kubernetes Health Checks
- Liveness probes for automatic restart on failure
- Readiness probes for traffic routing
- Resource limits and requests defined

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with Docker Compose
5. Test with Kubernetes
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review logs: `kubectl logs -l app.kubernetes.io/instance=chatgpt-platform`
3. Test components individually
4. Open an issue on GitHub
