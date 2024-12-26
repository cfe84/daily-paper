FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install -g typescript
RUN tsc
CMD ["node", "dist/dailyPaper.js"]
