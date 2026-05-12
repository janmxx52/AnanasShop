# Authentication API

Base URL: `/api/auth`

## Register

- POST `/api/auth/register`
- Body (JSON): `name`, `email`, `password`, `password_confirmation`, `phone?`, `device_name?`
- Response: `201` — `{ success: true, data: { token, expires_at, user } }`

Rules:
- `password` min 8, at least 1 uppercase, 1 lowercase, 1 number
- `email` unique

## Login

- POST `/api/auth/login`
- Body: `email`, `password`, `device_name?`
- Response: `200` — `{ success: true, data: { token, expires_at, user } }`

## Logout (current device)

- POST `/api/auth/logout` (Auth required)
- Revokes current access token

## Logout All Devices

- POST `/api/auth/logout-all` (Auth required)
- Revokes all personal access tokens for the user

## Profile

- GET `/api/auth/me` — current user
- PUT `/api/auth/me` — update profile (`name`, `phone`, `avatar` file)
- PUT `/api/auth/me/password` — change password (`current_password`, `password`, `password_confirmation`)

## Avatar upload (Cloudinary)

The API accepts avatar file uploads via multipart/form-data in `PUT /api/auth/me`.
If Cloudinary is configured, uploaded images are stored on Cloudinary; otherwise files are stored on local `public` disk.

Environment (Cloudinary)

- `CLOUDINARY_URL` or individual Cloudinary keys should be set in `.env` according to the Cloudinary SDK/package used.
