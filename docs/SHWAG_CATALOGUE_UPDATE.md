# SHWAG catalogue update — 30 October 2026

## Requested public range
- SHWAG Hoodie — temporary display price £50
- SHWAG Tshirt — temporary display price £50
- SHWAG Hat — temporary display price £50

The three items remain enquiry-only. The £50 values are placeholders and are not a confirmed final retail price or an online checkout offer.

## Staff HQ product images
The Staff HQ SHWAG product editor now supports selecting an image file, previewing it, and saving it with the product. The browser converts uploads to WebP, constrains the longest edge to 1,400px, and rejects optimised data URLs larger than 1.5 MB. The resulting data URL is stored in the existing `swag_products.image_url` text field in Neon. An ordinary HTTPS image URL remains supported too.

This is a lightweight database-backed upload for the small SHWAG catalogue, not a general-purpose media library/object-storage service. Keep images optimised and small; if the catalogue grows substantially, move binary assets to managed object storage and store only their URLs in Neon.

## Database change still required
`db/migrations/20261030_shwag_range_products.sql` is prepared but has **not** been applied. It deactivates the previous T-shirt/gym-bag/water-bottle catalogue entries, upserts the three requested products, and sets each temporary price to £50. Apply only after review and explicit approval; no shared or production Neon database has been changed by this PR.

## Release status
Source changes only. Build, typecheck, interactive Staff HQ upload, public catalogue rendering, and migration/RLS verification remain to be run. No deployment or production database migration is included.
