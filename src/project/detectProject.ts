import type {
  ProjectDependencyMap,
  ProjectDetection,
  ProjectDetectionInput,
  ProjectTrait,
} from './types.js';

export function detectProject(input: ProjectDetectionInput): ProjectDetection {
  const dependencies = collectDependencyNames(input);
  const traits = new Set<ProjectTrait>();

  addLanguageTraits(traits, dependencies, input);
  addRuntimeTraits(traits, dependencies, input);
  addFrameworkTraits(traits, dependencies);

  return { traits };
}

function collectDependencyNames(input: ProjectDetectionInput): ReadonlySet<string> {
  const names = new Set<string>();

  addDependencyNames(names, input.dependencies);
  addDependencyNames(names, input.devDependencies);
  addDependencyNames(names, input.peerDependencies);

  return names;
}

function addDependencyNames(target: Set<string>, dependencies?: ProjectDependencyMap): void {
  if (dependencies === undefined) {
    return;
  }

  for (const dependencyName of Object.keys(dependencies)) {
    target.add(dependencyName);
  }
}

function addLanguageTraits(
  traits: Set<ProjectTrait>,
  dependencies: ReadonlySet<string>,
  input: ProjectDetectionInput,
): void {
  if (hasManifestSignal(input, dependencies)) {
    traits.add('javascript');
  }

  if (dependencies.has('typescript')) {
    traits.add('typescript');
  }
}

function addRuntimeTraits(
  traits: Set<ProjectTrait>,
  dependencies: ReadonlySet<string>,
  input: ProjectDetectionInput,
): void {
  if (isBunProject(input, dependencies)) {
    traits.add('bun');
  }

  if (isNodeProject(input, dependencies)) {
    traits.add('node');
  }
}

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

function hasManifestSignal(
  input: ProjectDetectionInput,
  dependencies: ReadonlySet<string>,
): boolean {
  return dependencies.size > 0 || input.engines !== undefined || input.packageManager !== undefined;
}

function isBunProject(input: ProjectDetectionInput, dependencies: ReadonlySet<string>): boolean {
  return (
    input.packageManager?.startsWith('bun@') === true ||
    input.engines?.bun !== undefined ||
    dependencies.has('@types/bun')
  );
}

function isNodeProject(input: ProjectDetectionInput, dependencies: ReadonlySet<string>): boolean {
  return (
    input.engines?.node !== undefined || dependencies.has('@types/node') || dependencies.has('next')
  );
}

function addTraitWhen(traits: Set<ProjectTrait>, trait: ProjectTrait, condition: boolean): void {
  if (condition) {
    traits.add(trait);
  }
}
