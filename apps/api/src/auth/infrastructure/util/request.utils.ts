export function getRequestUserAgent(req: { headers: Headers | Record<string, unknown> }): string | undefined {
  const headers = req.headers;

  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get('user-agent') ?? undefined;
  }

  const value = (headers as Record<string, unknown>)['user-agent'];
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}
