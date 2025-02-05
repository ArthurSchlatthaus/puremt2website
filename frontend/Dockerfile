# Use node:18 as base image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Expose the application port
EXPOSE 3000

# Run the React app
CMD ["npm", "run", "start"]
