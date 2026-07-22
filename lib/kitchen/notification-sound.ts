const STORAGE_KEY = "kitchen-sound-enabled";

type Listener = () => void;
const listeners = new Set<Listener>();

/** Assinatura para `useSyncExternalStore` (ver `kitchen-header.tsx`) — reage à troca feita nesta aba. */
export function subscribeSoundEnabled(callback: Listener): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Som de novo pedido gerado via Web Audio API (dois tons curtos) — sem
 * depender de um arquivo de áudio a ser licenciado/hospedado. Estrutura
 * "preparada" pedida no prompt da sprint: troca de implementação (ex.: um
 * arquivo .mp3 de fato) fica isolada aqui, nada mais no app conhece o detalhe.
 */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === "true";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(enabled));
  listeners.forEach((listener) => listener());
}

export function playNewOrderChime(): void {
  if (typeof window === "undefined" || !isSoundEnabled()) return;

  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextCtor) return;

  const context = new AudioContextCtor();
  const frequencies = [880, 1108.73]; // A5 -> C#6, dois tons curtos e distintos.

  frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    const startTime = context.currentTime + index * 0.14;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.13);
  });

  window.setTimeout(() => context.close(), 400);
}
