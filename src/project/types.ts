export type ProjectDependencyMap = Readonly<Record<string, string>>;

interface ProjectEngineMap {
  readonly bun?: string;
  readonly node?: string;
}

export interface ProjectDetectionInput {
  readonly dependencies?: ProjectDependencyMap;
  readonly devDependencies?: ProjectDependencyMap;
  readonly peerDependencies?: ProjectDependencyMap;
  readonly engines?: ProjectEngineMap;
  readonly packageManager?: string;
}

export type ProjectTrait =
  'bun' | 'expo' | 'javascript' | 'next' | 'node' | 'react' | 'react-native' | 'typescript';

export interface ProjectDetection {
  readonly traits: ReadonlySet<ProjectTrait>;
}
