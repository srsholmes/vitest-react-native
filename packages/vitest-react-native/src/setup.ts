/**
 * Vitest React Native Setup
 *
 * This setup file configures the test environment for React Native components
 * to work with Vitest. It uses pirates to intercept require() calls and transform
 * React Native's Flow-typed JavaScript code.
 */

// ============================================================================
// STEP 1: Set up globals IMMEDIATELY - before ANY imports or requires
// These must be available before React Native modules try to access them
// ============================================================================

// TurboModule proxy for native modules - React Native 0.83+ requires this
//
// Uses Proxy at every level so new RN releases don't break the mock:
// - Any TurboModule name returns a mock (no hardcoded if/else per module)
// - Any method on a module is a callable no-op (no hardcoded method lists)
// - Any feature flag returns () => false (no hardcoded flag names)
//
// This eliminates the whack-a-mole pattern where each RN update adds a new
// module/method/flag that crashes until setup.ts is manually updated.
// Native-module stand-ins installed by the mockNativeModule() helper. Consulted by the
// proxy below, which is the single chokepoint feeding both __turboModuleProxy and
// nativeModuleProxy — so one map reaches TurboModuleRegistry and NativeModules alike.
const nativeModuleOverrides = new Map<string, unknown>();

const createTurboModuleProxy = () => {
  return (name: string) => {
    if (nativeModuleOverrides.has(name)) return nativeModuleOverrides.get(name);
    if (name === 'NativeReactNativeFeatureFlagsCxx') {
      // Feature flags: any prop returns () => false
      return new Proxy(
        {},
        {
          get: (_target, prop) =>
            typeof prop === 'string' ? () => false : undefined,
        },
      );
    }
    // Return null for other native modules so TurboModuleRegistry.get()
    // returns null and RN code uses JS fallbacks instead of broken native stubs.
    // TurboModuleRegistry.getEnforcing() handles the null → safe mock fallback.
    return null;
  };
};

const turboModuleProxy = createTurboModuleProxy();

// Set up all required globals
const g = globalThis as Record<string, unknown>;
g.__turboModuleProxy = turboModuleProxy;
g.nativeModuleProxy = new Proxy(
  {},
  {
    get: (_target, name: string) => turboModuleProxy(name),
  }
);
g.__DEV__ = true;
g.IS_REACT_ACT_ENVIRONMENT = true;
g.IS_REACT_NATIVE_TEST_ENVIRONMENT = true;
g.nativeFabricUIManager = {};
// The bridge config React Native's batched bridge reads at startup.
g.__fbBatchedBridgeConfig = { remoteModuleConfig: [], localModulesConfig: [] };
// The instance methods React Native exposes on every host component — its NativeMethods
// interface. The component mocks hand this to useImperativeHandle so a ref resolves to
// something with the shape real code calls. Measurements report zeros, as React Native's
// own Jest mock did: predictable, and nothing in a test environment has a real layout.
g.__vrnHostInstance = (): Record<string, unknown> => ({
  measure: vi.fn((callback: (...args: number[]) => void) => callback(0, 0, 0, 0, 0, 0)),
  measureInWindow: vi.fn((callback: (...args: number[]) => void) => callback(0, 0, 0, 0)),
  measureLayout: vi.fn((_relativeToNativeNode: unknown, onSuccess: (...args: number[]) => void) =>
    onSuccess(0, 0, 0, 0)
  ),
  setNativeProps: vi.fn(),
  focus: vi.fn(),
  blur: vi.fn(),
});

// Reset hooks for the mocks that hold state, registered by each mock as it initialises.
// resetAllMocks() sweeps this instead of carrying a hand-maintained list, which is the
// kind that quietly falls behind the moment a stateful mock is added. Populated lazily,
// which is correct: a mock that never loaded holds no state to reset.
const statefulMocks = new Map<string, () => void>();
g.__vrnStateful = statefulMocks;
g.__vrnRegisterStateful = (name: string, reset: () => void): void => {
  statefulMocks.set(name, reset);
};
g.__vrnNativeModuleOverrides = nativeModuleOverrides;
statefulMocks.set('NativeModules', () => nativeModuleOverrides.clear());
// Only when there is no window: assigning unconditionally replaced jsdom's window
// with globalThis for anyone running a browser-like environment.
if (g.window === undefined) {
  g.window = globalThis;
}
g.cancelAnimationFrame = (id: number) => clearTimeout(id);
g.requestAnimationFrame = (callback: (time: number) => void) =>
  setTimeout(() => callback(Date.now()), 0);
g.performance = globalThis.performance || { now: Date.now };

// ============================================================================
// STEP 2: Now we can safely import modules
// ============================================================================

import { addHook } from 'pirates';
import removeTypes from 'flow-remove-types';
import * as esbuild from 'esbuild';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'node:url';
import {
  cacheFileName,
  hashSetupSources,
  pruneStaleCacheDirs,
  readFromCache,
  writeToCache,
} from './cache.js';
import { findMock, type MockEntry } from './mocks.js';
import { installExportsFallback } from './resolve.js';
import {
  babelToolchainVersions,
  missingToolchainMessage,
  resolveBabelToolchain,
  transformWithBabel,
  type BabelToolchain,
} from './babel.js';
import { isRNBefore, parseRNVersion } from './version.js';

const require = createRequire(import.meta.url);

installExportsFallback();

// ============================================================================
// STEP 3: Set up cache directory for transformed files
// ============================================================================

let reactNativeVersion = 'unknown';
let pluginVersion = 'unknown';

// Resolve react-native from the project, which is the copy tests load — not
// from the plugin's own location, where pnpm may install a different peer.
for (const from of [path.join(process.cwd(), 'noop.js'), import.meta.url]) {
  try {
    reactNativeVersion = createRequire(from)('react-native/package.json').version;
    break;
  } catch {
    // Try the next location; "unknown" only affects the cache dir name.
  }
}

// Installed RN version, used to mirror APIs React Native has removed.
const rnVersion = parseRNVersion(reactNativeVersion);
const rnBefore = (major: number, minor: number): boolean => isRNBefore(rnVersion, major, minor);
const rnVersionLiteral = rnVersion
  ? `{ major: ${rnVersion.major}, minor: ${rnVersion.minor}, patch: ${rnVersion.patch} }`
  : '{ major: 0, minor: 0, patch: 0 }';

try {
  // setup.ts lives at <pkg>/src/setup.ts in development and at <pkg>/dist/setup.{js,cjs}
  // when installed. Both are exactly one directory below the package root, so walking
  // up once and reading package.json works in both contexts.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const pluginPkg = JSON.parse(
    fs.readFileSync(path.join(here, '..', 'package.json'), 'utf-8'),
  );
  pluginVersion = pluginPkg.version;
} catch {
  // Keep "unknown" fallback — only affects the cache dir name.
}

// Hash the setup code into the cache key so any edit to the mocks invalidates
// the cache automatically — no destructive end-of-file wipe needed, which
// removes a major race window when many workers run in parallel.
let setupHash = 'nohash';
try {
  setupHash = hashSetupSources(fileURLToPath(import.meta.url));
} catch {
  // keep nohash fallback
}

// The Babel fallback produces different output from esbuild, and that output changes
// with the preset and @babel/core versions, so both key the cache directory. This is a
// resolve plus a package.json read; @babel/core itself is required lazily, on the first
// file that actually needs the fallback.
const babelToolchain = babelToolchainVersions(process.cwd()) ?? 'nobabel';

const tmpDir = os.tmpdir();
const cacheDirBase = path.join(tmpDir, 'vrn');
const version = `${reactNativeVersion}_${pluginVersion}_${setupHash}_${babelToolchain}`;
const cacheDir = path.join(cacheDirBase, version);

fs.mkdirSync(cacheDir, { recursive: true });
// Mark this version's dir as in use so concurrent runs don't prune it.
try {
  const now = new Date();
  fs.utimesSync(cacheDir, now, now);
} catch {
  /* ignore */
}
pruneStaleCacheDirs(cacheDirBase, version);

// The cache is only an optimisation: if a write fails (e.g. another process
// removed the dir), return the transform uncached instead of failing the test.
const tryWriteToCache = (cachePath: string, code: string): void => {
  try {
    writeToCache(cachePath, code);
  } catch {
    /* ignore */
  }
};

// ============================================================================
// STEP 4: Mock registry - stores module path to mock code mappings
// ============================================================================

const mocked: MockEntry[] = [];

const getMocked = (filePath: string): MockEntry | undefined => findMock(mocked, filePath);

// ============================================================================
// STEP 5: Code transformation utilities
// ============================================================================

// Resolved once, on the first file that needs it: a project with no Babel keeps the
// zero-Babel pipeline and pays nothing. `undefined` means "not looked up yet", `null`
// means "looked up and absent".
let cachedToolchain: BabelToolchain | null | undefined;

const toolchain = (): BabelToolchain | null => {
  if (cachedToolchain === undefined) cachedToolchain = resolveBabelToolchain(process.cwd());
  return cachedToolchain;
};

const transformCode = (code: string, filename: string): string => {
  const result = removeTypes(code, { all: true }).toString();
  try {
    return esbuild.transformSync(result, {
      loader: 'jsx',
      format: 'cjs',
      platform: 'node',
    }).code;
  } catch (esbuildError) {
    // flow-remove-types erases type ANNOTATIONS only: Flow's `enum`, `component` and
    // `hook` declarations pass through untouched and esbuild cannot parse them. React
    // Native's own Babel preset lowers them, so retry there — on the original source,
    // because stripping has already mangled those declarations into invalid syntax.
    const babel = toolchain();
    if (!babel) {
      throw new Error(missingToolchainMessage(filename, (esbuildError as Error).message));
    }
    return transformWithBabel(babel, code, filename);
  }
};

