FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm i -D typescript

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build || npx tsc -p tsconfig.json

FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/server.js"]

