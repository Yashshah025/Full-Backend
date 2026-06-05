# Use the official Node image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the default Vite development port
EXPOSE 3000

# Run Vite dev server and bind it to 0.0.0.0 to expose it outside the container
CMD ["npm", "run", "dev", "--", "--host"]
