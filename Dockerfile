FROM denoland/deno:2.9.7

WORKDIR /app

# Cache dependencies separately so source-only changes don't reinstall them.
COPY deno.json deno.lock ./
COPY DiscordBot ./DiscordBot
RUN deno cache DiscordBot/src/main.ts

USER deno

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-env", "DiscordBot/src/main.ts"]
