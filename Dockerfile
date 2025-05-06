FROM node:lts-alpine3.21

# where your app will live inside the container
WORKDIR /workspaces/phippy-bucket-run

COPY package*.json ./
RUN npm install && npm audit fix

# copy rest of the source
COPY . .

# build your app
RUN npm run build

EXPOSE 8080

# start your server
CMD ["npm", "start"]