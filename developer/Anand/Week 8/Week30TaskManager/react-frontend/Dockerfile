FROM node:22-alpine
WORKDIR /app
COPY package.json server.js index.html styles.css ./
COPY src ./src
ENV PORT=8080
ENV API_URL=http://localhost:5000/api/tasks
EXPOSE 8080
CMD ["npm", "start"]
