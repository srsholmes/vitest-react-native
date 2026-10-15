import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

/**
 * NativeComponentRegistry is how React Native modules obtain a host component.
 * Its mock reaches requireNativeComponent, whose mock is an ES module shape — so it
 * has to go through `.default`. Calling the namespace object instead threw
 * "requireNativeComponent is not a function", and nothing loaded this path until
 * LayoutConformance started compiling.
 */

const require_ = createRequire(import.meta.url);

type Registry = {
  get: (name: string, viewConfigProvider?: () => unknown) => unknown;
  getWithFallback_DEPRECATED: (name: string, viewConfigProvider?: () => unknown) => unknown;
  setRuntimeConfigProvider: (provider: unknown) => void;
};

const registry = (): Registry => {
  const mod = require_('react-native/Libraries/NativeComponent/NativeComponentRegistry');
  return (mod.default ?? mod) as Registry;
};

describe('NativeComponentRegistry', () => {
  it('get returns a component for a view name', () => {
    const component = registry().get('RCTSomeView', () => ({}));

    expect(component).toBeDefined();
    expect(['function', 'object']).toContain(typeof component);
  });

  it('getWithFallback_DEPRECATED returns a component for a view name', () => {
    const component = registry().getWithFallback_DEPRECATED('RCTSomeView', () => ({}));

    expect(component).toBeDefined();
    expect(['function', 'object']).toContain(typeof component);
  });

  it('setRuntimeConfigProvider is callable', () => {
    expect(() => registry().setRuntimeConfigProvider(() => ({}))).not.toThrow();
  });
});
