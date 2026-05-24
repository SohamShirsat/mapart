<div align="center">
  <img src="logo.png" width="120" alt="mapart logo" />

# mapart

*Draw with your feet.*

</div>

<br>

I run most mornings, and at some point I got curious about GPS art — those traces on Strava that form words and shapes when you're done. I looked for something that could plan the route in advance so I could just follow it, and everything I found either required drawing the path manually or was buried behind a paywall. That was frustrating enough that I spent a few weekends building this instead. Turns out converting font glyphs into GPS coordinates is a more interesting problem than it looks.

---

## The idea

GPS art is when your running route, viewed from above, draws something — a word, a shape, a face. People do it by mapping roads manually or improvising mid-run. The result on Strava looks intentional. Most of the time it isn't.

Mapart skips the manual work. You type a word or pick a shape, choose the neighborhood you'll run in, and the app generates a route that follows real streets and approximates what you typed. You download a GPX file. You run it. The shape was decided before you laced up.

---

## Why so simple

Mapart generates a route and stops there. It doesn't track your run — Strava does that better. It doesn't post anything, ask for a login, or store your data anywhere. The scope is intentional: one input, one output, done. The GPX handoff to your running app is the end of what this needs to do. Everything else is someone else's problem.

---

## What's in v1

- Type a word or phrase (up to 8 characters) and generate a running route that traces it on real streets
- Pick from 24 preset shapes — hearts, symbols, faces, nature, misc
- Choose the location you'll run at — search any area, park, or neighborhood
- Adjust run distance with a size slider — see estimated km and time live
- Preview the route on a real map before committing
- Download as GPX — works with Strava, Garmin, Nike Run Club, and any GPX-compatible app
- Save route as an Instagram-ready image
- Installable as a PWA — works on Android and iOS home screen, no app store needed
- Zero accounts. Zero API keys. Completely free and open source.

---

## How it works

1. Pick where you'll run — search any location on the map
2. Type a word or pick a shape
3. Get a real street-snapped running route
4. Download the GPX, import to Strava, and run it

---

## Built with

| Tool | Why |
|------|-----|
| React + Vite | Frontend framework |
| Leaflet.js + OpenStreetMap | Map rendering (free, no API key) |
| Nominatim | Location search (free, no API key) |
| opentype.js | Converts typed letters into coordinate paths |
| OSRM | Snaps paths to real walkable streets (free, no API key) |
| vite-plugin-pwa | Makes it installable as a PWA |

No paid APIs. No backend. No account required.

---

## Run it locally

```bash
git clone https://github.com/[your-username]/mapart
cd mapart
npm install
npm run dev
```

Opens at `localhost:5173`. No environment variables needed.

---

## Deploy

Push to GitHub. Connect the repo to Vercel. Deploy. Vercel's free tier handles everything. No config needed.

---

## What's next (maybe)

- Custom image upload — trace any outline and run it
- Direct Strava route integration
- Route quality scoring based on street grid density
- Community gallery — routes people have actually run

*This is a side project. Contributions welcome if something interests you.*

---

## License

MIT
