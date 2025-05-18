
export interface QueryError { error: true }

export function isQueryError<T>(
  row: T | QueryError
): row is QueryError {
  return (row as any)?.error === true;
}
