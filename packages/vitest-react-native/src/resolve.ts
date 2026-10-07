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

// Only React Native's own packages get the fallback: they still deep-import
// paths their "exports" maps no longer list. Other packages keep Node's strict
// behaviour, so a deliberately hidden or condition-only subpath never silently
// resolves to a stale file on disk.
export const isReactNativePackage = (pkg: string): boolean =>
  pkg === 'react-native' || pkg.startsWith('@react-native/');

// Locate `<node_modules>/<pkg>` the way Node would from `fromDirs`.
export const findPackageDir = (
  pkg: string,
  fromDirs: string[],
  nodeModulePaths: (from: string) => string[]
): string | null => {
  for (const from of fromDirs) {
    for (const dir of nodeModulePaths(from)) {
      const pkgDir = path.join(dir, pkg);
      if (fs.existsSync(path.join(pkgDir, 'package.json'))) return pkgDir;
    }
  }
  return null;
};

type ResolveFilename = (
  request: string,
  parent: Module | undefined,
  isMain?: boolean,
  options?: { paths?: string[] }
) => string;

// React Native 0.87 restricts deep imports with a package "exports" map, but
// RN's own packages still deep-import paths it no longer exports (e.g.
// @react-native/virtualized-lists → react-native/src/private/featureflags/…).
// Metro falls back to plain file resolution when a subpath isn't exported;
// Node's require() throws ERR_PACKAGE_PATH_NOT_EXPORTED. Mirror Metro for RN
// packages: only on that error, resolve the subpath as a file inside the
// package directory. If that fails too, the original error is rethrown.
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
    isMain,
    options
  ) {
    try {
      return original.call(this, request, parent, isMain, options);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') throw e;
      const spec = splitBareSpecifier(request);
      if (!spec || !isReactNativePackage(spec.pkg)) throw e;
      const fromDirs = options?.paths ?? [
        parent?.filename ? path.dirname(parent.filename) : process.cwd(),
      ];
      const pkgDir = findPackageDir(spec.pkg, fromDirs, M._nodeModulePaths);
      if (!pkgDir) throw e;
      try {
        return original.call(this, path.join(pkgDir, spec.subpath), parent, isMain);
      } catch {
        throw e;
      }
    }
  };
  patched.__vrnExportsFallback = true;
  M._resolveFilename = patched;
};

// ESM counterpart for the Vite plugin: resolve an RN-package deep import
// (`react-native/src/private/…`) to a file, trying `extensions` in order.
// Returns null when the specifier isn't an RN deep import or no file exists.
export const resolveReactNativeDeepImport = (
  source: string,
  fromDir: string,
  extensions: string[]
): string | null => {
  const spec = splitBareSpecifier(source);
  if (!spec || !isReactNativePackage(spec.pkg)) return null;
  const nodeModulePaths = (Module as unknown as { _nodeModulePaths: (f: string) => string[] })
    ._nodeModulePaths;
  const pkgDir = findPackageDir(spec.pkg, [fromDir], nodeModulePaths);
  if (!pkgDir) return null;
  const base = path.join(pkgDir, spec.subpath);
  for (const candidate of [base, ...extensions.map((ext) => base + ext)]) {
    // Realpath, as Vite does by default, so the file's own imports resolve
    // from its real location (pnpm symlinks node_modules/<pkg>).
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return fs.realpathSync(candidate);
    }
  }
  return null;
};