const normalize = (p: string): string => p.replace(/\\/g, '/');

// Process binary files (images) as base64
addHook(
  (code) => {
    const b64 = Buffer.from(code).toString('base64');
    return `module.exports = Buffer.from("${b64}", "base64")`;
  },
  {
    exts: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    ignoreNodeModules: false,
  }
);

// Register .ios.js extension
require.extensions['.ios.js'] = require.extensions['.js'];

// Process React Native modules
const processReactNative = (code: string, filename: string): string => {
  const cachePath = path.join(cacheDir, cacheFileName(filename, code));

  const cached = readFromCache(cachePath);
  if (cached !== null) return cached;

  const mock = getMocked(filename);
  if (mock) {
    const original = mock.code.includes('__vitest__original__')
      ? `const __vitest__original__ = ((module, exports) => {
      ${transformCode(code, filename)}
      return module.exports
    })(module, exports);`
      : '';
    const mockCode = `${original}\n${mock.code}`;
    tryWriteToCache(cachePath, mockCode);
    return mockCode;
  }

  const transformed = transformCode(code, filename);
  tryWriteToCache(cachePath, transformed);
  return transformed;
};

// Hook for React Native JavaScript files
addHook((code, filename) => processReactNative(code, filename), {
  exts: ['.js', '.ios.js'],
  ignoreNodeModules: false,
  matcher: (id) => {
    const p = normalize(id);
    return (
      (p.includes('/node_modules/react-native/') ||
        p.includes('/node_modules/@react-native/') ||
        p.includes('/node_modules/@react-native-community/')) &&
      !p.includes('Renderer/implementations')
    );
  },
});

// ============================================================================
// STEP 6: Load polyfills
// ============================================================================

try {
  require('@react-native/polyfills/Object.es8');
} catch {
  /* polyfills may not be available */
}

// React Native's real error-guard polyfill, which assigns global.ErrorUtils. Library
// code reads it at module scope — Expo's Expo.fx calls getGlobalHandler() while
// loading — so without it those imports fail before any test runs. Loaded here rather
// than in STEP 1 because it is Flow-typed and needs the require hook already installed.
try {
  require('@react-native/polyfills/error-guard');
} catch {
  /* polyfills may not be available */
}

try {
  g.regeneratorRuntime = require('regenerator-runtime/runtime');
} catch {
  /* regenerator-runtime may not be available */
}

// ============================================================================
// STEP 7: Mock registration helper
// ============================================================================

const mock = (modulePath: string, mockCode: string | (() => string)): void => {
  const code = typeof mockCode === 'function' ? mockCode() : mockCode;
  mocked.push({ path: modulePath, code: `module.exports = ${code}` });
};

// Helper for touchable components that should be accessible by default
// Maps `disabled` prop to `accessibilityState.disabled` like real React Native does,
// so @testing-library/react-native's toBeDisabled()/toBeEnabled() matchers work correctly.
const createAccessibleTouchableMock = (displayName: string): string => `(() => {
  const React = require('react');
  const ${displayName} = React.forwardRef((props, ref) => {
    const { disabled, accessibilityState, ...rest } = props;
    const mergedAccessibilityState = disabled != null || accessibilityState
      ? { ...accessibilityState, ...(disabled != null ? { disabled: !!disabled } : {}) }
      : undefined;
    React.useImperativeHandle(ref, () => global.__vrnHostInstance(), []);
    return React.createElement('${displayName}', {
      ...rest,
      disabled,
      accessible: props.accessible !== false,
      ...(mergedAccessibilityState ? { accessibilityState: mergedAccessibilityState } : {}),
    }, props.children);
  });
  ${displayName}.displayName = '${displayName}';
  return { __esModule: true, default: ${displayName} };
})()`;

// ============================================================================
// STEP 8: Register all mocks
// ============================================================================

// Core initialization
mock('react-native/Libraries/Core/InitializeCore', () => '{}');

mock(
  'react-native/Libraries/Core/NativeExceptionsManager',
  () => `{
  __esModule: true,
  default: {
    reportFatalException: vi.fn(),
    reportSoftException: vi.fn(),
    updateExceptionMessage: vi.fn(),
    dismissRedbox: vi.fn(),
    reportException: vi.fn(),
  }
}`
);

// TurboModule Registry - critical for RN 0.83+
mock(
  'react-native/Libraries/TurboModule/TurboModuleRegistry',
  () => `{
  get: (name) => global.__turboModuleProxy ? global.__turboModuleProxy(name) : null,
  getEnforcing: (name) => {
    const module = global.__turboModuleProxy ? global.__turboModuleProxy(name) : null;
    if (module) return module;
    // Return a safe Proxy mock instead of {} so any method call
    // (like getConstants()) is a no-op rather than a crash
    return new Proxy({}, {
      get: (_, prop) => {
        if (typeof prop !== 'string') return undefined;
        if (prop === 'getConstants' || prop === 'getConstantsForViewManager') return () => ({});
        if (prop === 'getDefaultEventTypes') return () => [];
        return () => {};
      },
    });
  },
}`
);

// Feature Flags - explicit defaults for every known flag (RN 0.83–0.87, flags
// removed upstream are kept for older versions) so named imports, Object.keys,
// spreads and `import * as` see the full surface. `import * as` goes through
// esbuild's ESM interop, which copies own properties only, so the Proxy
// fallback below does NOT help RN internals — new flags must be listed here.
mock(
  'react-native/src/private/featureflags/ReactNativeFeatureFlags',
  () => `(() => {
  const f = (v) => () => v;
  const defaults = {
    animatedDeferStartOfTimingAnimations: f(false),
    animatedForceNativeDriver: f(false),
    animatedShouldDebounceQueueFlush: f(false),
    animatedShouldSyncValueBeforeStartCallback: f(true),
    animatedShouldUseSingleOp: f(false),
    cdpInteractionMetricsEnabled: f(false),
    commonTestFlag: f(false),
    commonTestFlagWithoutNativeImplementation: f(false),
    configurePressabilityDuringInsertion: f(false),
    cxxNativeAnimatedEnabled: f(false),
    cxxNativeAnimatedRemoveJsSync: f(false),
    defaultTextToOverflowHidden: f(true),
    deferFlatListFocusChangeRenderUpdate: f(false),
    disableEarlyViewCommandExecution: f(false),
    disableFabricCommitInCXXAnimated: f(false),
    disableImageViewPreallocationAndroid: f(false),
    disableMaintainVisibleContentPosition: f(false),
    disableMountItemReorderingAndroid: f(false),
    disableOldAndroidAttachmentMetricsWorkarounds: f(true),
    disableSubviewClippingAndroid: f(false),
    disableTextLayoutManagerCacheAndroid: f(false),
    disableViewPreallocationAndroid: f(false),
    enableAccessibilityOrder: f(false),
    enableAccumulatedUpdatesInRawPropsAndroid: f(false),
    enableAndroidFontWeightAdjustment: f(true),
    enableAndroidLinearText: f(false),
    enableAndroidTextMeasurementOptimizations: f(false),
    enableBridgelessArchitecture: f(false),
    enableCppPropsIteratorSetter: f(false),
    enableCustomFocusSearchOnClippedElementsAndroid: f(true),
    enableDestroyShadowTreeRevisionAsync: f(false),
    enableDoubleMeasurementFixAndroid: f(false),
    enableEagerMainQueueModulesOnIOS: f(false),
    enableEagerRootViewAttachment: f(false),
    enableExclusivePropsUpdateAndroid: f(false),
    enableFabricCommitBranching: f(false),
    enableFabricLogs: f(false),
    enableFabricRenderer: f(false),
    enableFlexboxAutoMinSizeInStrictMode: f(false),
    enableFontScaleChangesUpdatingLayout: f(true),
    enableImagePrefetchingAndroid: f(false),
    enableImagePrefetchingOnUiThreadAndroid: f(false),
    enableImmediateUpdateModeForContentOffsetChanges: f(false),
    enableImperativeEvents: f(false),
    enableImperativeFocus: f(false),
    enableInteropViewManagerClassLookUpOptimizationIOS: f(false),
    enableIntersectionObserverByDefault: f(false),
    enableIOSCompressedTextFrameAdjustment: f(false),
    enableIOSTextBaselineOffsetPerLine: f(false),
    enableIOSViewClipToPaddingBox: f(false),
    enableKeyEvents: f(false),
    enableLayoutAnimationsOnAndroid: f(false),
    enableLayoutAnimationsOnIOS: f(true),
    enableMainQueueCoordinatorOnIOS: f(false),
    enableModuleArgumentNSNullConversionIOS: f(false),
    enableMutationObserverByDefault: f(false),
    enableNativeCSSParsing: f(false),
    enableNativeEventTargetEventDispatching: f(false),
    enableNetworkEventReporting: f(true),
    enablePreparedTextLayout: f(false),
    enablePropsUpdateReconciliationAndroid: f(false),
    enableResourceTimingAPI: f(true),
    enableRuntimeSchedulerQueueClearingOnError: f(false),
    enableSchedulerDelegateInvalidation: f(false),
    enableSwiftUIBasedFilters: f(false),
    enableViewCulling: f(false),
    enableViewRecycling: f(false),
    enableViewRecyclingForImage: f(true),
    enableViewRecyclingForScrollView: f(false),
    enableViewRecyclingForText: f(true),
    enableViewRecyclingForView: f(true),
    enableVirtualViewClippingWithoutScrollViewClipping: f(true),
    enableVirtualViewContainerStateExperimental: f(false),
    enableVirtualViewDebugFeatures: f(false),
    enableVirtualViewExperimental: f(false),
    enableVirtualViewRenderState: f(true),
    enableVirtualViewWindowFocusDetection: f(false),
    enableWebPerformanceAPIsByDefault: f(true),
    externalElementInspectionEnabled: f(true),
    fixDifferentiatorParentTagForUnflattenCase: f(true),
    fixMappingOfEventPrioritiesBetweenFabricAndReact: f(false),
    fixVirtualizeListCollapseWindowSize: f(false),
    fixYogaFlexBasisFitContentInMainAxis: f(false),
    fuseboxAssertSingleHostState: f(true),
    fuseboxEnabledRelease: f(false),
    fuseboxFrameRecordingEnabled: f(false),
    fuseboxNetworkInspectionEnabled: f(true),
    fuseboxScreenshotCaptureEnabled: f(false),
    hideOffscreenVirtualViewsOnIOS: f(false),
    isLayoutAnimationEnabled: f(true),
    jsOnlyTestFlag: f(false),
    optimizedAnimatedPropUpdates: f(false),
    overrideBySynchronousMountPropsAtMountingAndroid: f(true),
    perfIssuesEnabled: f(false),
    perfMonitorV2Enabled: f(false),
    preparedTextCacheSize: f(200),
    preventShadowTreeCommitExhaustion: f(false),
    redBoxV2Android: f(false),
    redBoxV2IOS: f(false),
    reduceDefaultPropsInImage: f(false),
    reduceDefaultPropsInText: f(false),
    shouldPressibilityUseW3CPointerEventsForHover: f(false),
    shouldTriggerResponderTransferOnScrollAndroid: f(false),
    shouldUseAnimatedObjectForTransform: f(false),
    shouldUseRemoveClippedSubviewsAsDefaultOnIOS: f(false),
    shouldUseSetNativePropsInFabric: f(true),
    skipActivityIdentityAssertionOnHostPause: f(false),
    sweepActiveTouchOnChildNativeGesturesAndroid: f(true),
    syncAndroidClipBoundsWithOverflow: f(false),
    traceTurboModulePromiseRejectionsOnAndroid: f(false),
    updateRuntimeShadowNodeReferencesOnCommit: f(false),
    updateRuntimeShadowNodeReferencesOnCommitThread: f(false),
    useAlwaysAvailableJSErrorHandling: f(false),
    useFabricInterop: f(true),
    useNativeEqualsInNativeReadableArrayAndroid: f(true),
    useNativeTransformHelperAndroid: f(true),
    useNativeViewConfigsInBridgelessMode: f(false),
    useNestedScrollViewAndroid: f(false),
    useOptimizedEventBatchingOnAndroid: f(false),
    useRawPropsJsiValue: f(true),
    useShadowNodeStateOnClone: f(false),
    useSharedAnimatedBackend: f(false),
    useTraitHiddenOnAndroid: f(false),
    useTurboModuleInterop: f(false),
    useTurboModules: f(false),
    viewCullingOutsetRatio: f(0),
    viewTransitionEnabled: f(false),
    viewTransitionUseHardwareBitmapAndroid: f(false),
    virtualViewActivityBehavior: f("no-activity"),
    virtualViewHysteresisRatio: f(0),
    virtualViewPrerenderRatio: f(5),
    override: () => {},
  };
  return new Proxy(defaults, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      if (typeof prop === 'string') return () => false;
      return undefined;
    },
  });
})()`
);

