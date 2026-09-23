import { createRestManager } from "@discordeno/rest";

export interface DiscordClient {
  assignRole(guildId: string, userId: string, roleId: string): Promise<void>;
  removeRole(guildId: string, userId: string, roleId: string): Promise<void>;
}

/* discordClient.ts
 * create a interface for the discordClient with
 * assignRole and removeRole methods.
 * */
export function createDiscordClient(token: string): DiscordClient {
  const rest = createRestManager({ token });

  return {
    async assignRole(guildId, userId, roleId) {
      await rest.addRole(guildId, userId, roleId, "Assigned via role API");
    },
    async removeRole(guildId, userId, roleId) {
      await rest.removeRole(guildId, userId, roleId, "Removed via role API");
    },
  };
}
