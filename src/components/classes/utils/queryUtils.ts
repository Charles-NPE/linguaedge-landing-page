
export function isQueryError<T>(
  row: T | { error: true }
): row is { error: true } {
  return (row as any)?.error === true;
}
