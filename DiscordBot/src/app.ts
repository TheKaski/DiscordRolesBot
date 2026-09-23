import express, { type Request, type Response } from "express";
import type { DiscordClient } from "./discordClient.ts";

const SNOWFLAKE = /^\d{17,20}$/;

function isSnowflake(value: string): boolean {
  return SNOWFLAKE.test(value);
}

/* app.ts
 * create the app with REST API
 *  Params: discordClient, guildId, assignableRoleIds
 *  Checks userId and roleId of incoming API requests
 *  and calls the given discordClient to assign or remove a role from a user
 *  within the configured server with given guildId
 * */
export function createApp(
  discordClient: DiscordClient,
  guildId: string,
  assignableRoleIds: ReadonlySet<string>,
) {
  const app = express();

  app.put("/api/:userId/roles/:roleId", async (req: Request, res: Response) => {
    const { userId, roleId } = req.params;
    if (![userId, roleId].every(isSnowflake)) {
      res.status(400).json({
        error: "userId, and roleId must be valid Discord snowflakes",
      });
      return;
    }
    if (!assignableRoleIds.has(roleId)) {
      res.status(403).json({
        error: `Role ${roleId} is not assignable via this API`,
      });
      return;
    }

    try {
      await discordClient.assignRole(guildId, userId, roleId);
      res.status(204).send();
    } catch (error) {
      res.status(502).json({
        error: `Failed to assign role: ${(error as Error).message}`,
      });
    }
  });

  app.delete(
    "/api/:userId/roles/:roleId",
    async (req: Request, res: Response) => {
      const { userId, roleId } = req.params;
      if (![userId, roleId].every(isSnowflake)) {
        res.status(400).json({
          error: "userId, and roleId must be valid Discord snowflakes",
        });
        return;
      }
      if (!assignableRoleIds.has(roleId)) {
        res.status(403).json({
          error: `Role ${roleId} is not assignable via this API`,
        });
        return;
      }

      try {
        await discordClient.removeRole(guildId, userId, roleId);
        res.status(204).send();
      } catch (error) {
        res.status(502).json({
          error: `Failed to remove role: ${(error as Error).message}`,
        });
      }
    },
  );

  return app;
}
