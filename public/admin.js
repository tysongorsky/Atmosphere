* {
  box-sizing: border-box;
}

:root {
  --bg: #f3ebdf;
  --panel-bg: #fffdf9;
  --panel-border: rgba(26, 28, 38, 0.08);
  --ink: #1d1d1f;
  --muted: #4b5563;
  --primary: #f59e0b;
  --primary-dark: #c67b00;
  --danger: #b42318;
  --shadow: rgba(56, 40, 14, 0.08);
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Inter, "Segoe UI", sans-serif;
  background: linear-gradient(180deg, #f6f0e7 0%, #f0e7d7 100%);
  color: var(--ink);
}

.admin-shell {
  width: min(100%, 1100px);
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
  color: var(--muted);
}

h1, h2, h3 {
  margin: 0;
}

h1 {
  font-size: clamp(2rem, 4vw, 3rem);
}

.panel {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 20px;
  padding: 1.2rem;
  box-shadow: 0 10px 30px var(--shadow);
}

.login-panel {
  width: min(100%, 420px);
  margin: 4rem auto 0;
}

.stacked-form {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 1rem;
}

label {
  display: block;
  font-weight: 600;
  margin: 0.8rem 0 0.35rem;
}

input, select, textarea, button {
  font: inherit;
}

input[type="password"], input[type="color"], select, textarea {
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 12px;
  background: #fff;
  color: var(--ink);
}

textarea {
  resize: vertical;
  min-height: 90px;
}

.primary-button, .secondary-button, .warning-button {
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

.primary-button {
  background: linear-gradient(90deg, var(--primary), #efb548);
  color: #15121a;
}

.secondary-button {
  background: #e5d7bf;
  color: var(--ink);
}

.warning-button {
  background: #f8d7d7;
  color: #6c1b1b;
}

.dashboard-shell {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.stat-card {
  background: rgba(255,255,255,0.7);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem;
}

.color-preview {
  width: 100%;
  height: 72px;
  border-radius: 14px;
  margin: 0.8rem 0 1rem;
  border: 1px solid rgba(17,24,39,0.08);
  background: linear-gradient(90deg, #f59e0b, #facc15);
}

.button-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.button-row button {
  flex: 1;
}

.status-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}

.hidden {
  display: none !important;
}

.error-text {
  color: #991b1b;
  margin-top: 0.7rem;
  font-weight: 600;
}

@media (max-width: 720px) {
  .stats-grid,
  .panel-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 520px) {
  .stats-grid,
  .panel-grid {
    grid-template-columns: 1fr;
  }

  .button-row {
    flex-direction: column;
  }
}
