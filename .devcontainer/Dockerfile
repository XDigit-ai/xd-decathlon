FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Install Vercel CLI globally (isolated to this container)
RUN npm install -g vercel@latest

# Set git config for this project's org (override per project)
ARG GIT_USER_NAME="AK"
ARG GIT_USER_EMAIL="alamaa@gmail.com"
RUN git config --global user.name "${GIT_USER_NAME}" \
    && git config --global user.email "${GIT_USER_EMAIL}"

# Prevent any global npm/config leakage
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH="/home/node/.npm-global/bin:${PATH}"

WORKDIR /workspace
