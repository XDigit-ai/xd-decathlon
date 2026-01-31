ARG NODE_VERSION=22
FROM mcr.microsoft.com/devcontainers/javascript-node:${NODE_VERSION}-bookworm

# CLI tools for SaaS integrations
RUN npm install -g \
    vercel \
    supabase \
    @anthropic-ai/claude-code \
    typescript \
    tsx

# Persist bash history across container rebuilds
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
    && mkdir /commandhistory \
    && touch /commandhistory/.bash_history \
    && chown -R node /commandhistory \
    && echo "$SNIPPET" >> "/home/node/.bashrc"