mock(
  'react-native/src/private/featureflags/ReactNativeFeatureFlagsBase',
  () => `{
  createJavaScriptFlagGetter: (configGetter, flagName, defaultValue) => () => defaultValue,
  createNativeFlagGetter: (flagName, defaultValue) => () => defaultValue,
  setOverrides: () => {},
}`
);

mock(
  'react-native/src/private/featureflags/specs/NativeReactNativeFeatureFlags',
  () => `{
  __esModule: true,
  default: global.__turboModuleProxy ? global.__turboModuleProxy('NativeReactNativeFeatureFlagsCxx') : {},
}`
);

// StyleSheet
mock(
  'react-native/Libraries/StyleSheet/StyleSheet',
  () => `(() => {
  const StyleSheet = {
    create: (styles) => styles,
    flatten: (style) => {
      if (!style) return {};
      if (Array.isArray(style)) {
        return Object.assign({}, ...style.filter(Boolean));
      }
      return style;
    },
    compose: (style1, style2) => [style1, style2],
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    hairlineWidth: 0.5,
    setStyleAttributePreprocessor: () => {},
  };
  return { __esModule: true, default: StyleSheet, ...StyleSheet };
})()`
);

// Platform
mock(
  'react-native/Libraries/Utilities/Platform',
  () => `(() => {
  // One source for the initial values and the reset hook below.
  const RESTING = { OS: 'ios', Version: '17.0' };
  const Platform = {
    OS: RESTING.OS,
    Version: RESTING.Version,
    isPad: false,
    isTesting: true,
    isTV: false,
    isVision: false,
    constants: {
      reactNativeVersion: ${rnVersionLiteral},
    },
    // Reads Platform.OS at call time, so a test that sets \`Platform.OS = 'android'\`
    // gets the Android branch. Baking the OS in at build time silently returned the
    // iOS value to every Android test.
    //
    // Key presence (\`in\`), not \`??\`, matching RN's own Platform.ios.js: an explicit
    // \`{ ios: undefined }\` selects undefined rather than falling through to default.
    select: (obj) => {
      if (Platform.OS in obj) return obj[Platform.OS];
      if ('native' in obj) return obj.native;
      return obj.default;
    },
  };
  global.__vrnRegisterStateful('Platform', () => {
    Platform.OS = RESTING.OS;
    Platform.Version = RESTING.Version;
  });

  // The spread copies OS by value onto the module namespace, so select() follows
  // mutations made through the default export (what \`import { Platform }\` and RN's
  // internals use) but not through \`require(...).OS\`. The default export is the
  // supported path for switching platform.
  return { __esModule: true, default: Platform, ...Platform };
})()`
);

// UIManager
mock(
  'react-native/Libraries/ReactNative/UIManager',
  () => `{
  __esModule: true,
  default: {
    AndroidViewPager: { Commands: { setPage: vi.fn(), setPageWithoutAnimation: vi.fn() } },
    blur: vi.fn(),
    createView: vi.fn(),
    customBubblingEventTypes: {},
    customDirectEventTypes: {},
    dispatchViewManagerCommand: vi.fn(),
    focus: vi.fn(),
    getViewManagerConfig: vi.fn((name) => {
      if (name === 'AndroidDrawerLayout') {
        return { Constants: { DrawerPosition: { Left: 10 } } };
      }
      return null;
    }),
    hasViewManagerConfig: vi.fn((name) => name === 'AndroidDrawerLayout'),
    measure: vi.fn(),
    manageChildren: vi.fn(),
    removeSubviewsFromContainerWithID: vi.fn(),
    replaceExistingNonRootView: vi.fn(),
    setChildren: vi.fn(),
    updateView: vi.fn(),
    AndroidDrawerLayout: { Constants: { DrawerPosition: { Left: 10 } } },
    AndroidTextInput: { Commands: {} },
    ScrollView: { Constants: {} },
    View: { Constants: {} },
  },
}`
);

// NativeModules
mock(
  'react-native/Libraries/BatchedBridge/NativeModules',
  () => `(() => {
  const base = {
  AlertManager: { alertWithArgs: vi.fn() },
  AsyncLocalStorage: {
    multiGet: vi.fn((keys, cb) => process.nextTick(() => cb(null, []))),
    multiSet: vi.fn((entries, cb) => process.nextTick(() => cb(null))),
    multiRemove: vi.fn((keys, cb) => process.nextTick(() => cb(null))),
    multiMerge: vi.fn((entries, cb) => process.nextTick(() => cb(null))),
    clear: vi.fn((cb) => process.nextTick(() => cb(null))),
    getAllKeys: vi.fn((cb) => process.nextTick(() => cb(null, []))),
  },
  DeviceInfo: {
    getConstants: () => ({
      Dimensions: {
        window: { fontScale: 1, height: 1334, scale: 2, width: 750 },
        screen: { fontScale: 1, height: 1334, scale: 2, width: 750 },
      },
    }),
  },
  DevSettings: { addMenuItem: vi.fn(), reload: vi.fn() },
  ImageLoader: {
    getSize: vi.fn(() => Promise.resolve([320, 240])),
    getSizeWithHeaders: vi.fn(() => Promise.resolve({ width: 320, height: 240 })),
    prefetchImage: vi.fn(() => Promise.resolve()),
    prefetchImageWithMetadata: vi.fn(() => Promise.resolve()),
    queryCache: vi.fn(() => Promise.resolve({})),
  },
  ImageViewManager: {
    getSize: vi.fn((uri, success) => process.nextTick(() => success(320, 240))),
    prefetchImage: vi.fn(),
  },
  KeyboardObserver: { addListener: vi.fn(), removeListeners: vi.fn() },
  NativeAnimatedModule: {
    createAnimatedNode: vi.fn(),
    updateAnimatedNodeConfig: vi.fn(),
    getValue: vi.fn(),
    startListeningToAnimatedNodeValue: vi.fn(),
    stopListeningToAnimatedNodeValue: vi.fn(),
    connectAnimatedNodes: vi.fn(),
    disconnectAnimatedNodes: vi.fn(),
    startAnimatingNode: vi.fn((animationId, nodeTag, config, endCallback) => {
      setTimeout(() => endCallback({ finished: true }), 16);
    }),
    stopAnimation: vi.fn(),
    setAnimatedNodeValue: vi.fn(),
    setAnimatedNodeOffset: vi.fn(),
    flattenAnimatedNodeOffset: vi.fn(),
    extractAnimatedNodeOffset: vi.fn(),
    connectAnimatedNodeToView: vi.fn(),
    disconnectAnimatedNodeFromView: vi.fn(),
    restoreDefaultValues: vi.fn(),
    dropAnimatedNode: vi.fn(),
    addAnimatedEventToView: vi.fn(),
    removeAnimatedEventFromView: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    removeListeners: vi.fn(),
  },
  Networking: { sendRequest: vi.fn(), abortRequest: vi.fn(), addListener: vi.fn(), removeListeners: vi.fn() },
  PlatformConstants: {
    getConstants: () => ({ isTesting: true, reactNativeVersion: ${rnVersionLiteral} }),
  },
  SourceCode: { getConstants: () => ({ scriptURL: null }) },
  StatusBarManager: {
    setColor: vi.fn(),
    setStyle: vi.fn(),
    setHidden: vi.fn(),
    setNetworkActivityIndicatorVisible: vi.fn(),
    setBackgroundColor: vi.fn(),
    setTranslucent: vi.fn(),
    getConstants: () => ({ HEIGHT: 42, DEFAULT_BACKGROUND_COLOR: 0 }),
  },
  Timing: { createTimer: vi.fn(), deleteTimer: vi.fn() },
  UIManager: {},
  BlobModule: {
    getConstants: () => ({ BLOB_URI_SCHEME: 'content', BLOB_URI_HOST: null }),
    addNetworkingHandler: vi.fn(),
    enableBlobSupport: vi.fn(),
    disableBlobSupport: vi.fn(),
    createFromParts: vi.fn(),
    sendBlob: vi.fn(),
    release: vi.fn(),
  },
  WebSocketModule: {
    connect: vi.fn(),
    send: vi.fn(),
    sendBinary: vi.fn(),
    ping: vi.fn(),
    close: vi.fn(),
    addListener: vi.fn(),
    removeListeners: vi.fn(),
  },
  I18nManager: {
    allowRTL: vi.fn(),
    forceRTL: vi.fn(),
    swapLeftAndRightInRTL: vi.fn(),
    getConstants: () => ({ isRTL: false, doLeftAndRightSwapInRTL: true, localeIdentifier: 'en_US' }),
  },
  };
  const overrides = global.__vrnNativeModuleOverrides;

  return {
    __esModule: true,
    // A Proxy, so a mockNativeModule() stand-in is visible here as well as through
    // TurboModuleRegistry. Nothing is written into the base object, so clearing the
    // override map is all a reset has to do.
    default: new Proxy(base, {
      get: (target, prop) =>
        typeof prop === 'string' && overrides.has(prop) ? overrides.get(prop) : target[prop],
      has: (target, prop) =>
        (typeof prop === 'string' && overrides.has(prop)) || prop in target,
    }),
  };
})()`
);

