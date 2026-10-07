// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- Callers choose the expected JSON type.
export function parseJson<T>(json: string): T {
  // JSON.parse checks syntax; callers supply the expected shape.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return JSON.parse(json) as T;
}
