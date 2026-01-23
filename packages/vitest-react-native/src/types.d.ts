declare module 'pirates' {
  export interface Options {
    exts?: string[];
    ignoreNodeModules?: boolean;
    matcher?: (filename: string) => boolean;
  }

  export function addHook(
    hook: (code: string, filename: string) => string,
    options?: Options
  ): () => void;
}

declare module 'flow-remove-types' {
  interface Options {
    all?: boolean;
    pretty?: boolean;
  }

  interface Result {
    toString(): string;
  }

  function removeTypes(source: string, options?: Options): Result;
  export = removeTypes;
}

declare module 'regenerator-runtime/runtime' {
  const runtime: object;
  export = runtime;
}
