import { Appearance, Dimensions, Platform } from 'react-native';

/**
 * Test helpers for driving the React Native mocks.
 *
 * Import from '@srsholmes/vitest-react-native/helpers' in your tests. Each one reaches
 * the mock through `react-native` itself — the mocks *are* React Native's modules here,
 * so there is no separate bridge to keep in step.
 */

/**
 * What Appearance.setColorScheme() accepts in React Native 0.87 — not `null`.
 * 'unspecified' is React Native's deprecated spelling of 'auto'.
 */
export type ColorScheme = 'light' | 'dark' | 'auto' | 'unspecified';

export interface DimensionValues {
  width?: number;
  height?: number;
  scale?: number;
  fontScale?: number;
}

const setupError = (): Error =>
  new Error(
    '[vitest-react-native] helpers were called before setup ran. ' +
      "Add reactNative() to your vitest config's plugins."
  );

const statefulMocks = (): Map<string, () => void> => {
  const registry = (globalThis as Record<string, unknown>).__vrnStateful;
  if (!(registry instanceof Map)) throw setupError();
  return registry as Map<string, () => void>;
};

const nativeModuleOverrides = (): Map<string, unknown> => {
  const overrides = (globalThis as Record<string, unknown>).__vrnNativeModuleOverrides;
  if (!(overrides instanceof Map)) throw setupError();
  return overrides as Map<string, unknown>;
};

/**
 * Switch the platform tests run as. `Platform.select()` reads `OS` when it is called, so
 * this is all that has to change for it to follow.
 */
export const setPlatform = (os: 'ios' | 'android'): void => {
  const platform = Platform as unknown as { OS: string; Version: string | number };
  platform.OS = os;
  platform.Version = os === 'ios' ? '17.0' : 34;
};

/**
 * Resize the screen. Merges, so passing only `width` keeps the current height, and
 * notifies anything listening to `Dimensions.addEventListener('change')`.
 */
export const setDimensions = (dimensions: DimensionValues): void => {
  // React Native types `set` as taking complete DisplayMetrics; this mock merges, so a
  // partial is meaningful here even though the published types do not say so.
  Dimensions.set({ window: { ...dimensions }, screen: { ...dimensions } } as never);
};

/**
 * Switch to dark mode. `useColorScheme()` reads through Appearance, so it follows.
 * 'auto' returns to the resting scheme: there is no system appearance to follow.
 */
export const setColorScheme = (scheme: ColorScheme): void => {
  Appearance.setColorScheme(scheme);
};

/**
 * Stand in for a native module, reaching both lookups: `NativeModules[name]` and
 * `TurboModuleRegistry.get`/`getEnforcing`. Modern React Native libraries use the
 * latter, so covering only `NativeModules` would miss most of them.
 */
export const mockNativeModule = (name: string, implementation: Record<string, unknown>): void => {
  nativeModuleOverrides().set(name, implementation);
};

/**
 * Restore every stateful mock to its resting values and drop registered listeners and
 * native-module stand-ins.
 *
 * Spy call history is deliberately untouched: Vitest owns that through its own
 * `clearMocks` / `mockReset` config, and resetting implementations here would drop the
 * ones the mocks were built with.
 */
export const resetAllMocks = (): void => {
  for (const reset of statefulMocks().values()) reset();
};