// NativeComponentRegistry
mock(
  'react-native/Libraries/NativeComponent/NativeComponentRegistry',
  () => `{
  get: (name, viewConfigProvider) => {
    // .default: the requireNativeComponent mock is an ES module shape, so the
    // namespace object itself is not callable.
    const requireNativeComponent = require('react-native/Libraries/ReactNative/requireNativeComponent').default;
    return requireNativeComponent(name);
  },
  getWithFallback_DEPRECATED: (name, viewConfigProvider) => {
    // .default: the requireNativeComponent mock is an ES module shape, so the
    // namespace object itself is not callable.
    const requireNativeComponent = require('react-native/Libraries/ReactNative/requireNativeComponent').default;
    return requireNativeComponent(name);
  },
  setRuntimeConfigProvider: () => {},
}`
);

// requireNativeComponent
mock(
  'react-native/Libraries/ReactNative/requireNativeComponent',
  () => `(() => {
  const React = require('react');
  let nativeTag = 1;

  const requireNativeComponent = (viewName) => {
    const Component = class extends React.Component {
      _nativeTag = nativeTag++;
      render() {
        return React.createElement(viewName, this.props, this.props.children);
      }
      blur = vi.fn();
      focus = vi.fn();
      measure = vi.fn();
      measureInWindow = vi.fn();
      measureLayout = vi.fn();
      setNativeProps = vi.fn();
    };
    Component.displayName = viewName === 'RCTView' ? 'View' : viewName;
    return Component;
  };
  return { __esModule: true, default: requireNativeComponent };
})()`
);

// View
mock(
  'react-native/Libraries/Components/View/View',
  () => `(() => {
  const React = require('react');
  const View = React.forwardRef((props, ref) => {
    const accessible = props.accessible !== undefined ? props.accessible
      : !!(props.accessibilityRole || props.accessibilityLabel || props.role);
    React.useImperativeHandle(ref, () => global.__vrnHostInstance(), []);
    return React.createElement('View', { ...props, accessible }, props.children);
  });
  View.displayName = 'View';
  return { __esModule: true, default: View };
})()`
);

// ViewNativeComponent
mock(
  'react-native/Libraries/Components/View/ViewNativeComponent',
  () => `(() => {
  const React = require('react');
  const ViewNativeComponent = React.forwardRef((props, ref) => {
    const accessible = props.accessible !== undefined ? props.accessible
      : !!(props.accessibilityRole || props.accessibilityLabel || props.role);
    React.useImperativeHandle(ref, () => global.__vrnHostInstance(), []);
    return React.createElement('View', { ...props, accessible }, props.children);
  });
  ViewNativeComponent.displayName = 'View';
  const Commands = {
    focus: () => {},
    blur: () => {},
    hotspotUpdate: () => {},
    setPressed: () => {},
  };
  return { __esModule: true, default: ViewNativeComponent, Commands };
})()`
);

// Text
mock(
  'react-native/Libraries/Text/Text',
  () => `(() => {
  const React = require('react');
  const Text = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => global.__vrnHostInstance(), []);
    return React.createElement('Text', { ...props }, props.children);
  });
  Text.displayName = 'Text';
  return { __esModule: true, default: Text };
})()`
);

// TextInput
mock(
  'react-native/Libraries/Components/TextInput/TextInput',
  () => `(() => {
  const React = require('react');
  const TextInput = React.forwardRef((props, ref) => {
    // A ref, not state: focus() must be observable by isFocused() without a re-render.
    const focused = React.useRef(false);
    React.useImperativeHandle(ref, () => ({
      ...global.__vrnHostInstance(),
      focus: vi.fn(() => {
        focused.current = true;
      }),
      blur: vi.fn(() => {
        focused.current = false;
      }),
      isFocused: vi.fn(() => focused.current),
      clear: vi.fn(),
      setSelection: vi.fn(),
    }), []);
    return React.createElement('TextInput', { ...props });
  });
  TextInput.displayName = 'TextInput';
  TextInput.State = {
    currentlyFocusedInput: vi.fn(() => null),
    currentlyFocusedField: vi.fn(() => null),
    focusTextInput: vi.fn(),
    blurTextInput: vi.fn(),
  };
  return { __esModule: true, default: TextInput };
})()`
);

// Image
mock(
  'react-native/Libraries/Image/Image',
  () => `(() => {
  const React = require('react');
  const Image = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => global.__vrnHostInstance(), []);
    return React.createElement('Image', { ...props });
  });
  Image.displayName = 'Image';
  Image.getSize = vi.fn((uri, success, failure) => success && success(100, 100));
  Image.getSizeWithHeaders = vi.fn(() => Promise.resolve({ width: 100, height: 100 }));
  Image.prefetch = vi.fn(() => Promise.resolve());
  Image.prefetchWithMetadata = vi.fn(() => Promise.resolve());
  Image.queryCache = vi.fn(() => Promise.resolve({}));
  Image.resolveAssetSource = vi.fn((source) => source);
  return { __esModule: true, default: Image };
})()`
);

// Modal
mock(
  'react-native/Libraries/Modal/Modal',
  () => `(() => {
  const React = require('react');
  class Modal extends React.Component {
    render() {
      if (this.props.visible === false) {
        return null;
      }
      return React.createElement('Modal', this.props, this.props.children);
    }
  }
  Modal.displayName = 'Modal';
  return { __esModule: true, default: Modal };
})()`
);

mock(
  'react-native/Libraries/Modal/NativeModalManager',
  () => `{
  __esModule: true,
  default: null,
}`
);

mock(
  'react-native/src/private/specs_DEPRECATED/modules/NativeModalManager',
  () => `{
  __esModule: true,
  default: null,
}`
);

// ScrollView
mock(
  'react-native/Libraries/Components/ScrollView/ScrollView',
  () => `(() => {
  const React = require('react');
  class ScrollView extends React.Component {
    scrollTo = vi.fn();
    scrollToEnd = vi.fn();
    flashScrollIndicators = vi.fn();
    getScrollResponder = vi.fn(() => this);
    getScrollableNode = vi.fn();
    getInnerViewNode = vi.fn();
    getInnerViewRef = vi.fn();
    getNativeScrollRef = vi.fn();
    scrollResponderZoomTo = vi.fn();
    scrollResponderScrollNativeHandleToKeyboard = vi.fn();

    render() {
      return React.createElement('ScrollView', this.props, this.props.children);
    }
  }
  ScrollView.displayName = 'ScrollView';
  return { __esModule: true, default: ScrollView };
})()`
);

// ActivityIndicator
mock(
  'react-native/Libraries/Components/ActivityIndicator/ActivityIndicator',
  () => `(() => {
  const React = require('react');
  const ActivityIndicator = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => global.__vrnHostInstance(), []);
    return React.createElement('ActivityIndicator', { ...props });
  });
  ActivityIndicator.displayName = 'ActivityIndicator';
  return { __esModule: true, default: ActivityIndicator };
})()`
);

