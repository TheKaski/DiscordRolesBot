import { assertEquals } from "@std/assert";
import { createApp } from "../src/app.ts";
import type { DiscordClient } from "../src/discordClient.ts";

/// MOCK DATA
const GUILD_ID = "123456789012345678";
const USER_ID = "223456789012345678";
const ROLE_ID = "323456789012345678";
const OTHER_ROLE_ID = "423456789012345678";
const ALLOWED_ROLE_IDS = new Set([ROLE_ID]);

function fakeRoles(overrides: Partial<DiscordClient> = {}): DiscordClient {
  return {
    assignRole: () => Promise.resolve(),
    removeRole: () => Promise.resolve(),
    ...overrides,
  };
}

async function withServer(
  roles: DiscordClient,
  run: (baseUrl: string) => Promise<void>,
  assignableRoleIds: ReadonlySet<string> = ALLOWED_ROLE_IDS,
) {
  const app = createApp(roles, GUILD_ID, assignableRoleIds);
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;

  try {
    await run(`http://localhost:${port}`);
  } finally {
    server.close();
  }
}

// Should be able to receive succesfull response when called with valid parameters:
Deno.test("PUT assigns a role and returns 204", async () => {
  let called: [string, string, string] | undefined;
  const roles = fakeRoles({
    assignRole: (guildId, userId, roleId) => {
      called = [guildId, userId, roleId];
      return Promise.resolve();
    },
  });

  await withServer(roles, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/${USER_ID}/roles/${ROLE_ID}`, {
      method: "PUT",
    });
    assertEquals(res.status, 204);
    await res.body?.cancel();
  });

  assertEquals(called, [GUILD_ID, USER_ID, ROLE_ID]);
});

// Should reveive a 400 bad request when called with invalid id:
Deno.test("PUT rejects invalid snowflakes", async () => {
  await withServer(fakeRoles(), async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/not-a-snowflake/roles/${ROLE_ID}`, {
      method: "PUT",
    });
    assertEquals(res.status, 400);
    await res.body?.cancel();
  });
});

// Should reject a request for unknown role ids:
Deno.test("PUT rejects a role that is not in the allow-list", async () => {
  const roles = fakeRoles();

  await withServer(roles, async (baseUrl) => {
    const res = await fetch(
      `${baseUrl}/api/${USER_ID}/roles/${OTHER_ROLE_ID}`,
      { method: "PUT" },
    );
    assertEquals(res.status, 403);
    await res.body?.cancel();
  });
});

// Should return 502 when discord API fails:
Deno.test("PUT returns 502 when Discord call fails", async () => {
  const roles = fakeRoles({
    assignRole: () => Promise.reject(new Error("missing permissions")),
  });

  await withServer(roles, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/${USER_ID}/roles/${ROLE_ID}`, {
      method: "PUT",
    });
    assertEquals(res.status, 502);
    const body = await res.json();
    assertEquals(body.error.includes("missing permissions"), true);
  });
});

// Should return 204 when removing a role
Deno.test("DELETE removes a role and returns 204", async () => {
  let called = false;
  const roles = fakeRoles({
    removeRole: () => {
      called = true;
      return Promise.resolve();
    },
  });

  await withServer(roles, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/${USER_ID}/roles/${ROLE_ID}`, {
      method: "DELETE",
    });
    assertEquals(res.status, 204);
    await res.body?.cancel();
  });

  assertEquals(called, true);
});
