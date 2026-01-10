# Nginx Dockerfile for Production (Docker Compose)
# =================================================
# Used for: Docker Compose deployments
# For Kubernetes, see: k8s/nginx/nginx-deployment.yaml

FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create directories for static files
RUN mkdir -p /usr/share/nginx/html/admin
RUN mkdir -p /usr/share/nginx/html/seller

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