// Pressable
mock(
  'react-native/Libraries/Components/Pressable/Pressable',
  () => `(() => {
  const React = require('react');
  const Pressable = React.forwardRef((props, ref) => {
    const { children, style, disabled, accessibilityState, onPress, onPressIn, onPressOut, onLongPress, ...rest } = props;
    const resolvedStyle = typeof style === 'function' ? style({ pressed: false }) : style;
    const resolvedChildren = typeof children === 'function' ? children({ pressed: false }) : children;
    const mergedAccessibilityState = disabled != null || accessibilityState
      ? { ...accessibilityState, ...(disabled != null ? { disabled: !!disabled } : {}) }
      : undefined;
    React.useImperativeHandle(ref, () => global.__vrnHostInstance(), []);
    return React.createElement('Pressable', {
      ...rest,
      accessible: props.accessible !== false,
      style: resolvedStyle,
      onPress: disabled ? undefined : onPress,
      onPressIn,
      onPressOut,
      onLongPress,
      disabled,
      ...(mergedAccessibilityState ? { accessibilityState: mergedAccessibilityState } : {}),
    }, resolvedChildren);
  });
  Pressable.displayName = 'Pressable';
  return { __esModule: true, default: Pressable };
})()`
);

// TouchableOpacity
mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () =>
  createAccessibleTouchableMock('TouchableOpacity')
);

// TouchableHighlight
mock('react-native/Libraries/Components/Touchable/TouchableHighlight', () =>
  createAccessibleTouchableMock('TouchableHighlight')
);

// SafeAreaView
mock(
  'react-native/Libraries/Components/SafeAreaView/SafeAreaView',
  () => `(() => {
  const React = require('react');
  const SafeAreaView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => global.__vrnHostInstance(), []);
    return React.createElement('SafeAreaView', { ...props }, props.children);
  });
  SafeAreaView.displayName = 'SafeAreaView';
  return { __esModule: true, default: SafeAreaView };
})()`
);

// StatusBar
mock(
  'react-native/Libraries/Components/StatusBar/StatusBar',
  () => `(() => {
  const React = require('react');
  class StatusBar extends React.Component {
    static currentHeight = 42;
    static setBarStyle = vi.fn();
    static setHidden = vi.fn();
    // Removed in RN 0.87.
    ${rnBefore(0, 87) ? `static setBackgroundColor = vi.fn();
    static setNetworkActivityIndicatorVisible = vi.fn();
    static setTranslucent = vi.fn();` : ''}
    static pushStackEntry = vi.fn(() => ({}));
    static popStackEntry = vi.fn();
    static replaceStackEntry = vi.fn(() => ({}));
    render() { return null; }
  }
  return { __esModule: true, default: StatusBar };
})()`
);

// Switch
mock(
  'react-native/Libraries/Components/Switch/Switch',
  () => `(() => {
  const React = require('react');
  const Switch = React.forwardRef((props, ref) => {
    const { disabled, accessibilityState, ...rest } = props;
    const mergedAccessibilityState = disabled != null || accessibilityState
      ? { ...accessibilityState, ...(disabled != null ? { disabled: !!disabled } : {}) }
      : undefined;
    React.useImperativeHandle(ref, () => global.__vrnHostInstance(), []);
    return React.createElement('Switch', {
      ...rest,
      disabled,
      ...(mergedAccessibilityState ? { accessibilityState: mergedAccessibilityState } : {}),
    });
  });
  Switch.displayName = 'Switch';
  return { __esModule: true, default: Switch };
})()`
);

// FlatList
mock(
  'react-native/Libraries/Lists/FlatList',
  () => `(() => {
  const React = require('react');
  class FlatList extends React.Component {
    scrollToEnd = vi.fn();
    scrollToIndex = vi.fn();
    scrollToItem = vi.fn();
    scrollToOffset = vi.fn();
    recordInteraction = vi.fn();
    flashScrollIndicators = vi.fn();
    getScrollResponder = vi.fn();
    getNativeScrollRef = vi.fn();
    getScrollableNode = vi.fn();

    render() {
      const { data, renderItem, ListHeaderComponent, ListFooterComponent, ListEmptyComponent, ItemSeparatorComponent, keyExtractor, ...rest } = this.props;
      const children = [];

      if (ListHeaderComponent) {
        children.push(React.createElement('View', { key: 'header' },
          typeof ListHeaderComponent === 'function' ? React.createElement(ListHeaderComponent) : ListHeaderComponent));
      }

      if (data && data.length > 0) {
        data.forEach((item, index) => {
          if (index > 0 && ItemSeparatorComponent) {
            children.push(React.createElement(ItemSeparatorComponent, { key: 'sep-' + index }));
          }
          const key = keyExtractor ? keyExtractor(item, index) : index.toString();
          children.push(renderItem({ item, index, separators: {} }));
        });
      } else if (ListEmptyComponent) {
        children.push(typeof ListEmptyComponent === 'function' ? React.createElement(ListEmptyComponent) : ListEmptyComponent);
      }

      if (ListFooterComponent) {
        children.push(React.createElement('View', { key: 'footer' },
          typeof ListFooterComponent === 'function' ? React.createElement(ListFooterComponent) : ListFooterComponent));
      }

      return React.createElement('FlatList', rest, children);
    }
  }
  FlatList.displayName = 'FlatList';
  return { __esModule: true, default: FlatList };
})()`
);

// SectionList
mock(
  'react-native/Libraries/Lists/SectionList',
  () => `(() => {
  const React = require('react');
  class SectionList extends React.Component {
    scrollToLocation = vi.fn();
    recordInteraction = vi.fn();
    flashScrollIndicators = vi.fn();
    getScrollResponder = vi.fn();
    getNativeScrollRef = vi.fn();
    getScrollableNode = vi.fn();

    render() {
      const { sections, renderItem, renderSectionHeader, ListHeaderComponent, ListFooterComponent, ListEmptyComponent, ItemSeparatorComponent, SectionSeparatorComponent, keyExtractor, ...rest } = this.props;
      const children = [];

      if (ListHeaderComponent) {
        children.push(React.createElement('View', { key: 'list-header' },
          typeof ListHeaderComponent === 'function' ? React.createElement(ListHeaderComponent) : ListHeaderComponent));
      }

      if (sections && sections.length > 0) {
        sections.forEach((section, sectionIndex) => {
          if (renderSectionHeader) {
            children.push(React.cloneElement(renderSectionHeader({ section }), { key: 'section-header-' + sectionIndex }));
          }
          if (section.data && section.data.length > 0) {
            section.data.forEach((item, itemIndex) => {
              if (itemIndex > 0 && ItemSeparatorComponent) {
                children.push(React.createElement(ItemSeparatorComponent, { key: 'sep-' + sectionIndex + '-' + itemIndex }));
              }
              const key = keyExtractor ? keyExtractor(item, itemIndex) : sectionIndex + '-' + itemIndex;
              const element = renderItem({ item, index: itemIndex, section, separators: {} });
              children.push(React.cloneElement(element, { key }));
            });
          }
          if (sectionIndex < sections.length - 1 && SectionSeparatorComponent) {
            children.push(React.createElement(SectionSeparatorComponent, { key: 'section-sep-' + sectionIndex }));
          }
        });
      } else if (ListEmptyComponent) {
        children.push(React.createElement('View', { key: 'empty' },
          typeof ListEmptyComponent === 'function' ? React.createElement(ListEmptyComponent) : ListEmptyComponent));
      }

      if (ListFooterComponent) {
        children.push(React.createElement('View', { key: 'list-footer' },
          typeof ListFooterComponent === 'function' ? React.createElement(ListFooterComponent) : ListFooterComponent));
      }

      return React.createElement('SectionList', rest, children);
    }
  }
  SectionList.displayName = 'SectionList';
  return { __esModule: true, default: SectionList };
})()`
);

// Dimensions
mock(
  'react-native/Libraries/Utilities/Dimensions',
  () => `(() => {
  // One source for both the initial value and _reset(), so a wrong initial value
  // cannot hide behind a suite that resets before asserting.
  const DEFAULTS = {
    window: { width: 750, height: 1334, scale: 2, fontScale: 1 },
    screen: { width: 750, height: 1334, scale: 2, fontScale: 1 },
  };
  const state = { window: { ...DEFAULTS.window }, screen: { ...DEFAULTS.screen } };
  const listeners = new Set();
  const has = (dim) => Object.prototype.hasOwnProperty.call(state, dim);
  const snapshot = () => ({ window: { ...state.window }, screen: { ...state.screen } });
  const reset = () => {
    Object.assign(state.window, DEFAULTS.window);
    Object.assign(state.screen, DEFAULTS.screen);
    listeners.clear();
  };
  global.__vrnRegisterStateful('Dimensions', reset);

  return {
    __esModule: true,
    default: {
      // A copy: a caller mutating the result must not corrupt the mock's state.
      get: vi.fn((dim) => (has(dim) ? { ...state[dim] } : {})),
      // Merges, as React Native's does — set({ window: { width } }) keeps the height.
      set: vi.fn((dims) => {
        for (const dim of Object.keys(dims || {})) {
          if (has(dim) && dims[dim]) Object.assign(state[dim], dims[dim]);
        }
        listeners.forEach((listener) => listener(snapshot()));
      }),
      addEventListener: vi.fn((type, handler) => {
        listeners.add(handler);
        return { remove: () => listeners.delete(handler) };
      }),
      // Not part of React Native's API: the mock's own hook for restoring the resting
      // state between tests.
      _reset: reset,
    },
  };
})()`
);

// PixelRatio
mock(
  'react-native/Libraries/Utilities/PixelRatio',
  () => `{
  __esModule: true,
  default: {
    get: () => 2,
    getFontScale: () => 1,
    getPixelSizeForLayoutSize: (size) => size * 2,
    roundToNearestPixel: (size) => Math.round(size * 2) / 2,
  },
}`
);

