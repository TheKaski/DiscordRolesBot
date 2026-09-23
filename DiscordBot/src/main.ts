import { createApp } from "./app.ts";
import { createDiscordClient } from "./discordClient.ts";
import { loadConfig } from "./config.ts";

/* main.ts
 * load config, create discordClient, create app
 * and setup the HTTP server
 * */
if (import.meta.main) {
  const config = loadConfig();
  const discordClient = createDiscordClient(config.discordToken);
  const app = createApp(
    discordClient,
    config.guildId,
    config.assignableRoleIds,
  );

  app.listen(config.port, () => {
    console.log(`Role API listening on http://localhost:${config.port}`);
  });
}
