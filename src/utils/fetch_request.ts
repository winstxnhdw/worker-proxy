export const fetch_request = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body: string | null,
  headers?: Record<string, string>,
): Promise<string | undefined> => {
  try {
    const request = await fetch(endpoint, {
      method: method,
      body: body,
      headers: headers ?? {},
    }).catch(() => undefined)

    return request.text()
  } catch {
    return undefined
  }
}
