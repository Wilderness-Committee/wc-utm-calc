# Wilderness Committee UTM Link Generator

A UTM Link Generator web app built with Next.js and Tailwind CSS, backed by SQLite. Team members generate UTM links from a form whose dropdown options, field tooltips, and per-source auto-fill campaign IDs are all managed through an admin panel.

## Features

- Form for UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, etc.) plus OTG/TBZ Campaign IDs.
- Dropdown options for URL Handle, UTM Source, and UTM Medium are stored in SQLite and editable in the admin panel.
- Per-field tooltips, editable in the admin panel.
- Per-source auto-fill: selecting a UTM Source can auto-populate the OTG/TBZ Campaign IDs.
- Two-tier auth: a site-wide password for the generator and a separate admin password for the `/admin` panel.

## Routes

- `/` — the generator (requires site password)
- `/admin` — admin panel (requires admin password)
- `/login`, `/admin/login` — password gates

## Environment variables

| Variable          | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `SESSION_SECRET`  | Secret used to sign auth cookies. Set to a long random string. |
| `SITE_PASSWORD`   | Password for the main generator page.                          |
| `ADMIN_PASSWORD`  | Password for the `/admin` panel.                               |
| `DATABASE_PATH`   | Path to the SQLite file. In production point at a mounted volume, e.g. `/data/utm.db`. Defaults to `./data/utm.db`. |

The database is created and seeded automatically on first boot from the previously hardcoded dropdown values and the `action_alert` auto-fill IDs.

## Getting Started

```bash
npm install

SESSION_SECRET=dev SITE_PASSWORD=site ADMIN_PASSWORD=admin npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Deployment (Railway)

The app builds as a standalone Next.js server via the included `Dockerfile`.

1. Create a Railway project from this repo.
2. Add a **volume** mounted at `/data`.
3. Set env vars: `SESSION_SECRET`, `SITE_PASSWORD`, `ADMIN_PASSWORD`, and `DATABASE_PATH=/data/utm.db`.
4. Deploy. The SQLite DB persists on the volume across redeploys.

## License

This project is licensed under the MIT License.