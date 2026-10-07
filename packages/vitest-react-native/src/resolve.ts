import fs from 'fs';
import Module from 'module';
import path from 'path';

// Split a bare specifier into package name and subpath:
// 'react-native/src/x' → { pkg: 'react-native', subpath: 'src/x' },
// '@scope/pkg/a/b' → { pkg: '@scope/pkg', subpath: 'a/b' }.
// Returns null for relative/absolute/builtin specifiers and bare package roots.
export const splitBareSpecifier = (request: string): { pkg: string; subpath: string } | null => {
  if (request.startsWith('.') || request.startsWith('node:') || path.isAbsolute(request)) {
    return null;
  }
  const parts = request.split('/');
  const nameParts = request.startsWith('@') ? 2 : 1;
  if (parts.length <= nameParts) return null;
  return { pkg: parts.slice(0, nameParts).join('/'), subpath: parts.slice(nameParts).join('/') };
};

type ResolveFilename = (request: string, parent: Module | undefined, ...rest: unknown[]) => string;

// React Native 0.87 restricts deep imports with a package "exports" map, but
// RN's own packages still deep-import paths it no longer exports (e.g.
// @react-native/virtualized-lists → react-native/src/private/featureflags/…).
// Metro falls back to plain file resolution when a subpath isn't exported;
// Node's require() throws ERR_PACKAGE_PATH_NOT_EXPORTED. Mirror Metro: only on
// that error, resolve the subpath as a file inside the package directory.
export const installExportsFallback = (): void => {
  const M = Module as unknown as {
    _resolveFilename: ResolveFilename & { __vrnExportsFallback?: true };
    _nodeModulePaths: (from: string) => string[];
  };
  if (M._resolveFilename.__vrnExportsFallback) return;
  const original = M._resolveFilename;

  const patched: ResolveFilename & { __vrnExportsFallback?: true } = function (
    this: unknown,
    request,
    parent,
    ...rest
  ) {
    try {
      return original.call(this, request, parent, ...rest);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') throw e;
      const spec = splitBareSpecifier(request);
      if (!spec) throw e;
      const from = parent?.filename ? path.dirname(parent.filename) : process.cwd();
      for (const dir of M._nodeModulePaths(from)) {
        const pkgDir = path.join(dir, spec.pkg);
        if (fs.existsSync(path.join(pkgDir, 'package.json'))) {
          return original.call(this, path.join(pkgDir, spec.subpath), parent, ...rest);
        }
      }
      throw e;
    }
  };
  patched.__vrnExportsFallback = true;
  M._resolveFilename = patched;
};
