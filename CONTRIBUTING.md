# Contributing to HemmaOS

Thanks for helping build a private, family-friendly home server! This guide covers how
to get set up, the conventions we follow, and how to send a change.

## Ways to contribute

- **Report bugs / request features** — open an
  [issue](https://github.com/SamanTheBoss/HemmaOS/issues). Include what you did, what you
  expected, what happened, and (for bugs) the output of `docker compose logs api`.
- **Translations** — improve or complete the Swedish/English strings in
  `apps/web/src/lib/i18n.ts`.
- **New apps** — add an app definition so families can install it in one tap.
- **Docs** — clarify setup, testing, or the app catalog.

## Getting set up

```bash
git clone https://github.com/SamanTheBoss/HemmaOS.git
cd HemmaOS
pnpm install

pnpm --filter @home-os/api test     # unit tests (any OS)
pnpm --filter @home-os/web dev       # frontend at http://localhost:3000
```

The monorepo uses **Turborepo + pnpm**:

- `apps/web` — Next.js dashboard (Tailwind, ultra-dark, mobile-first).
- `apps/api` — Express backend (talks to Docker + host tools).
- `packages/shared` — shared Zod schemas/types.
- `deploy/` — Docker, Caddy, `install.sh`, `bootstrap.sh`.

For full end-to-end testing (real Docker/Tailscale), see [`deploy/TESTING.md`](deploy/TESTING.md).

## Conventions

- **Language:** all user-facing UI copy must exist in **both Swedish and English** via
  `i18n.ts` and be read with `useI18n()` — never hard-code visible strings in components.
  The UI defaults to English.
- **Naming:** the product is **HemmaOS** (hardware: **HemmaBox**). Don't introduce other
  brand names in user-facing text.
- **Design:** reuse the existing tokens and components (dark surfaces, `accent`→`violet`
  gradient, `rounded-2xl` cards). Match the surrounding code's style.
- **Privacy first:** never add anything that opens the box to the internet by default, or
  that grants standing remote access. Support tunnels are opt-in and self-closing.
- **TypeScript:** keep `pnpm --filter @home-os/api test` and `tsc --noEmit` green in both
  apps before opening a PR.

## Adding a new app

1. Add a Docker Compose template under `deploy/apps/<app>/docker-compose.yml`, joined to
   the shared `hemmaos` network (`external: true`).
2. Add an entry to `apps/api/src/modules/apps/apps.definitions.ts`
   (`containerName`, `composeFile`, `defaultPort`, `proxyPath`, any `envFields`).
3. Add the card metadata (icon, gradient, Swedish/English description) to
   `apps/web/src/lib/app-definitions.ts`.
4. Copy the template in `deploy/install.sh` and add a route to the `Caddyfile` if it needs
   proxying.

## Sending a change

1. Branch off `main`: `git checkout -b feat/short-description`.
2. Make focused commits with clear messages.
3. Ensure tests + typecheck pass.
4. Open a pull request describing **what** changed and **why**, with screenshots for UI
   changes.

## License

By contributing you agree that your contributions are licensed under the project's
[CC BY-NC-SA 4.0](LICENSE) license.
