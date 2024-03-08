FROM node:20-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY ./docker/startup.sh /

WORKDIR /app

ENTRYPOINT ["/startup.sh"]