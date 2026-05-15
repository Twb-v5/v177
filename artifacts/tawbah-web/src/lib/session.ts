let _userId: string | null = null;

const GUEST_SESSION_KEY = "tawbah_guest_session_id";

function generateGuestId(): string {
  return "guest_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function loadOrCreateGuestId(): string {
  try {
    const stored = localStorage.getItem(GUEST_SESSION_KEY);
    if (stored) return stored;
    const id = generateGuestId();
    localStorage.setItem(GUEST_SESSION_KEY, id);
    return id;
  } catch {
    return generateGuestId();
  }
}

let _guestId: string | null = null;

export function setSessionUserId(id: string | null) {
  _userId = id;
}

export function getSessionId(): string {
  if (_userId) return `user_${_userId}`;
  if (!_guestId) _guestId = loadOrCreateGuestId();
  return _guestId;
}

export function clearGuestSessionId() {
  try {
    localStorage.removeItem(GUEST_SESSION_KEY);
    _guestId = null;
  } catch {
    // ignore
  }
}
