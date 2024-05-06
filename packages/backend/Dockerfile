FROM rust:1.76.0-alpine

WORKDIR /app

COPY . .

RUN apk add musl-dev \
    && apk cache clean

RUN cargo build 

EXPOSE 8000

CMD ["cargo", "run", "--release"]