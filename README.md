# AurelyStudio Manifestation & Action Planner

A local-first, undated web app built around **Manifest it. Break it down. Take one step today.**

## What is inside

- **Welcome:** an original 3D glass entrance asks for a local first name or nickname once; later cold opens and reloads greet you by name. Enter now skips the short greeting. Extra Calm and system reduced-motion keep the welcome still.
- **Today:** intention, calling-in note, one small action, top three actions, mood and energy, morning affirmation, evening reflection, daily streak, and a five-part 30-day journey.
- **Calendar:** live device-local date and time, a month/year picker, unlimited dated history, notes for any day, and a day view for timed actions, journal entries, wins, and manifestation practices. The 30-day journey is optional and separate from the continuing calendar.
- **Manifestations:** each dream becomes a project with a reason, desired date, success measure, future-self description, imagery, affirmations, milestones, linked actions, and progress calculated from completed steps.
- **Vision Board:** private image uploads, word cards, seven categories, and 12 original reusable SVG stickers. Open saved images in a large viewer, zoom with buttons or a pinch, drag to explore, and return to the full image with Fit.
- **Action Plan:** Today, This Week, This Month, Later, and Done; priority, optional date and local time, 5/15/30-minute estimate, and energy level. Click an action’s minutes or Focus on this to open its real timer; start, pause, resume, reset, or minimize it while navigating. Choose optional Gentle Rain, Ocean Waves, Warm Noise, or Soft Wind with volume, mute, and stop controls. These are original generated ambience, not nature recordings or therapies. A finished timer offers explicit action completion.
- **Journal and tools:** seven journal types including Scripting and Evidence/Wins; affirmations; seven guided manifestation techniques including 369 and optional 55×5 writing; up to eight habits; Future Self; Weekly Review; Monthly Reset; and progress archive.
- **Personalization:** 13 coordinated color palettes (Warm Sage, Soft Sanctuary, Dawn Blush, Pink Bloom, Midnight Ink, Desert Clay, Coastal Mist, Golden Ember, Rose Quartz, Lavender Haze, Blue Opal, Peach Aura, Porcelain Garden), with three independent finishes: Normal, 3D Glass, and Sculpted 3D; seven writing fonts for notes and reflections, with an optional font for each journal entry; three saved menu layouts (classic sidebar, compact icons, top navigation); and Extra Calm Mode. The AurelyStudio logo stays fixed.
- **Portability:** dated history, local JSON backup/restore, browser print/PDF views, and installable PWA behavior on HTTPS or localhost.

## Open the app

Serve this folder as a static website and open its `index.html` at the site root. Any static host can serve the files. On HTTPS or localhost, the browser can install the PWA and cache the app shell for offline use after the first load.

Data is stored in **this browser's local storage**. There is no account, cloud synchronization, or automatic transfer between devices. Use **Data & Print → Download backup** before changing browsers/devices or clearing browser data, then restore the JSON file on the other device.

### Updating from an earlier build

When the app is updated at the same site in the same browser, existing planner entries and 369 logs remain available. Earlier Theme Studio presets are mapped to the closest original preset; previous custom colors remain in the backup data but no longer control the interface. Version 3 added writing-font and menu-layout preferences. Version 4 fixes action reopening, saved-record search, journey date boundaries, and backup validation. Version 5 adds the continuing local calendar, daily notes, and optional task times while preserving older records. Version 6 fixes narrow-screen calendar layout and refreshes branded metadata and offline assets. Version 7 adds a whole-page Pink Bloom theme, Sacramento and font selectors beside guided writing, and repairs rejected edits, malformed links, historical date handling and backup validation. Version 8 adds the optional Soft Sanctuary 3D glass theme and keeps AurelyStudio branding visible in the tablet header. Version 9 adds three independent material finishes, four new glass-inspired palettes and Porcelain Garden, and restores the sunset hero in every glass look. Existing Soft Sanctuary preferences migrate to 3D Glass. Download a backup before replacing an older build.

## Project files

- `index.html`, `app.js`, `styles.css`, `src/data.js`: app
- `welcome.css`, `src/welcome.js`: personalized 3D glass entrance
- `focus.css`, `src/focus-session.js`: action timer and optional generated ambience
- `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`: PWA
- `assets/logo.svg`: fixed official AurelyStudio logo
- `assets/hero-sunset.png`, `assets/botanical-still.png`: original app photography
- `assets/stickers/`: 12 original Vision Board stickers
- `assets/fonts/`: self-hosted fonts and their SIL Open Font License notices

This is an app build, not a published Etsy listing. Describe only verified features and exact included files in any future listing.

Release verification also covers offline data reset under a project subpath and the following-Monday deadline for Weekly Review actions.

Choose a color palette independently from the finish. Normal uses familiar clean surfaces. 3D Glass uses luminous edges, translucent panels and raised controls; the original sunset hero photo appears in every glass palette. Sculpted 3D uses opaque porcelain surfaces, sculpted shapes, raised controls and inset details. The official gold AurelyStudio logo remains unchanged in each finish. Writing-font, menu and Extra Calm preferences remain independent.

Version 10 adds an accessible saved-image viewer to Vision Board, Today and linked manifestation images. The viewer uses the existing saved image without changing stored records; keyboard controls, pinch zoom and image panning are available. Close it with the Close button, Escape or the surrounding backdrop.

Version 11 adds the personalized 3D glass entrance and task-linked 5/15/30-minute timer with four optional generated sound textures. Your name is part of the existing local profile and backup; no new account or data schema is introduced. Timer/audio state is session-only, survives internal page changes, and ends when the page is closed or refreshed. An installed app returning after at least 30 seconds in the background shows the short entrance again; ordinary browser tab switches do not. The user’s saved name is requested again only if it is absent.
