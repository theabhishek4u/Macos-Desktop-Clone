# Task 2-b: Password System Agent

## Task
Add a REAL password system to the login screen

## Work Completed

### 1. Auth Store (`/src/store/auth-store.ts`)
- Zustand store with password management
- Base64 encoding for basic obfuscation
- localStorage persistence via `macos-auth-store` key
- Functions: setPassword, setPasswordHint, authenticate, removePassword, setRequireLogin

### 2. LoginScreen.tsx (`/src/components/macos/LoginScreen.tsx`)
- Real password validation using auth store
- Auto-login when no password set (1.5s)
- Password required when isPasswordSet === true
- Shake animation on incorrect password (CSS keyframes)
- 3 failed attempts → 30 second lockout with countdown
- Password hint display
- Submit arrow button on password input
- Security notification banner after first login
- Lock screen trigger via `triggerLockScreen()` export
- `useLoginScreen()` hook includes `logout` function
- Skip boot on re-lock (hasBooted state)

### 3. SystemPreferences UsersPane
- Full password management UI
- Change/Set Password dialog with current/new/confirm/hint fields
- Remove Password dialog with current password verification
- Require login toggle
- Password status indicator (green/amber)

### 4. MenuBar Lock Screen
- Apple menu "Lock Screen" item calls `triggerLockScreen()`
- Triggers logout + show login screen (skips boot)

## Files Modified
- `/src/store/auth-store.ts` (new)
- `/src/components/macos/LoginScreen.tsx` (rewritten)
- `/src/components/macos/apps/SystemPreferences.tsx` (UsersPane enhanced)
- `/src/components/macos/MenuBar.tsx` (Lock Screen handler)

## Lint Status
- All new code passes lint
- 5 pre-existing errors in Finder.tsx (not introduced by this task)