// AppState
mock(
  'react-native/Libraries/AppState/AppState',
  () => `(() => {
  const RESTING = 'active';
  let current = RESTING;
  const listeners = new Map();
  const reset = () => {
    current = RESTING;
    listeners.clear();
  };
  global.__vrnRegisterStateful('AppState', reset);

  return {
    __esModule: true,
    default: {
      addEventListener: vi.fn((event, handler) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(handler);
        return { remove: () => listeners.get(event) && listeners.get(event).delete(handler) };
      }),
      // A getter, because React Native exposes currentState as a property to read.
      // As a plain value it could not reflect _setState().
      get currentState() {
        return current;
      },
      isAvailable: true,
      // Not part of React Native's API. Fires 'change' handlers only: 'focus' and
      // 'blur' are Android window-focus events, not app-state transitions.
      _setState: (next) => {
        current = next;
        const handlers = listeners.get('change');
        if (handlers) handlers.forEach((handler) => handler(next));
      },
      _reset: reset,
    },
  };
})()`
);

// Linking
mock(
  'react-native/Libraries/Linking/Linking',
  () => `{
  __esModule: true,
  default: {
    openURL: vi.fn(() => Promise.resolve()),
    canOpenURL: vi.fn(() => Promise.resolve(true)),
    openSettings: vi.fn(() => Promise.resolve()),
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    getInitialURL: vi.fn(() => Promise.resolve(null)),
    sendIntent: vi.fn(() => Promise.resolve()),
  },
}`
);

// AccessibilityInfo
mock(
  'react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo',
  () => `{
  __esModule: true,
  default: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    announceForAccessibility: vi.fn(),
    announceForAccessibilityWithOptions: vi.fn(),
    isAccessibilityServiceEnabled: vi.fn(() => Promise.resolve(false)),
    isBoldTextEnabled: vi.fn(() => Promise.resolve(false)),
    isGrayscaleEnabled: vi.fn(() => Promise.resolve(false)),
    isInvertColorsEnabled: vi.fn(() => Promise.resolve(false)),
    isReduceMotionEnabled: vi.fn(() => Promise.resolve(false)),
    prefersCrossFadeTransitions: vi.fn(() => Promise.resolve(false)),
    isReduceTransparencyEnabled: vi.fn(() => Promise.resolve(false)),
    isScreenReaderEnabled: vi.fn(() => Promise.resolve(false)),
    setAccessibilityFocus: vi.fn(),
    sendAccessibilityEvent: vi.fn(),
    getRecommendedTimeoutMillis: vi.fn(() => Promise.resolve(0)),
  },
}`
);

// Clipboard
mock(
  'react-native/Libraries/Components/Clipboard/Clipboard',
  () => `{
  __esModule: true,
  default: {
    getString: vi.fn(() => Promise.resolve('')),
    setString: vi.fn(),
    hasString: vi.fn(() => Promise.resolve(false)),
  },
}`
);

// RefreshControl
mock(
  'react-native/Libraries/Components/RefreshControl/RefreshControl',
  () => `(() => {
  const React = require('react');
  const RefreshControl = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => global.__vrnHostInstance(), []);
    return React.createElement('RefreshControl', { ...props });
  });
  RefreshControl.displayName = 'RefreshControl';
  return { __esModule: true, default: RefreshControl };
})()`
);

// Vibration
mock(
  'react-native/Libraries/Vibration/Vibration',
  () => `{
  __esModule: true,
  default: {
    vibrate: vi.fn(),
    cancel: vi.fn(),
  },
}`
);

// Alert
mock(
  'react-native/Libraries/Alert/Alert',
  () => `{
  __esModule: true,
  default: {
    alert: vi.fn(),
    prompt: vi.fn(),
  },
}`
);

// Share
mock(
  'react-native/Libraries/Share/Share',
  () => `{
  __esModule: true,
  default: {
    share: vi.fn(() => Promise.resolve({ action: 'sharedAction' })),
  },
}`
);

// Keyboard
mock(
  'react-native/Libraries/Components/Keyboard/Keyboard',
  () => `(() => {
  // One source for the resting state and _reset(). Kept as a constant because suites
  // call _reset() before asserting, so a wrong construction-time value would pass
  // every gate.
  const RESTING = { visible: false, height: 0 };
  let visible = RESTING.visible;
  let height = RESTING.height;
  const listeners = new Map();

  const notify = (event, payload) => {
    const handlers = listeners.get(event);
    if (handlers) handlers.forEach((handler) => handler(payload));
  };
  const rest = () => {
    visible = RESTING.visible;
    height = RESTING.height;
  };
  // Read from Dimensions so the keyboard's frame matches the device the mocks describe.
  const frame = () => {
    const window = require('react-native/Libraries/Utilities/Dimensions').default.get('window');
    return { screenX: 0, screenY: window.height - height, width: window.width, height };
  };
  const hide = () => {
    rest();
    notify('keyboardDidHide', {});
  };
  const reset = () => {
    rest();
    listeners.clear();
  };
  global.__vrnRegisterStateful('Keyboard', reset);

  return {
    __esModule: true,
    default: {
      addListener: vi.fn((event, handler) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(handler);
        return { remove: () => listeners.get(event) && listeners.get(event).delete(handler) };
      }),
      removeListener: vi.fn((event, handler) => {
        if (listeners.get(event)) listeners.get(event).delete(handler);
      }),
      removeAllListeners: vi.fn((event) => {
        if (event) listeners.delete(event);
        else listeners.clear();
      }),
      // Dismissing hides the keyboard, as it does on a device.
      dismiss: vi.fn(hide),
      scheduleLayoutAnimation: vi.fn(),
      isVisible: vi.fn(() => visible),
      // null when hidden, matching real React Native — not undefined, not {}.
      metrics: vi.fn(() => (visible ? frame() : null)),
      // Not part of React Native's API: the mock's own simulation hooks.
      _show: (next = 336) => {
        visible = true;
        height = next;
        notify('keyboardDidShow', { endCoordinates: frame() });
      },
      _hide: hide,
      _reset: reset,
    },
  };
})()`
);

// LayoutAnimation
mock(
  'react-native/Libraries/LayoutAnimation/LayoutAnimation',
  () => `{
  __esModule: true,
  default: {
    configureNext: vi.fn(),
    create: vi.fn(),
    checkConfig: vi.fn(),
    Types: { spring: 'spring', linear: 'linear', easeInEaseOut: 'easeInEaseOut', easeIn: 'easeIn', easeOut: 'easeOut', keyboard: 'keyboard' },
    Properties: { opacity: 'opacity', scaleX: 'scaleX', scaleY: 'scaleY', scaleXY: 'scaleXY' },
    Presets: {
      easeInEaseOut: { duration: 300, type: 'easeInEaseOut' },
      linear: { duration: 500, type: 'linear' },
      spring: { duration: 700, type: 'spring', springDamping: 0.4 },
    },
  },
}`
);

// InteractionManager
mock(
  'react-native/Libraries/Interaction/InteractionManager',
  () => `{
  __esModule: true,
  default: {
    runAfterInteractions: vi.fn((task) => {
      if (typeof task === 'function') {
        task();
      } else if (task && typeof task.gen === 'function') {
        task.gen();
      }
      return { then: vi.fn(), done: vi.fn(), cancel: vi.fn() };
    }),
    createInteractionHandle: vi.fn(() => 1),
    clearInteractionHandle: vi.fn(),
    setDeadline: vi.fn(),
  },
}`
);

// PanResponder
mock(
  'react-native/Libraries/Interaction/PanResponder',
  () => `{
  __esModule: true,
  default: {
    create: vi.fn((config) => ({
      panHandlers: {
        onStartShouldSetResponder: vi.fn(),
        onMoveShouldSetResponder: vi.fn(),
        onStartShouldSetResponderCapture: vi.fn(),
        onMoveShouldSetResponderCapture: vi.fn(),
        onResponderGrant: vi.fn(),
        onResponderMove: vi.fn(),
        onResponderRelease: vi.fn(),
        onResponderTerminate: vi.fn(),
        onResponderTerminationRequest: vi.fn(),
      },
    })),
  },
}`
);

// NativeEventEmitter
mock(
  'react-native/Libraries/EventEmitter/NativeEventEmitter',
  () => `(() => {
  class NativeEventEmitter {
    constructor(nativeModule) { this._nativeModule = nativeModule; }
    addListener(eventType, listener, context) { return { remove: vi.fn() }; }
    removeListener(eventType, listener) {}
    removeAllListeners(eventType) {}
    removeSubscription(subscription) {}
    emit(eventType, ...args) {}
  }
  return { __esModule: true, default: NativeEventEmitter };
})()`
);

