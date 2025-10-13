export async function apiFetch(path: string, options: RequestInit = {}) {
  // VITE_API_URL should be like 'https://api.example.com' or empty for same-origin
  // In production use VITE_API_URL; in dev, default to local backend
  const envBase = (import.meta.env.VITE_API_URL as string) || '';
  const base = envBase || (import.meta.env.MODE === 'development' ? 'http://localhost:3001' : '');
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;

  // Ensure headers exist and inject auth token from localStorage if available
  const headers = new Headers(options.headers as HeadersInit | undefined);
  try {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (storedToken && !headers.get('Authorization')) {
      headers.set('Authorization', `Bearer ${storedToken}`);
    }
  } catch (e) {
    // ignore localStorage errors (e.g., SSR)
  }

  const finalOptions = { ...options, headers };

  const res = await fetch(url, finalOptions);
  if (!res.ok) {
    const text = await res.text().catch(() => null);
    const err: any = new Error(`API request failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = text;
    // If 401, add a helpful hint
    if (res.status === 401) {
      err.hint = 'Unauthorized: check auth token or login state. If running locally, ensure you are logged in and the token in localStorage.authToken is valid.';
    }
    throw err;
  }
  // Try parse JSON, otherwise return text
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export default apiFetch;
