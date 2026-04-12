# Agents Acme Inc

A small demo app for the **Vatel** platform: manage voice agents, place live calls, browse history, listen to recordings, and read transcripts.

---

## Setup

### What you need

- **Node.js 20** or newer  
- **npm**  
- A **Vatel API key** from your Vatel account  

### Install and configure

```bash
git clone <repository-url>
cd vatel-full-stack
npm install
```

Copy the example env file and add your API key:

```bash
cp .env.local.example .env.local
```

In `.env.local`, set:

```bash
VATEL_API_KEY=your_key_here
```

### Run it

Local development:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

To check that everything compiles:

```bash
npm run build
```

To run lint:

```bash
npm run lint
```

If something fails with an auth or “missing key” style error, make sure `VATEL_API_KEY` is set and restart `npm run dev`.

---

## What’s in the app

- **Agents** — create and edit voice agents (prompt, voice, model).  
- **Calls** — start a live voice session from an agent page.  
- **History** — list past calls and open a call for transcript + recording.  

---

## Tech stack

Next.js, React, TypeScript, Tailwind, and the official Vatel JavaScript SDK from npm.

---

## License

Demo for the Vatel platform.
