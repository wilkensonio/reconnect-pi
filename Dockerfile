# Use the official image as a parent image  (alpine:3.19)
FROM  node:18-alpine3.20 AS build 

#  install nodejs and npm
RUN apk add --no-cache nodejs npm

# Set the working directory
WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app 
COPY ./  ./

#  build the app using vite 
RUN npm run build

#  Serve using Nginx
FROM nginx:stable-alpine AS production  

WORKDIR /usr/share/nginx/html

# Remove the default Nginx static file
# RUN rm -rf ./*

# Copy the build output from the previous stage to Nginx's html directory

COPY --from=build /usr/src/app/dist .   

# Copy custom Nginx configuration
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]