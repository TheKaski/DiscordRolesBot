const SNOWFLAKE = /^\d{17,20}$/;

export interface Config {
  guildId: string;
  discordToken: string;
  port: number;
  assignableRoleIds: ReadonlySet<string>;
}

/* config.ts
 * Function for loading and parsing the environment variables before starting the app.
 * Reads the variables from .env path passed in deno.json
 * */
export function loadConfig(
  env: Record<string, string | undefined> = Deno.env.toObject(),
): Config {
  const guildId = env.GUILD_ID;
  if (!guildId) {
    throw new Error("Missing required environment variable: GUILD_ID");
  }
  if (!SNOWFLAKE.test(guildId)) {
    throw new Error(`Invalid GUILD_ID value: ${guildId}`);
  }

  const discordToken = env.DISCORD_TOKEN;
  if (!discordToken) {
    throw new Error("Missing required environment variable: DISCORD_TOKEN");
  }

  const port = Number(env.PORT ?? "8000");
  if (Number.isNaN(port)) {
    throw new Error(`Invalid PORT value: ${env.PORT}`);
  }

  const assignableRoleIds = parseAssignableRoleIds(env.ASSIGNABLE_ROLE_IDS);

  return { guildId, discordToken, port, assignableRoleIds };
}

function parseAssignableRoleIds(raw: string | undefined): ReadonlySet<string> {
  const ids = (raw ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  if (ids.length === 0) {
    throw new Error(
      "Missing required environment variable: ASSIGNABLE_ROLE_IDS (comma-separated list of role snowflakes the API is allowed to assign)",
    );
  }

  const invalid = ids.filter((id) => !SNOWFLAKE.test(id));
  if (invalid.length > 0) {
    throw new Error(
      `Invalid role ID(s) in ASSIGNABLE_ROLE_IDS: ${invalid.join(", ")}`,
    );
  }

  return new Set(ids);
}