// Animated
mock(
  'react-native/Libraries/Animated/Animated',
  () => `{
  __esModule: true,
  default: {
    Value: class AnimatedValue {
      constructor(value) { this._value = value || 0; }
      setValue(value) { this._value = value; }
      setOffset(offset) {}
      flattenOffset() {}
      extractOffset() {}
      addListener(callback) { return '0'; }
      removeListener(id) {}
      removeAllListeners() {}
      stopAnimation(callback) { callback && callback(this._value); }
      resetAnimation(callback) { callback && callback(this._value); }
      interpolate(config) { return new this.constructor(0); }
    },
    ValueXY: class AnimatedValueXY {
      constructor(value) {
        this.x = new (require('react-native/Libraries/Animated/Animated').default.Value)(value?.x || 0);
        this.y = new (require('react-native/Libraries/Animated/Animated').default.Value)(value?.y || 0);
      }
      setValue(value) { this.x.setValue(value.x); this.y.setValue(value.y); }
      setOffset(offset) {}
      flattenOffset() {}
      extractOffset() {}
      stopAnimation(callback) { callback && callback({ x: 0, y: 0 }); }
      resetAnimation(callback) { callback && callback({ x: 0, y: 0 }); }
      addListener(callback) { return '0'; }
      removeListener(id) {}
      removeAllListeners() {}
      getLayout() { return { left: this.x, top: this.y }; }
      getTranslateTransform() { return [{ translateX: this.x }, { translateY: this.y }]; }
    },
    Color: class AnimatedColor {
      constructor(value) { this._value = value; }
      setValue(value) { this._value = value; }
      resetAnimation(callback) { callback && callback(this._value); }
    },
    View: require('react-native/Libraries/Components/View/View').default,
    Text: require('react-native/Libraries/Text/Text').default,
    Image: require('react-native/Libraries/Image/Image').default,
    ScrollView: require('react-native/Libraries/Components/ScrollView/ScrollView').default,
    FlatList: require('react-native/Libraries/Lists/FlatList').default,
    SectionList: require('react-native/Libraries/Lists/SectionList').default,
    timing: vi.fn((value, config) => ({
      start: vi.fn((callback) => callback && callback({ finished: true })),
      stop: vi.fn(),
      reset: vi.fn(),
    })),
    spring: vi.fn((value, config) => ({
      start: vi.fn((callback) => callback && callback({ finished: true })),
      stop: vi.fn(),
      reset: vi.fn(),
    })),
    decay: vi.fn((value, config) => ({
      start: vi.fn((callback) => callback && callback({ finished: true })),
      stop: vi.fn(),
      reset: vi.fn(),
    })),
    parallel: vi.fn((animations) => ({
      start: vi.fn((callback) => callback && callback({ finished: true })),
      stop: vi.fn(),
      reset: vi.fn(),
    })),
    sequence: vi.fn((animations) => ({
      start: vi.fn((callback) => callback && callback({ finished: true })),
      stop: vi.fn(),
      reset: vi.fn(),
    })),
    stagger: vi.fn((delay, animations) => ({
      start: vi.fn((callback) => callback && callback({ finished: true })),
      stop: vi.fn(),
      reset: vi.fn(),
    })),
    loop: vi.fn((animation) => ({
      start: vi.fn((callback) => callback && callback({ finished: true })),
      stop: vi.fn(),
      reset: vi.fn(),
    })),
    delay: vi.fn((time) => ({
      start: vi.fn((callback) => callback && callback({ finished: true })),
      stop: vi.fn(),
      reset: vi.fn(),
    })),
    event: vi.fn(() => vi.fn()),
    add: vi.fn(),
    subtract: vi.fn(),
    divide: vi.fn(),
    multiply: vi.fn(),
    modulo: vi.fn(),
    diffClamp: vi.fn(),
    createAnimatedComponent: vi.fn((Component) => Component),
  },
}`
);

// Button
mock(
  'react-native/Libraries/Components/Button',
  () => `(() => {
  const React = require('react');
  const Text = require('react-native/Libraries/Text/Text').default;
  function Button({ title, onPress, disabled, testID, color, accessibilityLabel, accessibilityState, accessibilityRole, role, accessible, ...rest }) {
    const mergedAccessibilityState = disabled != null || accessibilityState
      ? { ...accessibilityState, ...(disabled != null ? { disabled: !!disabled } : {}) }
      : undefined;
    return React.createElement('Button', {
      onPress, disabled, testID, color, accessibilityLabel,
      accessibilityRole: accessibilityRole || 'button',
      role: role,
      accessible: accessible !== undefined ? accessible : true,
      ...(mergedAccessibilityState ? { accessibilityState: mergedAccessibilityState } : {}),
      ...rest,
    },
      React.createElement(Text, null, title)
    );
  }
  return { __esModule: true, default: Button };
})()`
);

// ImageBackground
mock(
  'react-native/Libraries/Image/ImageBackground',
  () => `(() => {
  const React = require('react');
  const ImageBackground = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => global.__vrnHostInstance(), []);
    return React.createElement('ImageBackground', { ...props }, props.children);
  });
  ImageBackground.displayName = 'ImageBackground';
  return { __esModule: true, default: ImageBackground };
})()`
);

// KeyboardAvoidingView
mock(
  'react-native/Libraries/Components/Keyboard/KeyboardAvoidingView',
  () => `(() => {
  const React = require('react');
  const KeyboardAvoidingView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => global.__vrnHostInstance(), []);
    return React.createElement('KeyboardAvoidingView', { ...props }, props.children);
  });
  KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';
  return { __esModule: true, default: KeyboardAvoidingView };
})()`
);

// verifyComponentAttributeEquivalence
mock(
  'react-native/Libraries/Utilities/verifyComponentAttributeEquivalence',
  () => `{ __esModule: true, default: () => {} }`
);

// TouchableWithoutFeedback
mock('react-native/Libraries/Components/Touchable/TouchableWithoutFeedback', () =>
  createAccessibleTouchableMock('TouchableWithoutFeedback')
);

// VirtualizedList
mock(
  'react-native/Libraries/Lists/VirtualizedList',
  () => `(() => {
  const React = require('react');
  class VirtualizedList extends React.Component {
    scrollToEnd = vi.fn();
    scrollToIndex = vi.fn();
    scrollToItem = vi.fn();
    scrollToOffset = vi.fn();
    recordInteraction = vi.fn();
    flashScrollIndicators = vi.fn();
    getScrollResponder = vi.fn();
    getNativeScrollRef = vi.fn();
    getScrollableNode = vi.fn();

    render() {
      const { data, renderItem, getItem, getItemCount, ListHeaderComponent, ListFooterComponent, ListEmptyComponent, ItemSeparatorComponent, keyExtractor, ...rest } = this.props;
      const children = [];

      if (ListHeaderComponent) {
        children.push(React.createElement('View', { key: 'header' },
          typeof ListHeaderComponent === 'function' ? React.createElement(ListHeaderComponent) : ListHeaderComponent));
      }

      const itemCount = getItemCount ? getItemCount(data) : (data ? data.length : 0);
      if (itemCount > 0) {
        for (let i = 0; i < itemCount; i++) {
          if (i > 0 && ItemSeparatorComponent) {
            children.push(React.createElement(ItemSeparatorComponent, { key: 'sep-' + i }));
          }
          const item = getItem ? getItem(data, i) : data[i];
          const key = keyExtractor ? keyExtractor(item, i) : i.toString();
          children.push(renderItem({ item, index: i, separators: {} }));
        }
      } else if (ListEmptyComponent) {
        children.push(typeof ListEmptyComponent === 'function' ? React.createElement(ListEmptyComponent) : ListEmptyComponent);
      }

      if (ListFooterComponent) {
        children.push(React.createElement('View', { key: 'footer' },
          typeof ListFooterComponent === 'function' ? React.createElement(ListFooterComponent) : ListFooterComponent));
      }

      return React.createElement('VirtualizedList', rest, children);
    }
  }
  VirtualizedList.displayName = 'VirtualizedList';
  return { __esModule: true, default: VirtualizedList };
})()`
);

// BackHandler (Android)
mock(
  'react-native/Libraries/Utilities/BackHandler',
  () => `{
  __esModule: true,
  default: {
    exitApp: vi.fn(),
    addEventListener: vi.fn((eventName, handler) => ({
      remove: vi.fn(),
    })),
    removeEventListener: vi.fn(),
  },
}`
);

// DrawerLayoutAndroid
mock(
  'react-native/Libraries/Components/DrawerAndroid/DrawerLayoutAndroid',
  () => `(() => {
  const React = require('react');
  class DrawerLayoutAndroid extends React.Component {
    openDrawer = vi.fn();
    closeDrawer = vi.fn();

    render() {
      const { children, renderNavigationView, ...rest } = this.props;
      return React.createElement('DrawerLayoutAndroid', rest, children);
    }
  }
  DrawerLayoutAndroid.displayName = 'DrawerLayoutAndroid';
  DrawerLayoutAndroid.positions = { Left: 'left', Right: 'right' };
  return { __esModule: true, default: DrawerLayoutAndroid };
})()`
);

// PermissionsAndroid
mock(
  'react-native/Libraries/PermissionsAndroid/PermissionsAndroid',
  () => `{
  __esModule: true,
  default: {
    PERMISSIONS: {
      READ_CALENDAR: 'android.permission.READ_CALENDAR',
      WRITE_CALENDAR: 'android.permission.WRITE_CALENDAR',
      CAMERA: 'android.permission.CAMERA',
      READ_CONTACTS: 'android.permission.READ_CONTACTS',
      WRITE_CONTACTS: 'android.permission.WRITE_CONTACTS',
      GET_ACCOUNTS: 'android.permission.GET_ACCOUNTS',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
      ACCESS_BACKGROUND_LOCATION: 'android.permission.ACCESS_BACKGROUND_LOCATION',
      RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
      READ_PHONE_STATE: 'android.permission.READ_PHONE_STATE',
      CALL_PHONE: 'android.permission.CALL_PHONE',
      READ_CALL_LOG: 'android.permission.READ_CALL_LOG',
      WRITE_CALL_LOG: 'android.permission.WRITE_CALL_LOG',
      ADD_VOICEMAIL: 'com.android.voicemail.permission.ADD_VOICEMAIL',
      USE_SIP: 'android.permission.USE_SIP',
      PROCESS_OUTGOING_CALLS: 'android.permission.PROCESS_OUTGOING_CALLS',
      BODY_SENSORS: 'android.permission.BODY_SENSORS',
      SEND_SMS: 'android.permission.SEND_SMS',
      RECEIVE_SMS: 'android.permission.RECEIVE_SMS',
      READ_SMS: 'android.permission.READ_SMS',
      RECEIVE_WAP_PUSH: 'android.permission.RECEIVE_WAP_PUSH',
      RECEIVE_MMS: 'android.permission.RECEIVE_MMS',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
      BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
      BLUETOOTH_ADVERTISE: 'android.permission.BLUETOOTH_ADVERTISE',
      POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
      READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
      READ_MEDIA_VIDEO: 'android.permission.READ_MEDIA_VIDEO',
      READ_MEDIA_AUDIO: 'android.permission.READ_MEDIA_AUDIO',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      NEVER_ASK_AGAIN: 'never_ask_again',
    },
    check: vi.fn(() => Promise.resolve('granted')),
    request: vi.fn(() => Promise.resolve('granted')),
    requestMultiple: vi.fn(() => Promise.resolve({})),
  },
}`
);

