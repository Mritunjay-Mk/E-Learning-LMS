const API_URL = `${import.meta.env.VITE_API_URL}/api`
const getPersistedToken = () => {
  try {
    const raw = localStorage.getItem('learnhub-auth');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || '';
  } catch {
    return '';
  }
};

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const request = async (path, options = {}) => {
  const token = getPersistedToken();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    body: isFormData || !options.body ? options.body : JSON.stringify(options.body)
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(data?.message || 'Request failed', response.status, data?.details);
  }

  return data;
};

export const api = {
  get: (path) => request(path),
  post: (path, body, options) => request(path, { method: 'POST', body, ...options }),
  patch: (path, body, options) => request(path, { method: 'PATCH', body, ...options }),
  delete: (path) => request(path, { method: 'DELETE' })
};

export { API_URL };
