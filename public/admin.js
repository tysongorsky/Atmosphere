async function fetchHealth() {
  const response = await fetch('/api/health');
  const data = await response.json();
  const statusOutput = document.getElementById('statusOutput');
  if (statusOutput) {
    statusOutput.textContent = JSON.stringify(data, null, 2);
  }
}

async function sendScene() {
  const scene = document.getElementById('sceneSelect')?.value || 'festival';
  const intensity = Number(document.getElementById('intensity')?.value ?? 180);

  const payload = {
    scene,
    channels: [
      intensity,
      intensity / 2,
      Math.max(32, intensity - 40),
      Math.max(16, intensity / 3),
    ],
  };

  await fetch('/api/lighting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

window.addEventListener('DOMContentLoaded', () => {
  fetchHealth();
  const button = document.getElementById('sendScene');
  if (button) {
    button.addEventListener('click', sendScene);
  }
});
