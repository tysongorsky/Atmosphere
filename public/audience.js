const sceneButtons = document.querySelectorAll('.scene-button');
const sceneLabel = document.getElementById('current-scene');

async function triggerScene(sceneName) {
  await fetch('/api/lighting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scene: sceneName,
      channels: [
        220,
        136,
        95,
        80,
      ],
    }),
  });

  if (sceneLabel) {
    sceneLabel.textContent = sceneName;
  }
}

sceneButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const sceneName = button.dataset.scene;
    triggerScene(sceneName);
  });
});
