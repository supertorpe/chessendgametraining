FROM node:20-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# https://github.com/nodejs/corepack/issues/417
RUN npm install -g corepack@0.24.1 && corepack enable

COPY ./docker/startup.sh /

WORKDIR /app

ENTRYPOINT ["/startup.sh"]