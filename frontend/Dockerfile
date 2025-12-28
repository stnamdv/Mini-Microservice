# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve

# Copy built app from build stage
COPY --from=build /app/build /app/build

# Expose port
EXPOSE 4000

# Start the app
CMD ["serve", "-s", "/app/build", "-l", "4000"]
