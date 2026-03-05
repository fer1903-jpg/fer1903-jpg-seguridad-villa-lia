# Seguridad Villa Lía (PWA)

## Requisitos
- Supabase (Free) con el SQL ya aplicado (tablas + funciones + policies).
- Vercel (Free) conectado a este repo.
- Proveedor de tiles (ej. Thunderforest) con API key.

## Variables de entorno (Vercel)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_TILE_URL

## Flujo QR
Generar QRs desde /admin (moderator/admin) y repartirlos.
El QR abre: /onboard?invite=...

## Roles
Por seguridad: el rol se asigna manualmente en Supabase Table Editor -> profiles.role
(neighbor / moderator / admin)
