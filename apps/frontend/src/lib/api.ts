const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ status: 'success' | 'fail' | 'error'; data?: T; message?: string; errorCode?: string; [key: string]: any }> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Wajib agar HttpOnly Cookie terkirim
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        status: 'fail',
        statusCode: res.status,
        message: data.message || 'Terjadi kesalahan sistem',
        errorCode: data.errorCode,
        data: data.data,
      };
    }

    return data;
  } catch (err: any) {
    return {
      status: 'error',
      message: err.message || 'Gagal terhubung ke server backend.',
    };
  }
}

/**
 * Konversi path media (foto profil / PDF sertifikat) menjadi URL lengkap yang valid
 */
export function getFullMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const backendOrigin = BASE_URL.replace(/\/api\/v1\/?$/, '');
  const clean = url.startsWith('/') ? url : `/${url}`;

  // Format canonical /api/v1/talents/...
  if (clean.startsWith('/api/v1/')) {
    return `${backendOrigin}${clean}`;
  }
  // Format legacy /talents/...
  if (clean.startsWith('/talents/')) {
    return `${backendOrigin}/api/v1${clean}`;
  }
  // Format static /uploads/...
  if (clean.startsWith('/uploads/')) {
    return `${backendOrigin}${clean}`;
  }
  // Fallback standar
  return `${backendOrigin}/api/v1/${clean.replace(/^\//, '')}`;
}

