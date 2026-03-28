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
const createTurboModuleProxy = () => {
  const featureFlagsMock = {
    commonTestFlag: () => false,
    commonTestFlagWithoutNativeImplementation: () => false,
    cdpInteractionMetricsEnabled: () => false,
    cxxNativeAnimatedEnabled: () => false,
    cxxNativeAnimatedRemoveJsSync: () => false,
    disableEarlyViewCommandExecution: () => false,
    disableFabricCommitInCXXAnimated: () => false,
    disableMountItemReorderingAndroid: () => false,
    disableOldAndroidAttachmentMetricsWorkarounds: () => false,
    disableTextLayoutManagerCacheAndroid: () => false,
    enableAccessibilityOrder: () => false,
    enableAccumulatedUpdatesInRawPropsAndroid: () => false,
    enableAndroidLinearText: () => false,
    enableAndroidTextMeasurementOptimizations: () => false,
    enableBridgelessArchitecture: () => false,
    enableCppPropsIteratorSetter: () => false,
    enableCustomFocusSearchOnClippedElementsAndroid: () => false,
    enableDestroyShadowTreeRevisionAsync: () => false,
    enableDoubleMeasurementFixAndroid: () => false,
    enableEagerMainQueueModulesOnIOS: () => false,
    enableEagerRootViewAttachment: () => false,
    enableFabricLogs: () => false,
    enableFabricRenderer: () => false,
    enableFontScaleChangesUpdatingLayout: () => false,
    enableIOSTextBaselineOffsetPerLine: () => false,
    enableIOSViewClipToPaddingBox: () => false,
    enableImagePrefetchingAndroid: () => false,
    enableImagePrefetchingOnUiThreadAndroid: () => false,
    enableImmediateUpdateModeForContentOffsetChanges: () => false,
    enableImperativeFocus: () => false,
    enableInteropViewManagerClassLookUpOptimizationIOS: () => false,
    enableIntersectionObserverByDefault: () => false,
    enableKeyEvents: () => false,
    enableLayoutAnimationsOnAndroid: () => false,
    enableLayoutAnimationsOnIOS: () => false,
    enableMainQueueCoordinatorOnIOS: () => false,
    enableModuleArgumentNSNullConversionIOS: () => false,
    enableNativeCSSParsing: () => false,
    enableNetworkEventReporting: () => false,
    enablePreparedTextLayout: () => false,
    enablePropsUpdateReconciliationAndroid: () => false,
    enableResourceTimingAPI: () => false,
    enableSwiftUIBasedFilters: () => false,
    enableViewCulling: () => false,
    enableViewRecycling: () => false,
    enableViewRecyclingForImage: () => false,
    enableViewRecyclingForScrollView: () => false,
    enableViewRecyclingForText: () => false,
    enableViewRecyclingForView: () => false,
  };

  return (name: string) => {
    if (name === 'NativeReactNativeFeatureFlagsCxx') {
      return featureFlagsMock;
    }
    // Return null for other native modules - they'll use JS fallbacks
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
g.window = globalThis;
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

const require = createRequire(import.meta.url);

// ============================================================================
// STEP 3: Set up cache directory for transformed files
// ============================================================================

let reactNativeVersion = '0.83.0';
let pluginVersion = '0.2.0';

try {
  const reactNativePkg = require('react-native/package.json');
  reactNativeVersion = reactNativePkg.version;
} catch {
  // Use default version
}

try {
  const pluginPkg = require('./package.json');
  pluginVersion = pluginPkg.version;
} catch {
  // Use default version
}

const tmpDir = os.tmpdir();
const cacheDirBase = path.join(tmpDir, 'vrn');
const version = `${reactNativeVersion}_${pluginVersion}`;
const cacheDir = path.join(cacheDirBase, version);

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Clean old cache
try {
  const folders = fs.readdirSync(cacheDirBase);
  folders.forEach((folder) => {
    if (folder !== version) {
      try {
        fs.rmSync(path.join(cacheDirBase, folder), { recursive: true });
      } catch {
        /* ignore */
      }
    }
  });
} catch {
  /* ignore */
}

const root = process.cwd();

// ============================================================================
// STEP 4: Mock registry - stores module path to mock code mappings
// ============================================================================

interface MockEntry {
  path: string;
  code: string;
}

const mocked: MockEntry[] = [];

const getMocked = (filePath: string): MockEntry | undefined =>
  mocked.find((entry) => filePath.includes(entry.path));

// ============================================================================
// STEP 5: Code transformation utilities
// ============================================================================

const transformCode = (code: string): string => {
  const result = removeTypes(code, { all: true }).toString();
  return esbuild.transformSync(result, {
    loader: 'jsx',
    format: 'cjs',
    platform: 'node',
  }).code;
};

const normalize = (p: string): string => p.replace(/\\/g, '/');

const cacheExists = (cachePath: string): boolean => fs.existsSync(cachePath);
const readFromCache = (cachePath: string): string => fs.readFileSync(cachePath, 'utf-8');
const writeToCache = (cachePath: string, code: string): void => fs.writeFileSync(cachePath, code);

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
  const cacheName = normalize(path.relative(root, filename)).replace(/\//g, '_');
  const cachePath = path.join(cacheDir, cacheName);

  if (cacheExists(cachePath)) {
    return readFromCache(cachePath);
  }

  const mock = getMocked(filename);
  if (mock) {
    const original = mock.code.includes('__vitest__original__')
      ? `const __vitest__original__ = ((module, exports) => {
      ${transformCode(code)}
      return module.exports
    })(module, exports);`
      : '';
    const mockCode = `${original}\n${mock.code}`;
    writeToCache(cachePath, mockCode);
    return mockCode;
  }

  const transformed = transformCode(code);
  writeToCache(cachePath, transformed);
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
const createAccessibleTouchableMock = (displayName: string): string => `(() => {
  const React = require('react');
  const ${displayName} = React.forwardRef((props, ref) => {
    return React.createElement('${displayName}', {
      ...props,
      accessible: props.accessible !== false,
      ref,
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
    if (!module) {
      return {}; // Return empty object instead of throwing
    }
    return module;
  },
}`
);

// Feature Flags
mock(
  'react-native/src/private/featureflags/ReactNativeFeatureFlags',
  () => `{
  jsOnlyTestFlag: () => false,
  animatedShouldDebounceQueueFlush: () => false,
  animatedShouldUseSingleOp: () => false,
  isLayoutAnimationEnabled: () => true,
  shouldUseAnimatedObjectForTransform: () => false,
  shouldUseSetNativePropsInFabric: () => false,
  commonTestFlag: () => false,
  enableFabricRenderer: () => false,
  enableBridgelessArchitecture: () => false,
}`
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
    absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
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
  const Platform = {
    OS: 'ios',
    Version: '17.0',
    isPad: false,
    isTesting: true,
    isTV: false,
    isVision: false,
    constants: {
      reactNativeVersion: { major: 0, minor: 83, patch: 0 },
    },
    select: (obj) => {
      if ('ios' in obj) return obj.ios;
      if ('native' in obj) return obj.native;
      return obj.default;
    },
  };
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
  () => `{
  __esModule: true,
  default: {
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
          window: { fontScale: 2, height: 1334, scale: 2, width: 750 },
          screen: { fontScale: 2, height: 1334, scale: 2, width: 750 },
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
      getConstants: () => ({ isTesting: true, reactNativeVersion: { major: 0, minor: 83, patch: 0 } }),
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
  },
}`
);

// NativeComponentRegistry
mock(
  'react-native/Libraries/NativeComponent/NativeComponentRegistry',
  () => `{
  get: (name, viewConfigProvider) => {
    const requireNativeComponent = require('react-native/Libraries/ReactNative/requireNativeComponent');
    return requireNativeComponent(name);
  },
  getWithFallback_DEPRECATED: (name, viewConfigProvider) => {
    const requireNativeComponent = require('react-native/Libraries/ReactNative/requireNativeComponent');
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
    return React.createElement('View', { ...props, accessible, ref }, props.children);
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
    return React.createElement('View', { ...props, accessible, ref }, props.children);
  });
  ViewNativeComponent.displayName = 'View';
  return { __esModule: true, default: ViewNativeComponent };
})()`
);

// Text
mock(
  'react-native/Libraries/Text/Text',
  () => `(() => {
  const React = require('react');
  const Text = React.forwardRef((props, ref) => {
    return React.createElement('Text', { ...props, ref }, props.children);
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
    return React.createElement('TextInput', { ...props, ref });
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
    return React.createElement('Image', { ...props, ref });
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
    return React.createElement('ActivityIndicator', { ...props, ref });
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
    const { children, style, disabled, onPress, onPressIn, onPressOut, onLongPress, ...rest } = props;
    const resolvedStyle = typeof style === 'function' ? style({ pressed: false }) : style;
    const resolvedChildren = typeof children === 'function' ? children({ pressed: false }) : children;
    return React.createElement('Pressable', {
      ...rest,
      accessible: props.accessible !== false,
      style: resolvedStyle,
      ref,
      onPress: disabled ? undefined : onPress,
      onPressIn,
      onPressOut,
      onLongPress,
      disabled,
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
    return React.createElement('SafeAreaView', { ...props, ref }, props.children);
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
    static setBackgroundColor = vi.fn();
    static setHidden = vi.fn();
    static setNetworkActivityIndicatorVisible = vi.fn();
    static setTranslucent = vi.fn();
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
    return React.createElement('Switch', { ...props, ref });
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
  () => `{
  __esModule: true,
  default: {
    get: (dim) => {
      if (dim === 'window' || dim === 'screen') {
        return { width: 750, height: 1334, scale: 2, fontScale: 2 };
      }
      return {};
    },
    set: vi.fn(),
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
}`
);

// PixelRatio
mock(
  'react-native/Libraries/Utilities/PixelRatio',
  () => `{
  __esModule: true,
  default: {
    get: () => 2,
    getFontScale: () => 2,
    getPixelSizeForLayoutSize: (size) => size * 2,
    roundToNearestPixel: (size) => Math.round(size * 2) / 2,
  },
}`
);

// AppState
mock(
  'react-native/Libraries/AppState/AppState',
  () => `{
  __esModule: true,
  default: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    currentState: 'active',
    isAvailable: true,
  },
}`
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
    return React.createElement('RefreshControl', { ...props, ref });
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
  () => `{
  __esModule: true,
  default: {
    addListener: vi.fn(() => ({ remove: vi.fn() })),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
    dismiss: vi.fn(),
    scheduleLayoutAnimation: vi.fn(),
    isVisible: vi.fn(() => false),
    metrics: vi.fn(() => null),
  },
}`
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
  function Button({ title, onPress, disabled, testID, color, accessibilityLabel, accessibilityRole, role, accessible, ...rest }) {
    return React.createElement('Button', {
      onPress, disabled, testID, color, accessibilityLabel,
      accessibilityRole: accessibilityRole || 'button',
      role: role,
      accessible: accessible !== undefined ? accessible : true,
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
    return React.createElement('ImageBackground', { ...props, ref }, props.children);
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
    return React.createElement('KeyboardAvoidingView', { ...props, ref }, props.children);
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
      return React.createElement('TouchableNativeFeedback', {
        ...this.props,
        accessible: this.props.accessible !== false,
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
  () => `{
  __esModule: true,
  getColorScheme: vi.fn(() => 'light'),
  setColorScheme: vi.fn(),
  addChangeListener: vi.fn(() => ({ remove: vi.fn() })),
}`
);

// NativeAppearance
mock(
  'react-native/Libraries/Utilities/NativeAppearance',
  () => `{
  __esModule: true,
  default: {
    getColorScheme: vi.fn(() => 'light'),
    setColorScheme: vi.fn(),
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
  default: vi.fn(() => 'light'),
}`
);

// useWindowDimensions hook
mock(
  'react-native/Libraries/Utilities/useWindowDimensions',
  () => `{
  __esModule: true,
  default: vi.fn(() => ({ width: 750, height: 1334, scale: 2, fontScale: 2 })),
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
  }
  return { __esModule: true, default: new DeviceEventEmitter() };
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
// STEP 9: Clear cache to ensure fresh mocks are used
// ============================================================================

// Clear the cache directory to force re-transformation with new mocks
try {
  const files = fs.readdirSync(cacheDir);
  files.forEach((file) => {
    try {
      fs.unlinkSync(path.join(cacheDir, file));
    } catch {
      /* ignore */
    }
  });
} catch {
  /* ignore */
}

// ============================================================================
// STEP 10: Configure React Native Testing Library
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
