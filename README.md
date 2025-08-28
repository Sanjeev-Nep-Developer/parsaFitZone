# FITZONE PARSA — Membership Manager (Updated)

Features:
- Admin login (JWT, HttpOnly cookie). Only login page visible before authentication.
- Dashboard shows Total Users, Expiring <=5 days, Expired counters and badges in nav.
- Members: Add, Edit (extend membership from last expiry), Delete.
- Responsive UI.

Quick start:
1. Copy `.env.example` to `.env` and fill `MONGODB_URI` and `JWT_SECRET`.
2. npm install
3. npm run seed:admin  # creates admin/admin123
4. npm run dev
