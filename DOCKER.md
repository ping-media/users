# Docker Deployment Guide

This guide provides complete instructions for dockerizing and deploying the Users CRUD API on a Linux server.

## 📋 Prerequisites

### System Requirements

- Linux server (Ubuntu 20.04+, CentOS 7+, or similar)
- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 1GB RAM
- 10GB free disk space

### Install Docker (if not already installed)

**Ubuntu/Debian:**

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

**CentOS/RHEL:**

```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
```

## 🚀 Quick Deployment

### Option 1: Using the Deployment Script (Recommended)

1. **Clone or copy the project to your server:**

   ```bash
   git clone <your-repo-url> /opt/users-api
   cd /opt/users-api
   ```

2. **Run the deployment script:**

   ```bash
   # For basic Docker deployment
   ./deploy.sh

   # For Docker Compose deployment (includes nginx)
   ./deploy.sh --compose
   ```

### Option 2: Manual Docker Commands

1. **Build the Docker image:**

   ```bash
   docker build -t users-crud-api .
   ```

2. **Create data directory:**

   ```bash
   mkdir -p ./data
   chmod 755 ./data
   ```

3. **Run the container:**
   ```bash
   docker run -d \
     --name users-crud-api-container \
     -p 3000:3000 \
     -v $(pwd)/data:/app/data \
     --restart unless-stopped \
     users-crud-api
   ```

### Option 3: Using Docker Compose

1. **Deploy with Docker Compose:**

   ```bash
   docker-compose up -d --build
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

## 📁 File Structure

```
users/
├── Dockerfile              # Docker image definition
├── .dockerignore           # Files to exclude from Docker build
├── docker-compose.yml      # Multi-service deployment
├── nginx.conf              # Nginx reverse proxy configuration
├── deploy.sh               # Automated deployment script
├── DOCKER.md               # This documentation
├── server.js               # Main application file
├── package.json            # Node.js dependencies
├── data/                   # Data directory (created by deployment)
│   └── data.json          # User data storage
├── routes/
│   └── users.js           # API routes
├── controllers/
│   └── userController.js  # Business logic
└── helpers/
    └── fileUtils.js       # File operations
```

## 🔧 Configuration

### Environment Variables

You can customize the deployment by setting environment variables:

```bash
# In docker-compose.yml or docker run command
environment:
  - NODE_ENV=production
  - PORT=3000
```

### Port Configuration

- **Default API Port:** 3000
- **Nginx Port:** 80 (HTTP), 443 (HTTPS)
- **Custom Port:** Change the port mapping in docker-compose.yml or docker run command

### Data Persistence

The application data is persisted using Docker volumes:

- **Data Directory:** `./data` (mounted to `/app/data` in container)
- **Logs Directory:** `./logs` (mounted to `/app/logs` in container)

## 🛠️ Management Commands

### Basic Docker Commands

```bash
# View running containers
docker ps

# View container logs
docker logs users-crud-api-container

# Stop container
docker stop users-crud-api-container

# Start container
docker start users-crud-api-container

# Restart container
docker restart users-crud-api-container

# Remove container
docker rm -f users-crud-api-container

# View container details
docker inspect users-crud-api-container
```

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Scale API service
docker-compose up -d --scale users-api=3

# Rebuild and start
docker-compose up -d --build
```

### Health Checks

```bash
# Check API health
curl http://localhost:3000/

# Check nginx health (if using docker-compose)
curl http://localhost/health

# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## 🔒 Security Considerations

### Container Security

- **Non-root user:** The container runs as a non-root user (nodejs:1001)
- **Read-only filesystem:** Consider mounting the application code as read-only
- **Resource limits:** Set memory and CPU limits for production

### Network Security

- **Firewall:** Configure firewall to only allow necessary ports
- **Reverse proxy:** Use nginx for additional security layers
- **SSL/TLS:** Enable HTTPS in production

### Data Security

- **Backup:** Regularly backup the `./data` directory
- **Permissions:** Ensure proper file permissions on data directory
- **Encryption:** Consider encrypting sensitive data

## 📊 Monitoring and Logging

### Log Management

```bash
# View application logs
docker logs -f users-crud-api-container

# View nginx logs (if using docker-compose)
docker logs -f users-api-nginx

# Export logs to file
docker logs users-crud-api-container > app.log
```

### Health Monitoring

The application includes health checks:

- **Container health check:** Checks if the application is responding
- **API health endpoint:** `GET /` returns API status
- **Nginx health endpoint:** `GET /health` returns nginx status

### Performance Monitoring

```bash
# Monitor container resources
docker stats users-crud-api-container

# Monitor disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## 🔄 Updates and Maintenance

### Updating the Application

1. **Pull latest code:**

   ```bash
   git pull origin main
   ```

2. **Rebuild and restart:**

   ```bash
   # Using deployment script
   ./deploy.sh

   # Using docker-compose
   docker-compose up -d --build

   # Using manual commands
   docker build -t users-crud-api .
   docker stop users-crud-api-container
   docker rm users-crud-api-container
   docker run -d --name users-crud-api-container -p 3000:3000 -v $(pwd)/data:/app/data --restart unless-stopped users-crud-api
   ```

### Backup and Restore

```bash
# Backup data
cp -r ./data ./data-backup-$(date +%Y%m%d)

# Restore data
cp -r ./data-backup-20231201 ./data
docker restart users-crud-api-container
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use:**

   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3000

   # Kill the process or change port
   docker run -p 3001:3000 users-crud-api
   ```

2. **Permission denied:**

   ```bash
   # Fix data directory permissions
   sudo chown -R $USER:$USER ./data
   chmod 755 ./data
   ```

3. **Container won't start:**

   ```bash
   # Check container logs
   docker logs users-crud-api-container

   # Check if data directory exists
   ls -la ./data
   ```

4. **API not responding:**

   ```bash
   # Check if container is running
   docker ps

   # Check container health
   docker inspect users-crud-api-container | grep Health -A 10

   # Test API directly
   curl http://localhost:3000/
   ```

### Debug Mode

```bash
# Run container in interactive mode for debugging
docker run -it --rm -p 3000:3000 -v $(pwd)/data:/app/data users-crud-api /bin/sh

# Run with debug logging
docker run -d --name users-crud-api-debug -p 3000:3000 -v $(pwd)/data:/app/data -e NODE_ENV=development users-crud-api
```

## 📈 Production Deployment

### Production Checklist

- [ ] Use Docker Compose with nginx reverse proxy
- [ ] Enable SSL/TLS certificates
- [ ] Set up proper logging and monitoring
- [ ] Configure automated backups
- [ ] Set resource limits
- [ ] Enable firewall rules
- [ ] Set up CI/CD pipeline
- [ ] Configure health checks and alerts

### Scaling

```bash
# Scale API service
docker-compose up -d --scale users-api=3

# Use load balancer
docker-compose up -d nginx users-api
```

### High Availability

- Use multiple server instances
- Set up load balancing
- Configure automated failover
- Implement proper backup strategies

## 📞 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review container logs: `docker logs users-crud-api-container`
3. Check application logs in `./logs` directory
4. Verify data integrity in `./data` directory

## 📝 License

This Docker setup is provided as-is for educational and production use.
