type ToastType = "success" | "error";

interface ToastPayload {
  message: string;
  type: ToastType;
  key?: string;
}

type Listener = (payload: ToastPayload) => void;

const listeners = new Set<Listener>();

export function toast(message: string, type: ToastType = "success", key?: string) {
  listeners.forEach((fn) => fn({ message, type, key }));
}

export function _subscribeToast(fn: Listener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
