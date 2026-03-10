---
phase: 18-client-app-improvements
plan: 01
subsystem: ui
tags: [supabase-storage, file-upload, avatar, profile, react]

# Dependency graph
requires:
  - phase: 15-client-app-fixes
    provides: profile page and updateProfileAction already implemented
provides:
  - Avatar photo upload to Supabase Storage bucket avatars
  - SQL migration for avatars bucket with public SELECT and authenticated INSERT/UPDATE policies
  - File input trigger on avatar tap with camera/gallery access
  - Instant preview after upload via getPublicUrl
  - userId prop threading from server component to client form
affects: [19-trainer-settings-modals]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pass userId from server page component as prop to client component — avoids client-side auth fetch"
    - "supabase.storage.from('avatars').upload(path, file, { upsert: true }) then getPublicUrl for instant preview"
    - "Hidden file input with ref triggered by button click — avoids native input styling issues"

key-files:
  created:
    - supabase/migrations/20260310173000_create_avatars_bucket.sql
  modified:
    - app/(client)/profile/edit-profile-form.tsx
    - app/(client)/profile/page.tsx

key-decisions:
  - "upload path: avatars/<userId>/<timestamp>.<ext> — namespaced by user, unique by timestamp, no collisions"
  - "capture='environment' on file input — hints mobile browser to open camera first, but still allows gallery"
  - "upsert: true on storage upload — allows re-upload without delete step"
  - "userId passed as prop from server page — no client-side supabase.auth.getUser() call needed"

patterns-established:
  - "Avatar upload: hidden file input ref triggered by clickable avatar div or text button"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-03-10
---

# Phase 18 Plan 1: Subida de foto de perfil Summary

**Avatar photo upload to Supabase Storage with instant preview, camera/gallery access via file input, and SQL migration for avatars bucket policies**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-10T16:25:36Z
- **Completed:** 2026-03-10T16:27:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created SQL migration for avatars storage bucket with public SELECT, authenticated INSERT, and owner-scoped UPDATE policies
- Replaced URL text input in EditProfileForm with hidden `<input type="file" accept="image/*" capture="environment" />` triggered by avatar tap or "Cambiar foto" button
- Added `uploading` spinner state while file uploads to `avatars/<userId>/<timestamp>.<ext>` path
- Set avatarUrl from `getPublicUrl` after successful upload for instant preview
- Threaded `userId` prop from server page component to client form (avoids client-side auth call)

## Task Commits

Each task was committed atomically:

1. **Task 1: Migración SQL - Bucket de Avatares** - `0c2ab75` (chore)
2. **Task 2: Implementar subida de foto en EditProfileForm** - `70af853` (feat)

## Files Created/Modified
- `supabase/migrations/20260310173000_create_avatars_bucket.sql` - Creates avatars bucket and storage policies
- `app/(client)/profile/edit-profile-form.tsx` - Replaced URL input with file upload; added uploading state, camera/gallery trigger, Supabase Storage integration
- `app/(client)/profile/page.tsx` - Added userId prop to EditProfileForm

## Decisions Made
- Upload path `avatars/<userId>/<timestamp>.<ext>` — namespaced by user, unique by timestamp, no collisions
- `capture="environment"` on file input — hints mobile browser to open camera, while gallery remains accessible
- `upsert: true` on storage upload — allows re-upload without a prior delete step
- `userId` passed as prop from server component — consistent with pattern of no client-side auth fetching

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
Run the SQL migration in the Supabase SQL Editor to create the avatars bucket and policies if not already created:
- File: `supabase/migrations/20260310173000_create_avatars_bucket.sql`

## Next Phase Readiness
- Avatar upload fully functional and integrated with existing `updateProfileAction` save flow
- Phase 18 Plan 2 can proceed independently

## Self-Check: PASSED

- FOUND: supabase/migrations/20260310173000_create_avatars_bucket.sql
- FOUND: app/(client)/profile/edit-profile-form.tsx
- FOUND: app/(client)/profile/page.tsx
- FOUND: .planning/phases/18-client-app-improvements/18-01-SUMMARY.md
- FOUND commit: 0c2ab75 (migration)
- FOUND commit: 70af853 (avatar upload)

---
*Phase: 18-client-app-improvements*
*Completed: 2026-03-10*
