const request = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body: string | null,
  headers?: Record<string, string>,
): Promise<string> => {
  const request = await fetch(endpoint, {
    method: method,
    body: body,
    headers: headers ?? {},
  })

  return request.text()
}

export const fetch_request = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body: string | null,
  headers?: Record<string, string>,
): Promise<string | undefined> => {
  try {
    return await request(method, endpoint, body, headers).catch(() => undefined)
  } catch {
    return undefined
  }
}
