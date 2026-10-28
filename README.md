# candl3

A fully customizable music listening page. Music is streamed from the [Internet Archive](https://archive.org), and every user designs their own page with widgets, backgrounds and animations.

The Internet Archive serves its audio files with CORS headers, so playback runs through the Web Audio API: the equalizer and visualizers work on the real audio signal.

## Usage

- **Edit**: Drag widgets, resize them from their edges, duplicate or remove them. Click a widget to open its settings.
- **Customize**: Add widgets and change the theme, background, animations and presets.
- **Undo / Redo**: The arrows in the toolbar or Ctrl+Z / Ctrl+Y.
- **Page**: The page scales to the screen height and new widgets go into free space. In the Theme tab you can make the page taller (1–4 screens) or fit all widgets onto one screen.
- **Phones**: Widgets stack in a single column with their own order (reorder with the arrows in edit mode), a mini player stays at the bottom, and playback can be controlled from the lock screen.
- **Languages**: English (default), Türkçe, Español, Deutsch, Français.
- The design is saved automatically in the browser and can be exported/imported as JSON.

## Widgets (15)

| Widget | Description |
|---|---|
| Player | Play/pause, previous/next, shuffle, repeat, progress, volume |
| Now Playing | Cover, title, artist, album |
| Library | Internet Archive search, genre tags, albums; add your own MP3 files |
| Queue | Upcoming tracks |
| Equalizer | 10 bands with presets (Bass Boost, Vocal, Rock, Lo-fi…) |
| Music Circle | Beat ring spinning around the cover (bars / wave) |
| Spectrum | Frequency bars with mirror, gradient and peak lines |
| Waveform | Oscilloscope |
| Vinyl | Spinning record with tonearm that reacts to bass |
| VU Meter | Level meter |
| Clock, Text, Image, Notes | For personalizing the page |

Settings shared by every widget: panel background, padding, animation (float, pulse with beat, glow with beat, sway) and height on phones.

## Animation layers (10)

Stars, particles, snow, rain, bubbles, fireflies, shooting stars, beat rings, aurora and bottom spectrum. Each has color, density, speed, visibility and react-to-music settings, and they can be stacked.

## Theme and background

- Accent and text color, 12 fonts, panel color/opacity, glass blur, corner radius, spacing, border, shadow
- Background: solid color, (animated) gradient, image/GIF or video link, file upload; darken, blur, zoom with beat
- 8 presets: Night Purple, Neon City, Lo-fi Room, Paper, Ocean, Snowy Night, Retro Arcade, Minimal Black
- Reset the layout only, or reset everything (design, equalizer, volume, queue)

## Development

```bash
npm install
npm run dev
```

## Deployment

Live site: **https://candl3.com** (InfinityFree).

`npm run build` produces the `dist/` folder. The site is fully static and uses relative paths, so it works on any static host, at a domain root or in a sub-folder.

### Uploading to InfinityFree

1. **SSL first:** In the InfinityFree Client Area → your account → *SSL Certificates*, request a free certificate for `candl3.com` (and `www.candl3.com`), add the CNAME records it asks for, then click *Install*. Check that `https://candl3.com` opens without a warning.
2. Run `npm run build`.
3. Upload the **contents** of `dist/` (including the hidden `.htaccess` file) into `htdocs/` with the File Manager or FTP, and delete the host's default files.
4. `.htaccess` redirects every visitor to `https://candl3.com`.

Renew the certificate from the panel before it expires. Once HTTPS has been working reliably, you can remove the `#` in front of the `Strict-Transport-Security` line in `.htaccess`.

### Other options

- **GitHub Pages:** Set *Settings → Pages → Source* to *GitHub Actions*, then run the *Deploy to GitHub Pages* workflow manually from the Actions tab.
- **Vercel / Netlify:** Import the repository; Vite is detected automatically (`npm run build`, output `dist`).

## Tech stack

React, TypeScript, Vite, Zustand, react-grid-layout, Web Audio API, Internet Archive API
