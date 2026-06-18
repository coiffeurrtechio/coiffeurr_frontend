const SUPER_ADMIN_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function tryRefreshToken(): Promise<string | null> {
  try {
    const res = await fetch(`${SUPER_ADMIN_BASE}/super-admin/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken: string = data.access_token;
    localStorage.setItem('super_admin_access_token', newToken);
    return newToken;
  } catch {
    return null;
  }
}

export async function superAdminFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('super_admin_access_token');

  const buildHeaders = (accessToken: string | null): HeadersInit => ({
    ...(options.headers as Record<string, string>),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  });

  let response = await fetch(`${SUPER_ADMIN_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: buildHeaders(token),
  });

  if (response.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      response = await fetch(`${SUPER_ADMIN_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: buildHeaders(newToken),
      });
    } else {
      localStorage.removeItem('super_admin_access_token');
      globalThis.location.href = '/super-admin/login';
    }
  }

  return response;
}
