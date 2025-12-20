# FROM node:18-alpine
# WORKDIR /app
# COPY package.json package-lock.json* ./
# RUN npm install
# COPY . .
# EXPOSE 3000
# CMD ["npm", "start"]

# Stage 1: Build the React Application
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# This creates the optimized "build" folder
RUN npm run build

# Stage 2: Serve with Nginx (Lightweight & Fast)
FROM nginx:alpine
# Copy the build output from Stage 1 to Nginx's html folder
COPY --from=build /app/build /usr/share/nginx/html

# ✅ FIX 404 ERRORS: Configure Nginx for React Router
# This tells Nginx: "If you can't find a file, give index.html"
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]