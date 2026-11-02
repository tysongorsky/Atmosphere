* {
  box-sizing: border-box;
}

:root {
  --page-bg: #050b15;
  --panel-bg: rgba(10, 18, 31, 0.72);
  --panel-edge: rgba(255, 255, 255, 0.12);
  --text: #f5efe7;
  --muted: rgba(245, 239, 231, 0.78);
  --accent: #f59e0b;
  --danger: #ef4444;
  --shadow: rgba(0, 0, 0, 0.35);
}

html, body {
  margin: 0;
  min-height: 100%;
  font-family: Inter, "Segoe UI", sans-serif;
  background: var(--page-bg);
  color: var(--text);
}

body {
  min-height: 100vh;
  background: radial-gradient(circle at top, rgba(59, 130, 246, 0.12), transparent 30%), var(--page-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 300ms ease;
}

.audience-page {
  padding: 1rem;
}

.audience-shell {
  width: min(100%, 480px);
  min-height: calc(100vh - 2rem);
  background: rgba(8, 13, 18, 0.64);
  border: 1px solid var(--panel-edge);
  border-radius: 28px;
  padding: 1.2rem 1rem 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 20px 50px var(--shadow);
  overflow: hidden;
}

.audience-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.title-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

h1 {
  margin: 0;
  font-size: clamp(1.8rem, 5vw, 2.4rem);
  letter-spacing: -0.06em;
}

.status-pill {
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.light-panel {
  flex: 1 1 auto;
  min-height: 260px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  position: relative;
  overflow: hidden;
}

.light-display {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.18) 30%, rgba(0,0,0,0.2) 72%);
  transition: background 420ms ease, filter 420ms ease, transform 420ms ease;
  box-shadow: inset 0 0 40px rgba(255,255,255,0.22);
}

.audience-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.stone-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 0.8rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.meta-label,
.announcement-label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.announcement-block {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 0.9rem 1rem;
}

.announcement-block p {
  margin: 0;
}

#announcementText {
  margin-top: 0.35rem;
  font-size: 1rem;
  line-height: 1.5;
}

.video-frame {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.22);
  min-height: 200px;
}

#videoCue {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  background: rgba(0,0,0,0.42);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.action-button {
  appearance: none;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  color: #0f172a;
  font-weight: 700;
  padding: 0.8rem 1.1rem;
  min-width: 120px;
}

.toggle-row {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.82rem;
  color: var(--muted);
}

.connection-overlay {
  position: absolute;
  inset: 0;
  background: rgba(5, 8, 15, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  z-index: 5;
}

.connection-overlay.hidden,
.hidden {
  display: none !important;
}

.has-offline {
  filter: brightness(0.7) saturate(0.8);
}

@media (max-width: 480px) {
  .audience-shell {
    min-height: calc(100vh - 1rem);
    border-radius: 20px;
    padding: 0.9rem 0.8rem 0.8rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .action-button {
    width: 100%;
  }
}
