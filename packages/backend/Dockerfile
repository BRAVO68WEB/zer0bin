FROM rust:1.91.1-alpine

WORKDIR /app

COPY . .

RUN apk add musl-dev \
    && apk cache clean

RUN cargo build --release

EXPOSE 8000

CMD ["cargo", "run", "--release"]