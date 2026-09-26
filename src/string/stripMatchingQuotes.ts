/*** Remove one matching pair of single or double quotes around a string. */
export function stripMatchingQuotes(value: string): string {
  if (value.length < 2) return value;
  const [first] = value;
  const last = value[value.length - 1];
  return (first === '"' && last === '"') || (first === "'" && last === "'")
    ? value.slice(1, -1)
    : value;
}
