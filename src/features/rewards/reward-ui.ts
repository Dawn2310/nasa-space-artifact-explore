import { realCatalog } from '../../shared/catalog';
import type { ArtifactId } from '../../shared/contracts';
import { BADGES, REWARD_CHANGED, REWARD_OVERLAY, rewardBook } from './rewards';
import './rewards.css';

let activeClose: (() => void) | undefined;
export function rewardDialogOpen() { return !!activeClose; }
function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string) {
  const element = document.createElement(tag); element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
function button(text: string, action: () => void, className = '') {
  const element = node('button', className, text); element.type = 'button'; element.onclick = action; return element;
}
function dialog(title: string) {
  activeClose?.();
  const previous = document.activeElement as HTMLElement | null;
  const element = node('dialog', 'discovery-reward');
  const heading = node('h2', '', title); heading.id = 'discovery-reward-title';
  element.setAttribute('aria-labelledby', heading.id);
  document.body.append(element);
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    element.close(); element.remove(); activeClose = undefined;
    window.dispatchEvent(new Event(REWARD_OVERLAY));
    if (previous?.isConnected) previous.focus({ preventScroll: true });
  };
  element.append(button('×', close, 'discovery-reward__close'));
  element.querySelector('button')?.setAttribute('aria-label', 'Close reward');
  element.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  activeClose = close;
  return { element, heading, close, show() { element.showModal(); window.dispatchEvent(new Event(REWARD_OVERLAY)); } };
}

function badgeArt(id: ArtifactId, small = false) {
  const art = node('div', `discovery-badge${small ? ' discovery-badge--small' : ''}`);
  const artifact = realCatalog.artifacts.find((item) => item.id === id)!;
  art.dataset.world = artifact.body;
  art.append(node('span', 'discovery-badge__orbit'), node('span', 'discovery-badge__star', BADGES[id].symbol), node('span', 'discovery-badge__name', artifact.name.split(' (')[0]));
  art.setAttribute('aria-hidden', 'true');
  return art;
}

export function presentDiscoveryReward(id: ArtifactId) {
  if (!BADGES[id] || rewardBook.read().some((badge) => badge.id === id)) return { shown: false, close() {} };
  const modal = dialog('New badge!');
  modal.element.classList.add('discovery-reward--earned');
  modal.element.append(badgeArt(id), modal.heading);
  const count = node('p', 'discovery-reward__progress', `${rewardBook.read().length} / ${realCatalog.artifacts.length} collected`);
  count.setAttribute('role', 'status');
  const save = button('Save badge', () => {
    const result = rewardBook.claim(id);
    window.dispatchEvent(new Event(REWARD_CHANGED));
    modal.heading.textContent = 'Badge saved!';
    count.textContent = `${rewardBook.read().length} / ${realCatalog.artifacts.length} collected${result.persisted ? '' : ' · This visit only'}`;
    save.textContent = 'Keep exploring →'; save.onclick = modal.close;
    modal.element.classList.add('is-saved');
  }, 'discovery-reward__primary');
  modal.element.append(count, save, button('My badges', () => { modal.close(); openPassport(); }, 'discovery-reward__secondary'));
  modal.show(); save.focus();
  return { shown: true, close: modal.close };
}

export function openPassport() {
  const modal = dialog('Your mission passport');
  const earned = new Set(rewardBook.read().map((item) => item.id));
  modal.element.classList.add('discovery-reward--passport');
  modal.element.append(node('p', 'discovery-reward__eyebrow', 'KEEP THEIR STORIES ALIVE'), modal.heading,
    node('p', 'discovery-reward__message', `${earned.size} of 17 discoveries collected. Every machine has a story worth remembering.`));
  const grid = node('ul', 'discovery-passport');
  for (const artifact of realCatalog.artifacts) {
    const collected = earned.has(artifact.id);
    const card = node('li', collected ? 'is-collected' : 'is-locked');
    card.append(badgeArt(artifact.id, true), node('strong', '', BADGES[artifact.id].title), node('span', '', artifact.name.split(' (')[0]), node('small', '', collected ? '✦ Collected' : 'A story to discover'));
    grid.append(card);
  }
  modal.element.append(grid, node('p', 'discovery-reward__footnote', 'Progress stays on this browser. No account needed.'), button('Back to exploring →', modal.close, 'discovery-reward__primary'));
  modal.show();
}
