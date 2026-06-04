FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies first (layer cached unless package.json changes)
COPY package*.json ./
RUN npm ci

# Generate Prisma client before copying source
COPY prisma ./prisma
RUN npx prisma generate

# Copy application source
COPY . .

EXPOSE 5000

# Run migrations, seed catalogue data, then start the server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma db seed && node src/server.js"]
