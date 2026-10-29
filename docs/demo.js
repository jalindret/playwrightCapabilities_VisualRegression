const buttons = document.querySelectorAll('[data-view]');
const panels = {compare: document.querySelector('#compare-panel'), baseline: document.querySelector('#baseline-panel'), diff: document.querySelector('#diff-panel')};
for (const button of buttons) button.addEventListener('click', () => {
  for (const item of buttons) {
    item.classList.toggle('selected', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  }
  for (const [name, panel] of Object.entries(panels)) panel.hidden = name !== button.dataset.view;
});
document.querySelector('#copy').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText('npm ci\nnpx playwright install chromium\nnpm test\nnpm run demo:regression\nnpm run report');
    status.textContent = 'Commands copied. Run them from the project folder.';
  } catch {status.textContent = 'Select and copy the commands shown above.';}
});
