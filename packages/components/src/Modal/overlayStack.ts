type CloseFn = () => void;
interface StackEntry {
  id: symbol;
  close: CloseFn;
}

const stack: StackEntry[] = [];
let listenerInstalled = false;

function handleKeyDown(e: KeyboardEvent): void {
  if (e.key !== 'Escape') return;
  const top = stack[stack.length - 1];
  if (!top) return;
  e.stopPropagation();
  top.close();
}

function ensureListener(): void {
  if (listenerInstalled || typeof document === 'undefined') return;
  listenerInstalled = true;
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * Global overlay stack — the single source of truth for "Escape closes the
 * topmost overlay only, one layer per press" (Doc 3 §10) across every
 * dropdown/popover AND modal/drawer in the app, however deeply they're
 * nested (a field-anchored picker opened from inside a drawer, a drawer
 * opened from inside another modal, etc). Each open overlay pushes its own
 * close handler while it's open and pops it when it closes; only the entry
 * on TOP of the stack ever reacts to an Escape press.
 */
export function pushOverlay(id: symbol, close: CloseFn): void {
  ensureListener();
  const i = stack.findIndex((e) => e.id === id);
  if (i !== -1) stack[i] = { id, close };
  else stack.push({ id, close });
}

export function popOverlay(id: symbol): void {
  const i = stack.findIndex((e) => e.id === id);
  if (i !== -1) stack.splice(i, 1);
}
