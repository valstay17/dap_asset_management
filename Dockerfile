FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist/dap_asset_management/browser ./browser

EXPOSE 6000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost:6000/ || exit 1

CMD ["serve", "-s", "browser", "-l", "6000"]
