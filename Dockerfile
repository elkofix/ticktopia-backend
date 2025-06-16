# Etapa 1: Construcción
FROM node:20-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de definición de dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine

WORKDIR /app

# Copiar solo los archivos necesarios desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env ./
# Instalar solo las dependencias de producción
RUN npm install --only=production

# Exponer el puerto que usa NestJS
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/main"]
