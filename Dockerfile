FROM node:22-alpine
WORKDIR /app
COPY apps/api/package*.json ./apps/api/
RUN cd apps/api && npm install --omit=dev --no-audit --no-fund
COPY apps/api ./apps/api
COPY shared ./shared
COPY database ./database
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["npm","start"]
