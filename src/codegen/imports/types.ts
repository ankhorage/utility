export interface GeneratedNamedImport {
  readonly imported: string;
  readonly local?: string;
  readonly typeOnly?: boolean;
}

export interface GeneratedImportRequirement {
  readonly source: string;
  readonly defaultImport?: string;
  readonly namespaceImport?: string;
  readonly namedImports?: readonly GeneratedNamedImport[];
  readonly sideEffectOnly?: boolean;
  readonly typeOnlyDefaultImport?: string;
  readonly typeOnlyNamespaceImport?: string;
}

export type GeneratedImportInput = GeneratedImportRequirement | string;
