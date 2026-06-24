## Summary

- Redesign `/perfil` as profile settings with avatar upload, structured name fields, bio, city, and dropzone
- Mock persistence via `profileStorage` (`t2f_mock_profile_<userId>`) with `AuthContext.updateProfile`
- Public profile preview modal; avatar reflected in header `UserMenu`

## Changes

| Area | Details |
|------|---------|
| Storage | `lib/profileStorage.ts` — single write path for future API swap |
| Components | `ProfileAvatarUpload`, `ProfileForm`, `ProfilePublicPreview`, `Textarea` |
| Auth | `AuthUser.avatarUrl`, `updateProfile()`, enrich on login/`/me` |
| UX | Display name auto-suggest, pt-BR validation, save/cancel/preview |

## Test plan

- [ ] Log in → `/perfil` — form shows with name fields, bio, city, dropzone
- [ ] Upload avatar (JPG/PNG/WebP ≤500 KB) — appears in header menu after save
- [ ] Save profile — refresh page — values persist
- [ ] “Ver perfil público” / “Pré-visualizar” — modal shows avatar, bio, location
- [ ] Invalid name or oversized image — pt-BR error messages
- [ ] Cancel resets form to last saved state
- [ ] `/configuracoes` unchanged
- [ ] `npm run build` passes
