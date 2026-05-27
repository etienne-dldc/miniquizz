FROM denoland/deno:2.8.0

WORKDIR /app

COPY . .

# Pre-cache remote dependencies at build time to speed up startup.
RUN deno ci

ENV PORT=3008
ENV OTEL_DENO=true
ENV OTEL_SERVICE_NAME=miniquizz
ENV STORAGE_FOLDER_PATH=/app/storage
ENV DATA_FOLDER_PATH=/app/data

EXPOSE 3008

CMD ["task", "start"]
