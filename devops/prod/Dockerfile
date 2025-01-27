# Stage 1: Build the SolidJS application
FROM node:20.18.1-slim as build

WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .
RUN npm run build

# Stage 2: Setup Nginx to serve the built application
FROM nginx:1.27.2

# Remove the default server definition
RUN rm /etc/nginx/conf.d/default.conf

# Copy the Nginx configuration
COPY ./devops/prod/nginx/nginx.conf /etc/nginx/conf.d

# Copy built files from the build stage to Nginx's html directory
COPY --from=build /src/dist /usr/share/nginx/html