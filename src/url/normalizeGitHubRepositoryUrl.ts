/***
 * Normalize a GitHub repository URL or owner/repository shorthand to one HTTPS GitHub URL.
 *
 * Existing normal GitHub repository, tree, blob, and commit links keep their path semantics.
 */
export function normalizeGitHubRepositoryUrl(value: string): string {
  const input = value.trim();
  if (input === '') throw new Error('GitHub repository must not be empty.');

  const candidate = input.startsWith('github.com/') ? `https://${input}` : input;
  if (candidate.startsWith('https://')) return normalizeAbsoluteGitHubUrl(candidate);

  if (
    /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,98}[A-Za-z0-9])?\/[A-Za-z0-9._-]{1,100}(?:\.git)?$/u.test(
      candidate,
    )
  ) {
    return `https://github.com/${candidate}`;
  }

  throw invalidGitHubRepositoryUrl();
}

/*** Validate one absolute GitHub URL without rewriting its normal route semantics. */
function normalizeAbsoluteGitHubUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch (error) {
    throw new Error('GitHub repository URL is invalid.', { cause: error });
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname.toLowerCase() !== 'github.com' ||
    url.username !== '' ||
    url.password !== ''
  ) {
    throw invalidGitHubRepositoryUrl();
  }

  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length < 2) throw invalidGitHubRepositoryUrl();

  return value;
}

/*** Create the stable validation error for unsupported repository input. */
function invalidGitHubRepositoryUrl(): Error {
  return new Error(
    'GitHub repository must be owner/repository or a normal https://github.com repository URL.',
  );
}
