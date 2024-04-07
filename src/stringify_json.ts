export const stringify_json = (json: Record<string, unknown> | undefined): string | null => {
  if (json === undefined) return null

  try {
    return JSON.stringify(json)
  } catch {
    return null
  }
}
