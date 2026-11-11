# NoteVault — Backend

Note-taking REST API with JWT auth and User/Admin roles.

## Links
- Backend: https://notevault-backend-ddoo.onrender.com
- Frontend: https://note-vault-frontend.vercel.app

## Indexes (6 total — each supports a specific query)

| Collection | Index | Query |
|---|---|---|
| users | `{ email: 1 }` unique | login lookup |
| users | `{ createdAt: 1 }` | admin list users |
| users | `{ interests: 1 }` | group-by-interest `$unwind` |
| notes | `{ owner: 1, createdAt: -1 }` | list my notes, newest first |
| notes | `{ createdAt: -1 }` | admin list all notes |
| posts | `{ author: 1 }` | posts-by-user `$match` |

`_id` indexes are automatic. Nothing else is indexed — no index without a query.

## Aggregations

**Scenario 1** — `GET /api/insights/by-interest`
One `User.aggregate()` call: `$unwind interests` → `$group by interests` → `$sort` → `$project`.

**Scenario 2** — `GET /api/posts/by-user/:id`
One `Post.aggregate()` pipeline: `$match author` → `$lookup users` → `$unwind authorInfo` → `$project` → `$sort`. Public endpoint.

## Security
- bcrypt (10 salt rounds) — passwords stored as `$2b$10$...`
- JWT in Authorization header, 7-day expiry
- Owner-scoped note queries — cross-user access returns 404
- `.select("-password")` on every user response
- Admin routes: `protect` then `adminOnly`
- Admin can't demote/delete self
- Cascade delete user → their notes

## Pagination
`GET /api/notes`, `/api/admin/users`, `/api/admin/notes` all return `{ page, limit, total, totalPages, items }` with `?page=&limit=`.

## Bootstrap first admin
Register a user → Atlas → change `role` to `"admin"` → re-login.

## Tradeoffs
- Atlas whitelist `0.0.0.0/0` (Render free tier has no fixed IP)
- Render cold start ~30s after 15 min idle (UptimeRobot pings `/health` every 5 min)
- No refresh tokens, no rate limiting (fine for task scope)

## Run locally

Create a `.env` file with `PORT`, `JWT_SECRET`, `MONGO_URI`, then run `npm install` and `npm run dev`.