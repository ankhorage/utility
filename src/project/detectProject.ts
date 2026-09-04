import type {
  ProjectDependencyMap,
  ProjectDetection,
  ProjectDetectionInput,
  ProjectTrait,
} from './types.js';

/***
 * Detect project language, runtime, and framework traits from package metadata signals.
 */
export function detectProject(input: ProjectDetectionInput): ProjectDetection {
  const dependencies = collectDependencyNames(input);
  const traits = new Set<ProjectTrait>();

  addLanguageTraits(traits, dependencies, input);
  addRuntimeTraits(traits, dependencies, input);
  addFrameworkTraits(traits, dependencies);

  return { traits };
}

/***
 * Collect dependency names from all supported package dependency sections.
 */
function collectDependencyNames(input: ProjectDetectionInput): ReadonlySet<string> {
  const names = new Set<string>();

  addDependencyNames(names, input.dependencies);
  addDependencyNames(names, input.devDependencies);
  addDependencyNames(names, input.peerDependencies);

  return names;
}

/***
 * Add dependency-map keys to a shared set when that dependency section exists.
 */
function addDependencyNames(target: Set<string>, dependencies?: ProjectDependencyMap): void {
  if (dependencies === undefined) return;

  for (const dependencyName of Object.keys(dependencies)) {
    target.add(dependencyName);
  }
}

/***
 * Add JavaScript and TypeScript traits inferred from package metadata.
 */
function addLanguageTraits(
  traits: Set<ProjectTrait>,
  dependencies: ReadonlySet<string>,
  input: ProjectDetectionInput,
): void {
  if (hasManifestSignal(input, dependencies)) traits.add('javascript');
  if (dependencies.has('typescript')) traits.add('typescript');
}

/***
 * Add Bun and Node runtime traits inferred from package metadata.
 */
function addRuntimeTraits(
  traits: Set<ProjectTrait>,
  dependencies: ReadonlySet<string>,
  input: ProjectDetectionInput,
): void {
  if (isBunProject(input, dependencies)) traits.add('bun');
  if (isNodeProject(input, dependencies)) traits.add('node');
}

/***
 * Add React-family framework traits inferred from dependency names.
 */
function addFrameworkTraits(traits: Set<ProjectTrait>, dependencies: ReadonlySet<string>): void {
  const hasExpo = dependencies.has('expo');
  const hasNext = dependencies.has('next');
  const hasReactNative = dependencies.has('react-native') || hasExpo;
  const hasReact = dependencies.has('react') || hasReactNative || hasNext;

  addTraitWhen(traits, 'react', hasReact);
  addTraitWhen(traits, 'react-native', hasReactNative);
  addTraitWhen(traits, 'expo', hasExpo);
  addTraitWhen(traits, 'next', hasNext);
}

/***
 * Return whether package metadata contains any signal that identifies a JavaScript project.
 */
function hasManifestSignal(
  input: ProjectDetectionInput,
  dependencies: ReadonlySet<string>,
): boolean {
  return dependencies.size > 0 || input.engines !== undefined || input.packageManager !== undefined;
}

/***
 * Return whether package metadata identifies Bun as a project runtime.
 */
function isBunProject(input: ProjectDetectionInput, dependencies: ReadonlySet<string>): boolean {
  return (
    input.packageManager?.startsWith('bun@') === true ||
    input.engines?.bun !== undefined ||
    dependencies.has('@types/bun')
  );
}

/***
 * Return whether package metadata identifies Node as a project runtime.
 */
function isNodeProject(input: ProjectDetectionInput, dependencies: ReadonlySet<string>): boolean {
  return (
    input.engines?.node !== undefined || dependencies.has('@types/node') || dependencies.has('next')
  );
}

/***
 * Add a trait to a set when its inference condition is true.
 */
function addTraitWhen(traits: Set<ProjectTrait>, trait: ProjectTrait, condition: boolean): void {
  if (condition) traits.add(trait);
}
