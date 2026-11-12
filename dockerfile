
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiamos los archivos de dependencias
COPY package.json package-lock.json ./

# Copiamos todo el workspace Nx
COPY . .

RUN npm ci

ARG APP_NAME=react-front

# Compilamos la aplicación
RUN npx nx reset

RUN npx nx build ${APP_NAME}

# Production stage
FROM nginx:alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/apps/react-front/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
