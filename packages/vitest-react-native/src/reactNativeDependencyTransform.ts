import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const removeTypes = require('flow-remove-types');
const getEsbuild = (): typeof import('esbuild') => require('esbuild');

const reactNativeSpecificExtensions = [
  '.ios.js',
  '.ios.jsx',
  '.android.js',
  '.android.jsx',
  '.native.js',
  '.native.jsx',
];

const transformableExtensions = ['.js', '.jsx', ...reactNativeSpecificExtensions];

const normalize = (id: string): string => id.replace(/\\/g, '/');

const getDependencyName = (id: string): string | null => {
  const nodeModulesPath = '/node_modules/';
  const normalized = normalize(id);
  const nodeModulesIndex = normalized.lastIndexOf(nodeModulesPath);

  if (nodeModulesIndex === -1) {
    return null;
  }

  const dependencyPath = normalized.slice(nodeModulesIndex + nodeModulesPath.length);
  const segments = dependencyPath.split('/');

  if (segments[0]?.startsWith('@') && segments[1]) {
    return `${segments[0]}/${segments[1]}`;
  }

  return segments[0] ?? null;
};

export const shouldTransformReactNativeDependency = (id: string): boolean => {
  const normalized = normalize(id);

  if (!normalized.includes('/node_modules/')) {
    return false;
  }

  if (!transformableExtensions.some((extension) => normalized.endsWith(extension))) {
    return false;
  }

  const dependencyName = getDependencyName(normalized);

  if (!dependencyName) {
    return false;
  }

  return (
    dependencyName === 'react-native' ||
    dependencyName.startsWith('@react-native/') ||
    dependencyName.includes('react-native') ||
    reactNativeSpecificExtensions.some((extension) => normalized.endsWith(extension))
  );
};

export const transformReactNativeDependency = (
  code: string,
  id: string
): { code: string; map: null } | undefined => {
  if (!shouldTransformReactNativeDependency(id)) {
    return undefined;
  }

  const flowStrippedCode = removeTypes(code, { all: true }).toString();
  const transformed = getEsbuild().transformSync(flowStrippedCode, {
    loader: 'jsx',
    sourcefile: id,
  });

  return { code: transformed.code, map: null };
};
