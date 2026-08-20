# Bundled room-image provenance

The files in `dist/rooms/` were generated specifically for RoomCard and do not reuse room images from forks or other third-party repositories.

## Generation record

- Date: 2026-08-20
- Generator: OpenAI built-in image generation in Codex
- Mode: one independent generation per room
- Reference/input images: none
- Post-processing: resized to a maximum dimension of 1600 px and encoded as JPEG at quality 78 using macOS `sips`
- Content constraints: no people, pets, visible text, logos, trademarks, watermarks, readable screens, or recognizable artwork
- Intended use: responsive RoomCard header backgrounds with CSS `object-fit: cover`, a dark overlay, and white header text

## Prompt family

Each scene used the same visual direction: realistic architectural photography of an approachable contemporary European home, warm neutral colors, natural materials, restrained modern styling, soft diffused daylight, straight vertical lines, an eye-level wide-angle viewpoint, and calm low-detail space for header text. Composition was requested for wide responsive cover cropping. Scene-specific prompts identified the room and its characteristic furniture or architectural features.

Negative constraints excluded people, pets, text, signs, numbers, branding, watermarks, readable screens, recognizable artwork, famous designer objects, excessive luxury, fisheye distortion, malformed geometry, oversaturation, HDR halos, and a CGI appearance.

## Included scenes

Living room, kitchen, bedroom, bathroom, dining room, home office, children's room, hallway, guest room, garage, garden/patio, balcony, basement, laundry room, attic, and workshop.

## Distribution note

These are freshly generated outputs. Distribution remains subject to the applicable OpenAI service terms and the project's normal release review. This file records provenance and is not a legal warranty.

## SHA-256 checksums

```text
6d6c8425a420181daa4c11e238e2dc9e0dea98c8461ddc07ffa701b1433dc043  attic.jpg
176c25c66ce32523204b00ff4ea15c4dc96b968f5131848e4c07f4dbefb968c1  balcony.jpg
d69e249ef62122986cfdd2af1320255a48e6586bbf9cf35398c37665f1661243  basement.jpg
ce20a5db4c606601d48a5e628b7c479758a5df64989107ddb464342f5a63fd1b  bathroom.jpg
643b7b3bc3170f95cb415b03c7b3f57d69b9c5ef804162f5b7f0d6ca720df872  bedroom.jpg
1f75739bf59e324c504674be41e3cbecda6bd893dbf2e433cbdcfe025733c455  childrens-room.jpg
d2ea5e049a31a3ed97f51aaea3de38e11e2806db21060a1c6c896a5c727a2865  dining-room.jpg
fdeca09c0668b5e8d00ed27967a123f64e9e5dc3c385bfe78dc52dba40a18fee  garage.jpg
855bda5304cd8023675e5c0da2ee1592a641eff35ecfa7fbfef7d06c5f600dcc  garden-patio.jpg
fa6fb0e3c8863eedb67ca58fbe2a0b5e750c9c66b5642b71498aec560e6358ba  guest-room.jpg
0ba78a729b06b84c5eebad663709248268af9c93d91f947d632d6e706210df9e  hallway.jpg
75a9b2887e8798dbb8502ed429e821be7e41bf2666014cbcad0c925ec3c1fe0a  home-office.jpg
945b0964e9f626329234d9d9f12e91f7555a7be67aed7759c936ff5016156d8b  kitchen.jpg
4ca62263376e6a3db7bba022cf5e3ea3b7d3049bdcf60a502a779217bc1fbfb6  laundry-room.jpg
e8489da6d623a0d9a2a3861b51b7b5cda92003a0f5a2783ef0940dfe7917256b  living-room.jpg
af6910ac227bac7b3371a05f0d5d4cdcfc261bfbacdb6f0e6fa673b6581140a4  workshop.jpg
```
