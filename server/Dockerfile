FROM oven/bun
WORKDIR /app
COPY . .
RUN bun install
EXPOSE 4500
CMD ["bun", "src/app.ts"]
