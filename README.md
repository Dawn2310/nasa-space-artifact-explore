# 🛸 NASA Space Artifact Explorer — *Abandoned, But Not Forgotten*

An interactive 3D space heritage explorer built for the **NASA Space Apps Challenge**. Designed for young explorers aged **10–14**, the app brings the stories of **17 NASA space artifacts** across **the Moon, Mars, and Deep Space** to life—showing how yesterday’s machines helped tomorrow’s explorers reach farther.

**[🛸 Open the live demo](https://nasa-space-artifact-explore.netlify.app)**

## ✨ Key Features

- **Three-Tier 3D Universe:** Fly from a Solar System overview, backed by NASA SVS Gaia/Hipparcos star maps, to lunar and Martian mission maps and close-up artifact inspections.
- **Legacy Voyage:** Board the fictional guide craft **Echo** for three story chapters—The Moon, Mars, and Deep Space—with browser voice narration, first-person spacecraft stories, and collectible Legacy Sparks.
- **Space Passport:** Collect **17 mission badges** through guided stories and free exploration. Your collection stays in the same browser; no account is needed. Pioneer 11 is available through free exploration.
- **NASA-Sourced Stories & Fact Cards:** Historical facts link to primary NASA records, including NASA NSSDCA, NASA Science, and NASA/JPL.
- **Grounded AI Characters:** Ask the spacecraft questions about their missions. The server checks fact references and numerical claims, and filters dated facts against each character’s final-contact cutoff where one is recorded. Mock mode works without an API key.
- **Clear Visual Context:** Models include source credits and reuse notes; scientific assets have recorded checksums. Planet sizes, positions, orbital speeds, UFO flights, and background galaxies are illustrative.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Three.js, React Three Fiber, and Drei.
- **Narration:** Browser Web Speech API, with stop/replay controls and text fallbacks. Available voices and automatic playback depend on the browser.
- **Backend:** Netlify Functions (`netlify/functions/chat.mts`) and a Vercel adapter (`api/chat.ts`), sharing citation verification and adapters for OpenAI, Anthropic, Gemini, and offline mock mode.
- **Data & Assets:** NASA 3D Resources, NASA SVS, NASA NSSDCA, and NASA Science, plus individually credited community models. See [CREDITS.md](CREDITS.md) and the [asset manifest](content/assets.json).

## 🚀 Run Locally

Use **Node.js 24 or later**.

```bash
git clone https://github.com/Dawn2310/nasa-space-artifact-explore.git
cd nasa-space-artifact-explore
npm ci
```

Copy `.env.example` to `.env`. The default `LLM_PROVIDER=mock` needs no API key.

```bash
npm run dev
```

Open the local URL printed by Vite. The development server also serves `POST /api/chat`.

**Quick demo:** Choose **Mars** in the flight chooser. InSight is the first discovery, with its own spoken introduction and animated instrument deployment. UFO transfers take three seconds; narration plays at 1.3× its original pace.

## 🔑 Connect an AI Provider

Set these values in your local `.env`, or in the hosting project’s server environment:

| Variable | Purpose |
|---|---|
| `LLM_PROVIDER` | `mock`, `openai`, `anthropic`, or `gemini` |
| `LLM_API_KEY` | Your chosen provider’s key; leave empty for mock |
| `LLM_MODEL` | Optional model override |
| `ALLOW_PENDING_FACTS` | Defaults to `false`; NASA-sourced facts are already eligible without separate manual approval |

Restart the development server after changing the environment. Keys stay on the server; `.env` is excluded from Git. Mock results verify pipeline behavior, not the quality of a live model. Source grounding checks reduce unsupported answers but do not guarantee every generated sentence is correct.

## ✅ Build & Checks

```bash
npm run build
node eval/mars-route.check.mjs
node eval/mars-models.check.mjs
node eval/rewards.check.mjs
node eval/storyteller.check.mjs
node eval/intro-narration.check.mjs
```

Production runs on **Netlify**. `netlify.toml` publishes `dist` and bundles the chat function at `/api/chat`. Configure the server variables above in the Netlify project's environment. The repository also retains the Vercel adapter. This first production deploy was uploaded with the CLI; GitHub auto-deploy is not connected.

## 📚 Project Notes & Credits

- [CREDITS.md](CREDITS.md): scientific sources, model authors, licenses, and visual acknowledgments.
- [content/](content/): artifact catalog, facts, sources, and asset metadata.
- [docs/DECISIONS.md](docs/DECISIONS.md): implementation decisions and limitations.
- [TASKS.md](TASKS.md): development handoffs and verification history.

Echo, the UFO, and first-person dialogue are storytelling devices based on mission records. The project was developed with AI coding and writing assistance; narration uses browser speech synthesis. Scientific asset sources and community model attribution are recorded separately in the credits.