// ToastAndroid
mock(
  'react-native/Libraries/Components/ToastAndroid/ToastAndroid',
  () => `{
  __esModule: true,
  default: {
    SHORT: 0,
    LONG: 1,
    TOP: 0,
    BOTTOM: 1,
    CENTER: 2,
    show: vi.fn(),
    showWithGravity: vi.fn(),
    showWithGravityAndOffset: vi.fn(),
  },
}`
);

// TouchableNativeFeedback (Android)
mock(
  'react-native/Libraries/Components/Touchable/TouchableNativeFeedback',
  () => `(() => {
  const React = require('react');
  class TouchableNativeFeedback extends React.Component {
    render() {
      const { disabled, accessibilityState, ...rest } = this.props;
      const mergedAccessibilityState = disabled != null || accessibilityState
        ? { ...accessibilityState, ...(disabled != null ? { disabled: !!disabled } : {}) }
        : undefined;
      return React.createElement('TouchableNativeFeedback', {
        ...rest,
        disabled,
        accessible: this.props.accessible !== false,
        ...(mergedAccessibilityState ? { accessibilityState: mergedAccessibilityState } : {}),
      }, this.props.children);
    }
  }
  TouchableNativeFeedback.displayName = 'TouchableNativeFeedback';
  TouchableNativeFeedback.SelectableBackground = vi.fn(() => ({}));
  TouchableNativeFeedback.SelectableBackgroundBorderless = vi.fn(() => ({}));
  TouchableNativeFeedback.Ripple = vi.fn((color, borderless) => ({}));
  TouchableNativeFeedback.canUseNativeForeground = vi.fn(() => false);
  return { __esModule: true, default: TouchableNativeFeedback };
})()`
);

// ActionSheetIOS
mock(
  'react-native/Libraries/ActionSheetIOS/ActionSheetIOS',
  () => `{
  __esModule: true,
  default: {
    showActionSheetWithOptions: vi.fn(),
    showShareActionSheetWithOptions: vi.fn(),
  },
}`
);

// InputAccessoryView (iOS)
mock(
  'react-native/Libraries/Components/TextInput/InputAccessoryView',
  () => `(() => {
  const React = require('react');
  const InputAccessoryView = (props) => {
    return React.createElement('InputAccessoryView', props, props.children);
  };
  InputAccessoryView.displayName = 'InputAccessoryView';
  return { __esModule: true, default: InputAccessoryView };
})()`
);

// Appearance - uses named exports, not default
mock(
  'react-native/Libraries/Utilities/Appearance',
  () => `(() => {
  // The one owner of the colour scheme. NativeAppearance and useColorScheme both read
  // through this module, so the three cannot disagree.
  const RESTING = 'light';
  let scheme = RESTING;
  const listeners = new Set();
  const reset = () => {
    scheme = RESTING;
    listeners.clear();
  };
  global.__vrnRegisterStateful('Appearance', reset);

  return {
    __esModule: true,
    getColorScheme: vi.fn(() => scheme),
    // React Native takes 'light' | 'dark' | 'auto' | 'unspecified' here, while
    // getColorScheme() only ever returns 'light' | 'dark' | null. With no system
    // appearance to follow, the override keywords resolve to the resting scheme rather
    // than being stored and handed back as themselves.
    setColorScheme: vi.fn((next) => {
      scheme = next === 'light' || next === 'dark' ? next : RESTING;
      listeners.forEach((listener) => listener({ colorScheme: scheme }));
    }),
    addChangeListener: vi.fn((listener) => {
      listeners.add(listener);
      return { remove: () => listeners.delete(listener) };
    }),
    // Not part of React Native's API: the mock's own hook for the resting state.
    _reset: reset,
  };
})()`
);

// NativeAppearance
mock(
  'react-native/Libraries/Utilities/NativeAppearance',
  () => `{
  __esModule: true,
  default: {
    // Delegates to the Appearance mock. Holding its own scheme meant the two reported
    // different values the moment either was changed.
    getColorScheme: vi.fn(() =>
      require('react-native/Libraries/Utilities/Appearance').getColorScheme()
    ),
    setColorScheme: vi.fn((next) =>
      require('react-native/Libraries/Utilities/Appearance').setColorScheme(next)
    ),
    addListener: vi.fn(),
    removeListeners: vi.fn(),
  },
}`
);

// useColorScheme hook
mock(
  'react-native/Libraries/Utilities/useColorScheme',
  () => `{
  __esModule: true,
  // Reads Appearance when called, so the hook and Appearance.getColorScheme() cannot
  // disagree. Deliberately not a real subscription — Appearance.spec.tsx calls this
  // outside a component, so useState/useEffect here would throw "invalid hook call".
  default: vi.fn(() =>
    require('react-native/Libraries/Utilities/Appearance').getColorScheme()
  ),
}`
);

// useWindowDimensions hook
mock(
  'react-native/Libraries/Utilities/useWindowDimensions',
  () => `{
  __esModule: true,
  // Reads Dimensions when called, so the hook and Dimensions.get('window') cannot
  // disagree after Dimensions.set(). Unlike real React Native it does not subscribe,
  // so an update does not itself trigger a re-render — a re-rendered component picks
  // up the new value.
  default: vi.fn(() =>
    require('react-native/Libraries/Utilities/Dimensions').default.get('window')
  ),
}`
);

// Systrace
mock(
  'react-native/Libraries/Performance/Systrace',
  () => `{
  __esModule: true,
  default: {
    isEnabled: vi.fn(() => false),
    setEnabled: vi.fn(),
    beginEvent: vi.fn(),
    endEvent: vi.fn(),
    beginAsyncEvent: vi.fn(() => 0),
    endAsyncEvent: vi.fn(),
    counterEvent: vi.fn(),
  },
}`
);

// DeviceEventEmitter
mock(
  'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter',
  () => `(() => {
  class DeviceEventEmitter {
    listeners = {};
    addListener(eventType, listener, context) {
      if (!this.listeners[eventType]) {
        this.listeners[eventType] = [];
      }
      this.listeners[eventType].push(listener);
      return { remove: () => this.removeListener(eventType, listener) };
    }
    removeListener(eventType, listener) {
      if (this.listeners[eventType]) {
        this.listeners[eventType] = this.listeners[eventType].filter(l => l !== listener);
      }
    }
    removeAllListeners(eventType) {
      if (eventType) {
        delete this.listeners[eventType];
      } else {
        this.listeners = {};
      }
    }
    emit(eventType, ...args) {
      if (this.listeners[eventType]) {
        this.listeners[eventType].forEach(listener => listener(...args));
      }
    }
    // Not part of React Native's API. This mock is a module-level singleton whose
    // listeners live for the whole test file, so it is the one place a subscription
    // can leak from one test into the next.
    _reset() {
      this.listeners = {};
    }
  }
  const instance = new DeviceEventEmitter();
  global.__vrnRegisterStateful('DeviceEventEmitter', () => instance._reset());
  return { __esModule: true, default: instance };
})()`
);

// Settings (iOS)
mock(
  'react-native/Libraries/Settings/Settings',
  () => `{
  __esModule: true,
  default: {
    get: vi.fn((key) => null),
    set: vi.fn((settings) => {}),
    watchKeys: vi.fn((keys, callback) => 0),
    clearWatch: vi.fn((watchId) => {}),
  },
}`
);

// Transforms
mock(
  'react-native/Libraries/StyleSheet/processTransform',
  () => `{
  __esModule: true,
  default: (transform) => transform,
}`
);

// PushNotificationIOS
mock(
  'react-native/Libraries/PushNotificationIOS/PushNotificationIOS',
  () => `{
  __esModule: true,
  default: {
    presentLocalNotification: vi.fn(),
    scheduleLocalNotification: vi.fn(),
    cancelAllLocalNotifications: vi.fn(),
    removeAllDeliveredNotifications: vi.fn(),
    getDeliveredNotifications: vi.fn((callback) => callback([])),
    removeDeliveredNotifications: vi.fn(),
    setApplicationIconBadgeNumber: vi.fn(),
    getApplicationIconBadgeNumber: vi.fn((callback) => callback(0)),
    cancelLocalNotifications: vi.fn(),
    getScheduledLocalNotifications: vi.fn((callback) => callback([])),
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    requestPermissions: vi.fn(() => Promise.resolve({ alert: true, badge: true, sound: true })),
    abandonPermissions: vi.fn(),
    checkPermissions: vi.fn((callback) => callback({ alert: true, badge: true, sound: true })),
    getInitialNotification: vi.fn(() => Promise.resolve(null)),
    FetchResult: {
      NewData: 'UIBackgroundFetchResultNewData',
      NoData: 'UIBackgroundFetchResultNoData',
      ResultFailed: 'UIBackgroundFetchResultFailed',
    },
  },
}`
);

// ============================================================================
// STEP 9: Configure React Native Testing Library
// ============================================================================

// Configure RNTL to recognize our mocked host components
try {
  const { configure } = require('@testing-library/react-native');
  configure({
    // Tell RNTL these are our host component names
    hostComponentNames: {
      text: 'Text',
      textInput: 'TextInput',
      switch: 'Switch',
      scrollView: 'ScrollView',
      modal: 'Modal',
      image: 'Image',
    },
  });
} catch {
  // @testing-library/react-native may not be available
}

export {};
