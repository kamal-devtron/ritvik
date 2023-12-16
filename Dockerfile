# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle app source
COPY . .

# Expose port 4000
EXPOSE 4000

# Define the command to run your app using nodemon
CMD ["node", "index.js"]
