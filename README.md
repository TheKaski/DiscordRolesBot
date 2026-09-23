# DiscordBotWithDeno

A project for building a Deno based REST API used for interacting with a role
switching discord bot. The project requires a Discord bot token, a guild id and
a list of role ids which it can assign on the server it is targeted for with the
guild id and invitation.

## Stack

- **Deno** — runtime, test runner, formatter, linter (no separate tooling
  needed).
- **Express** (via `npm:` specifier) — REST routing.
- **[@discordeno/rest](https://discordeno.js.org/)** (via `npm:` specifier) —
  typed client for Discord's REST API, Deno-native project, no gateway
  dependency pulled in.

## Setup

To use this project you need a discord server and a discord bot created in the
discord developer portal. The setup process in details is:

1. Create a Discord application + bot at
   https://discord.com/developers/applications.
2. Invite the bot to your server with the `Manage Roles` permission, and make
   sure the bot's own role sits **above** any role you want it to assign
   (Discord enforces role hierarchy).
3. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` and
   `ASSIGNABLE_ROLE_IDS` (comma-separated role snowflakes this API is allowed to
   touch — required, fails closed if unset).

## Commands

```sh
deno task dev    # run the API with file-watching
deno task test    # run the test suite
deno fmt          # format
deno lint         # lint
deno check DiscordBot/*.ts   # type-check
```

## API

| Method | Path                         | Effect                 |
| ------ | ---------------------------- | ---------------------- |
| PUT    | `/api/:userId/roles/:roleId` | Assigns the role (204) |
| DELETE | `/api/:userId/roles/:roleId` | Removes the role (204) |

All three path params must be valid Discord snowflakes (17-20 digit numeric
IDs), otherwise the API responds `400`. If `roleId` isn't in
`ASSIGNABLE_ROLE_IDS`, it responds `403` — the API only ever touches roles that
have been explicitly allow-listed, so it can't be used to grant or revoke
arbitrary (e.g. admin/moderator) roles even if something upstream is
misconfigured. A failure calling Discord (bad token, missing permissions, role
below the bot's role, etc.) responds `502` with the underlying error message.

## Docker

A `Dockerfile` is provided so the API can be run on any server without
installing Deno.

Configuration is passed in at runtime via environment variables

```sh
docker run -d \
  -p 8000:8000 \
  -e DISCORD_TOKEN=your-bot-token \
  -e GUILD_ID=your-guild-id \
  -e ASSIGNABLE_ROLE_IDS=role-id-1,role-id-2 \
  ghcr.io/<owner>/<repo>:latest
```

To build locally instead:

```sh
docker build -t discord-bot .
```
