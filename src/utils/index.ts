// Utility functions

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function getCurrentTimestamp(): number {
  return Date.now();
}

export function jsonResponse<T>(data: T, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export function errorResponse(error: string, status: number = 400): Response {
  return jsonResponse({
    success: false,
    error,
  }, status);
}

export function successResponse<T>(data: T, message?: string): Response {
  return jsonResponse({
    success: true,
    data,
    message,
  });
}
