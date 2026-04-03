import AsyncStorage from '@react-native-async-storage/async-storage';
export const API_BASE_URL = 'http://192.168.1.94:8080';

// Note: In a real app, this would be managed by an Auth context/Redux
// export const AUTH_BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGV4Lm5ndXllbkBleGFtcGxlLmNvbSIsInVzZXJJZCI6MSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlhdCI6MTc3MzU2OTExOCwiZXhwIjoxNzc0NDMzMTE4fQ.HdM1VzLYimekeY-Gv8rOFejajjY_QL-GdweWbaOS8fc';
// export const AUTH_BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGV4Lm5ndXllbkBleGFtcGxlLmNvbSIsInVzZXJJZCI6MSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlhdCI6MTc3NDg2NzMyNCwiZXhwIjoxODA2NDAzMzI0fQ.LlGEU9slJfLAcCV8eWXxoTfrNHkSmX40i43Gl9qNoTs';

/**
 * Robust check if a body is FormData
 */
const isFormData = (body: any): boolean => {
  return body && typeof body === 'object' && (
    body instanceof FormData ||
    body.constructor?.name === 'FormData' ||
    typeof body.append === 'function'
  );
};

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const TOKEN = await AsyncStorage.getItem('authToken');
  
  const headers: Record<string, string> = {
    // ...(AUTH_BEARER_TOKEN ? { Authorization: `Bearer ${AUTH_BEARER_TOKEN}` } : {}),
    ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const bodyIsFormData = isFormData(options.body);

  // 1. If it's FormData, we MUST NOT have a Content-Type header. 
  // Fetch will automatically set it with the correct boundary.
  if (bodyIsFormData) {
    delete headers['Content-Type'];
  }
  // 2. Otherwise, default to application/json if not specified
  else if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  console.log(`[apiFetch] ${options.method || 'GET'} ${url}`, {
    headers: { ...headers, Authorization: headers.Authorization ? 'Bearer ...' : 'None' },
    isFormData: bodyIsFormData
  });

  const response = await fetch(url, {
    ...options,
    headers,
    mode: 'cors',
  });


  if (!response.ok) {
    if(response.status === 401 || response.status === 403) {
      await AsyncStorage.removeItem('authToken');
    }
    // Try to get error message from body
    let errorMessage = `Lỗi HTTP: ${response.status}`;
    try {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Not JSON
        console.error("Phản hồi lỗi không phải JSON:", errorText);
      }
    } catch { }
    throw new Error(errorMessage);
  }

  const payload = await response.json();

  if (payload.success === false) {
    throw new Error(payload.message || 'Yêu cầu không thành công');
  }

  return payload;
}
