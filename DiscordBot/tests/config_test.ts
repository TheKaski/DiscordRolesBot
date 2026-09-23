import { assertEquals, assertThrows } from "@std/assert";
import { loadConfig } from "../config.ts";

const GUILD_ID = "123456789012345678";
const ROLE_ID = "323456789012345678";
const OTHER_ROLE_ID = "423456789012345678";

Deno.test("loadConfig throws without GUILD_ID", () => {
  assertThrows(() => loadConfig({}), Error, "GUILD_ID");
});

Deno.test("loadConfig throws for a malformed GUILD_ID", () => {
  assertThrows(
    () => loadConfig({ GUILD_ID: "not-a-snowflake" }),
    Error,
    "Invalid GUILD_ID",
  );
});

Deno.test("loadConfig throws without DISCORD_TOKEN", () => {
  assertThrows(() => loadConfig({ GUILD_ID }), Error, "DISCORD_TOKEN");
});

Deno.test("loadConfig throws without ASSIGNABLE_ROLE_IDS", () => {
  assertThrows(
    () => loadConfig({ GUILD_ID, DISCORD_TOKEN: "token" }),
    Error,
    "ASSIGNABLE_ROLE_IDS",
  );
});

Deno.test("loadConfig throws for a malformed role ID in ASSIGNABLE_ROLE_IDS", () => {
  assertThrows(
    () =>
      loadConfig({
        GUILD_ID,
        DISCORD_TOKEN: "token",
        ASSIGNABLE_ROLE_IDS: "not-a-snowflake",
      }),
    Error,
    "Invalid role ID",
  );
});

Deno.test("loadConfig parses a comma-separated ASSIGNABLE_ROLE_IDS", () => {
  const config = loadConfig({
    GUILD_ID,
    DISCORD_TOKEN: "token",
    ASSIGNABLE_ROLE_IDS: ` ${ROLE_ID}, ${OTHER_ROLE_ID} `,
  });
  assertEquals(config.assignableRoleIds, new Set([ROLE_ID, OTHER_ROLE_ID]));
});

Deno.test("loadConfig defaults PORT to 8000", () => {
  const config = loadConfig({
    GUILD_ID,
    DISCORD_TOKEN: "token",
    ASSIGNABLE_ROLE_IDS: ROLE_ID,
  });
  assertEquals(config.port, 8000);
});

Deno.test("loadConfig reads a custom PORT", () => {
  const config = loadConfig({
    GUILD_ID,
    DISCORD_TOKEN: "token",
    ASSIGNABLE_ROLE_IDS: ROLE_ID,
    PORT: "3000",
  });
  assertEquals(config.port, 3000);
});

Deno.test("loadConfig rejects a non-numeric PORT", () => {
  assertThrows(
    () =>
      loadConfig({
        GUILD_ID,
        DISCORD_TOKEN: "token",
        ASSIGNABLE_ROLE_IDS: ROLE_ID,
        PORT: "abc",
      }),
    Error,
    "Invalid PORT",
  );
});
