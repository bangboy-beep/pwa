# SmartQR Project Status

## Phase 9D-FIX — DEBUG ADMIN ROUTE REDIRECT (2026-10-01)

### Status: COMPLETE

### Problem
- Authenticated user with businesses was redirected to `/onboarding` when directly opening `/admin`, `/admin/menu`, `/admin/wifi`, `/admin/review`.
- `/onboarding` worked correctly and showed existing businesses.
- `/admin` dashboard sometimes worked but `/admin/*` sub-routes consistently redirected.

### Root Cause
The `BusinessProvider.fetchBusinesses()` function had a critical timing bug:

1. On page refresh, `AuthProvider` starts with `user=null, loading=true`
2. `BusinessProvider` initializes with `user=null`, `loading=true`
3. `BusinessProvider`'s `useEffect` fires (on `[user?.id]` change) → calls `fetchBusinesses()`
4. Inside `fetchBusinesses()`, the `if (!user)` branch was called → it **set `loading=false`** (clearing the loading state) even though no real fetch had occurred
5. `AuthProvider`'s `getSession()` resolves → `user` is set, `authLoading` becomes `false`
6. Now context `loading` = `authLoading(false) || loading(false)` = `false` — but `businesses` is still `[]`
7. `useAuthGuard`'s `useEffect` fires (deps: `user`, `isLoading` changed to false) → checks `businesses.length === 0` → true → **navigates to `/onboarding`**
8. The second `fetchBusinesses` (triggered by `user?.id` changing) is still in-flight or hasn't fired yet

The core bug: `setLoading(false)` was called when `user` was null, making the guard think loading was complete.

### Changes Made

**Files changed:**
1. `src/providers/BusinessProvider.tsx` — Fixed loading state management
2. `src/hooks/useAuthGuard.ts` — Simplified to use combined `businessLoading` only

**Exact logic changes:**

In `BusinessProvider.tsx`:
- **Removed**: `setLoading(false)` from the `!user` early-return branch in `fetchBusinesses()`
- **Added**: Early return when `authLoading` is true (don't set loading to false yet)
- **Added**: Early return when `!user` (without setting loading to false — keeps loading state true)
- **Added**: `lastFetchedUserIdRef` to prevent redundant re-fetches when user hasn't changed
- **Removed**: The `setSelectedAndPersist(null)` call from the `useEffect` — it was clearing sessionStorage before `fetchBusinesses` could check it
- **Added**: `useCallback` wrapper on `fetchBusinesses` for stable reference
- **Added**: Guard to prevent calling `setSelectedAndPersist` when `!user` or `authLoading`

In `useAuthGuard.ts`:
- **Changed**: Replaced separate `loading` (from auth) and `businessLoading` (from business) checks with single `isLoading = businessLoading` since `BusinessProvider.loading` already combines `authLoading || loading`
- **Removed**: Unused `authLoading` destructure from `useAuthContext()`

### Why `/onboarding` was being triggered
The redirect was triggered because `useAuthGuard`'s useEffect saw `loading=false` (due to `BusinessProvider` setting `loading=false` when user was still null) while `businesses.length === 0` (because the real fetch hadn't started yet). The combination of `loading=false` + `businesses.length === 0` + `user !== null` satisfied the redirect condition.

### Build Results
- `npm run build`: ✅ Success (no errors)
- `npx tsc --noEmit`: ✅ Success (no errors)
- `npm run lint`: ✅ Success (only pre-existing warnings, no new errors)
