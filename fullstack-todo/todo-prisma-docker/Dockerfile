# Use an official node.js runtime as the parent image
FROM node:23-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json .

# Install all the dependencies
RUN npm install

# Copy the rest of the application code to the /app
COPY . .

# Expose the port the app runs in
EXPOSE 8010

# Define the command to run the application when the container starts
CMD ["node", "./src/server.js"]
