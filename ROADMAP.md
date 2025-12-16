# Project Roadmap: YouTube Watch Party App

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Firebase Realtime Database (for sync & presence)
- YouTube IFrame Player API

## Color Scheme (YouTube-inspired)

**Default: Light Mode**
- Primary red: #FF0000
- Background: #FFFFFF (light mode default)
- Surface/gray: #F9F9F9 (cards), #E5E5E5 (hover), #CCCCCC (borders/text secondary)
- Text primary: #0F0F0F
- Text secondary: #606060
- Accents: #FF0000 (buttons, highlights)

**Dark Mode (toggleable)**
- Primary red: #FF0000
- Background: #0F0F0F
- Surface/gray: #272727 (cards), #3F3F3F (hover), #606060 (borders/text secondary)
- Text primary: #FFFFFF
- Text secondary: #AAAAAA
- Accents: #FF0000 (buttons, highlights)

**Theme Toggle**
- Default: Light mode
- Toggle button/switch in UI (header or sidebar)
- Persist preference in localStorage

## Project Structure

```
app
  /page.tsx                 → Home (Create/Join Room)
  /room/[roomId]/page.tsx   → Main Room Page
/components
  VideoPlayer.tsx
  RoomSidebar.tsx
  VideoInput.tsx
  UserList.tsx
/lib
  firebase.ts
  youtube.ts               → YT utils
/types
  index.ts                  → RoomState, User types
```

## Phase 1: Setup & Home Page (1-2 hours) [COMPLETED]

- [x] Create Next.js app with TypeScript
  - `npx create-next-app@latest --typescript`
- [x] Install dependencies
  - `npm install firebase tailwindcss postcss autoprefixer`
  - `npx tailwindcss init -p`
  - `npx shadcn-ui@latest init` (accept defaults, set base colors to match YouTube)
- [x] Configure Tailwind (tailwind.config.ts)
  - Enable dark mode: `darkMode: 'class'`
  - Add custom colors for both themes:
    ```TypeScript
    theme: {
      extend: {
        colors: {
          ytRed: '#FF0000',
          // Light mode (default)
          ytBg: '#FFFFFF',
          ytSurface: '#F9F9F9',
          ytGray: '#E5E5E5',
          ytTextSecondary: '#606060',
          // Dark mode (via dark: prefix)
          dark: {
            ytBg: '#0F0F0F',
            ytSurface: '#272727',
            ytGray: '#3F3F3F',
            ytTextSecondary: '#AAAAAA',
          },
        },
      },
    }
    ```
- [x] Add shadcn components
  - `npx shadcn-ui@latest add button input card form label dialog`
- [x] Set up theme toggle
  - Use next-themes for theme management
  - `npm install next-themes`
  - Configure ThemeProvider in root layout
  - Add theme toggle component (sun/moon icon)
- [x] Create Firebase project
  - Go to firebase.google.com → New project
  - Enable Realtime Database (start in test mode)
  - Copy web config
- [x] Create `/lib/firebase.ts`
  - Export initialized app, db
- [x] Build Home Page (`/app/page.tsx`)
  - Two cards: "Create Room" and "Join Room"
  - Create: Generate random 6-char roomId → navigate to `/room/[roomId]`
  - Join: Input roomId + optional password → validate → navigate
  - Use shadcn Card, Button, Input, Form
  - Background: ytBg (light) / dark:ytBg (dark), text adapts to theme
  - Include theme toggle button in header/nav

## Phase 2: Room Page Layout (1 hour) [COMPLETED]

- [x] Create `/app/room/[roomId]/page.tsx`
  - Fetch roomId from params
  - Layout: flex row
  - Left: Video player (70-80% width) + VideoInput bar below
  - Right: Sidebar (UserList + basic controls)
- [x] Add components
  - `VideoPlayer.tsx` (iframe placeholder for now)
  - `VideoInput.tsx` (input for YT URL + submit button)
  - `UserList.tsx` (placeholder list)
  - `RoomSidebar.tsx` (wrap UserList)
- [x] Style with Tailwind
  - Main container: `bg-ytBg dark:bg-dark-ytBg text-ytText dark:text-white min-h-screen`
  - Video area: `bg-black rounded-lg overflow-hidden`
  - Sidebar: `bg-ytSurface dark:bg-dark-ytSurface w-80 p-4`
  - Buttons: `bg-ytRed hover:bg-red-700`
  - Theme toggle accessible in sidebar/header

## Phase 3: YouTube IFrame Integration (1-2 hours) [COMPLETED]

- [x] Create `/lib/youtube.ts`
  - Function to extract videoId from URL
  - Load YT IFrame API script dynamically
- [x] Implement `VideoPlayer.tsx`
  - `div id="yt-player"`
  - `useEffect` to init `YT.Player` when videoId exists
  - Expose player instance via ref
  - Events: `onReady`, `onStateChange`
  - `playerVars`: `enablejsapi=1`, `controls=1`, `rel=0`
- [x] Add `VideoInput.tsx`
  - Input field + button
  - On submit: extract videoId → update Firebase room state (currently local state updates, Firebase in Phase 4)

## Phase 4: Firebase Sync & State (2-3 hours)

- Define Firebase structure:
  ```
  /rooms
    /{roomId}
      password: string | null
      videoId: string | null
      isPlaying: boolean
      currentTime: number
      lastUpdate: number (timestamp)
      users: {
        [userId]: {
          name: string
          connected: boolean
        }
      }
  ```
- Create `types/index.ts` for RoomState
- In `/room/[roomId]/page.tsx`
  - Generate random userId + prompt for name (use Dialog)
  - Connect to Firebase ref: `rooms/{roomId}`
  - `onValue` listener → update local state (videoId, isPlaying, currentTime)
  - On mount: set user `connected=true`, on disconnect: remove user
- Sync logic in `VideoPlayer.tsx`
  - When local state changes → control player (play/pause/seekTo)
  - On player state change (play/pause/buffer): if user initiated → update Firebase
  - Periodic sync: every 5s if playing, update currentTime in DB
  - On join mid-video: seek to currentTime
- Password protection
  - On join: read password from DB → compare → redirect if wrong

## Phase 5: Presence & Polish (1-2 hours)

- `UserList.tsx`
  - Display users from Firebase
  - Show connected status
- Handle edge cases
  - Video end → pause + reset time
  - Invalid videoId → error toast
  - No video yet → show placeholder
  - Autoplay blocked → show "Click Play to start" overlay
- Add shadcn Toast for notifications
- Theme toggle implementation
  - Ensure all components respect theme (light/dark)
  - Test theme persistence across page reloads
- Responsive design
  - Mobile: stack video above sidebar

## Phase 6: Testing & Deploy (1 hour)

- Test locally
  - Open multiple tabs → create/join → test sync
  - Test pause, seek, new video, late join
- Secure Firebase (final step before share)
  - Update rules to require password if set
  - Limit read/write to room members
- Deploy to Vercel
  - Add Firebase config as env vars
  - Deploy → share link with parents

## Total Estimated Time: 8-12 hours

**Approach:**
- Start with Phase 1-2 → get basic room + layout working
- Then Phase 3 → video loads
- Then Phase 4 → sync magic happens

