FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV ONNXRUNTIME_NODE_INSTALL_CUDA=skip
COPY apps/api/package*.json ./apps/api/
RUN cd apps/api && npm install --omit=dev --no-audit --no-fund
COPY apps/api ./apps/api
COPY shared ./shared
COPY database ./database
WORKDIR /app/apps/api
ENV NEXORA_MODEL_CACHE=/app/models
RUN node download-model.js
EXPOSE 3000
CMD ["npm","start"]
