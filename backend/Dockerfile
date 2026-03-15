# ---- ビルドステージ ----
FROM rust:latest AS builder

WORKDIR /app

# 依存クレートのキャッシュ（ソースが変わってもここは再利用）
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -f target/release/deps/ai_learning_backend*

# 本体ビルド
COPY src ./src
COPY migrations ./migrations
RUN cargo build --release

# ---- 実行ステージ ----
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/ai-learning-backend ./
COPY --from=builder /app/migrations ./migrations

ENV PORT=8080
ENV DATABASE_URL=sqlite:///data/backend.db

EXPOSE 8080

CMD ["./ai-learning-backend"]
