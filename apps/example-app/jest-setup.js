/**
 * Custom Jest setup for React Native 0.83 + React 19 compatibility.
 *
 * React Native's built-in jest-preset (mockComponent.js) doesn't work with
 * React 19 + pnpm because jest.requireActual fails to load the actual
 * components. This setup replicates the same mocking contract:
 *
 * - Same globals (__DEV__, requestAnimationFrame, etc.)
 * - Same component mock pattern (class components that render createElement(name, props))
 * - Same API mock behavior
 *
 * This is the standard behavior users get from `react-native/jest-preset` in a
 * working RN + Jest environment. We replicate it here so we can compare against
 * our vitest-react-native mocks.
 */

// ---------------------------------------------------------------------------
// Globals (from react-native/jest/setup.js)
// ---------------------------------------------------------------------------
global.__DEV__ = true;
global.IS_REACT_ACT_ENVIRONMENT = true;
global.IS_REACT_NATIVE_TEST_ENVIRONMENT = true;
global.nativeFabricUIManager = {};
global.window = global;
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.requestAnimationFrame = (callback) =>
  setTimeout(() => callback(Date.now()), 0);
global.performance = global.performance || { now: Date.now };

// ---------------------------------------------------------------------------
// Mock helpers prefixed with "mock" so jest-hoist allows them in factories
// ---------------------------------------------------------------------------
function mockComponent(name, instanceMethods) {
  const React = require('react');
  class MockComp extends React.Component {
    render() {
      return React.createElement(name, { ...this.props }, this.props.children);
    }
  }
  MockComp.displayName = name;
  if (instanceMethods) Object.assign(MockComp.prototype, instanceMethods);
  return MockComp;
}

function mockForwardRef(name) {
  const React = require('react');
  const c = React.forwardRef((props, ref) =>
    React.createElement(name, { ...props, ref }, props.children),
  );
  c.displayName = name;
  return c;
}

function mockNativeMethods() {
  return {
    measure: jest.fn(),
    measureInWindow: jest.fn(),
    measureLayout: jest.fn(),
    setNativeProps: jest.fn(),
    focus: jest.fn(),
    blur: jest.fn(),
  };
}

// Make them global so jest.mock factories can use "mock"-prefixed names
global.mockComponent = mockComponent;
global.mockForwardRef = mockForwardRef;
global.mockNativeMethods = mockNativeMethods;

// ---------------------------------------------------------------------------
// Component mocks (matching react-native/jest/mocks/*)
// ---------------------------------------------------------------------------

jest.mock('react-native/Libraries/Components/View/View', () => {
  const MockView = mockForwardRef('View');
  return { __esModule: true, default: MockView };
});

jest.mock('react-native/Libraries/Components/View/ViewNativeComponent', () => {
  return { __esModule: true, default: mockForwardRef('View') };
});

jest.mock('react-native/Libraries/Text/Text', () => {
  const Text = mockComponent('Text', mockNativeMethods());
  return { __esModule: true, default: Text };
});

jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => {
  const TextInput = mockComponent('TextInput', {
    ...mockNativeMethods(),
    clear: jest.fn(),
    isFocused: jest.fn(() => false),
  });
  TextInput.State = {
    currentlyFocusedInput: jest.fn(() => null),
    currentlyFocusedField: jest.fn(() => null),
    focusTextInput: jest.fn(),
    blurTextInput: jest.fn(),
  };
  return { __esModule: true, default: TextInput };
});

jest.mock('react-native/Libraries/Image/Image', () => {
  const Image = mockComponent('Image');
  Image.getSize = jest.fn((uri, success) => success && success(100, 100));
  Image.getSizeWithHeaders = jest.fn(() =>
    Promise.resolve({ width: 100, height: 100 }),
  );
  Image.prefetch = jest.fn(() => Promise.resolve());
  Image.queryCache = jest.fn(() => Promise.resolve({}));
  Image.resolveAssetSource = jest.fn((source) => source);
  return { __esModule: true, default: Image };
});

jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
  const ScrollView = mockComponent('ScrollView', {
    scrollTo: jest.fn(),
    scrollToEnd: jest.fn(),
    flashScrollIndicators: jest.fn(),
    getScrollResponder: jest.fn(function () {
      return this;
    }),
    getScrollableNode: jest.fn(),
    getInnerViewNode: jest.fn(),
    getInnerViewRef: jest.fn(),
    getNativeScrollRef: jest.fn(),
  });
  return { __esModule: true, default: ScrollView };
});

jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const mockReact = require('react');
  class MockFlatList extends mockReact.Component {
    scrollToEnd = jest.fn();
    scrollToIndex = jest.fn();
    scrollToOffset = jest.fn();
    render() {
      const { data, renderItem, ListHeaderComponent, ListFooterComponent, ListEmptyComponent, keyExtractor, ...rest } = this.props;
      const mockChildren = [];
      if (ListHeaderComponent) mockChildren.push(mockReact.createElement('View', { key: 'header' }, typeof ListHeaderComponent === 'function' ? mockReact.createElement(ListHeaderComponent) : ListHeaderComponent));
      if (data && data.length > 0) {
        data.forEach((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : String(index);
          mockChildren.push(renderItem({ item, index, separators: {} }));
        });
      } else if (ListEmptyComponent) {
        mockChildren.push(typeof ListEmptyComponent === 'function' ? mockReact.createElement(ListEmptyComponent) : ListEmptyComponent);
      }
      if (ListFooterComponent) mockChildren.push(mockReact.createElement('View', { key: 'footer' }, typeof ListFooterComponent === 'function' ? mockReact.createElement(ListFooterComponent) : ListFooterComponent));
      return mockReact.createElement('FlatList', rest, mockChildren);
    }
  }
  MockFlatList.displayName = 'FlatList';
  return { __esModule: true, default: MockFlatList };
});

jest.mock('react-native/Libraries/Lists/SectionList', () => {
  const mockReact = require('react');
  class MockSectionList extends mockReact.Component {
    render() {
      const { sections, renderItem, renderSectionHeader, ListHeaderComponent, ListFooterComponent, ListEmptyComponent, keyExtractor, ...rest } = this.props;
      const mockChildren = [];
      if (ListHeaderComponent) mockChildren.push(mockReact.createElement('View', { key: 'list-header' }, typeof ListHeaderComponent === 'function' ? mockReact.createElement(ListHeaderComponent) : ListHeaderComponent));
      if (sections && sections.length > 0) {
        sections.forEach((section, sectionIndex) => {
          if (renderSectionHeader) mockChildren.push(mockReact.cloneElement(renderSectionHeader({ section }), { key: 'sh-' + sectionIndex }));
          if (section.data) section.data.forEach((item, itemIndex) => {
            const key = keyExtractor ? keyExtractor(item, itemIndex) : sectionIndex + '-' + itemIndex;
            mockChildren.push(mockReact.cloneElement(renderItem({ item, index: itemIndex, section, separators: {} }), { key }));
          });
        });
      } else if (ListEmptyComponent) {
        mockChildren.push(typeof ListEmptyComponent === 'function' ? mockReact.createElement(ListEmptyComponent) : ListEmptyComponent);
      }
      if (ListFooterComponent) mockChildren.push(mockReact.createElement('View', { key: 'list-footer' }, typeof ListFooterComponent === 'function' ? mockReact.createElement(ListFooterComponent) : ListFooterComponent));
      return mockReact.createElement('SectionList', rest, mockChildren);
    }
  }
  MockSectionList.displayName = 'SectionList';
  return { __esModule: true, default: MockSectionList };
});

jest.mock(
  'react-native/Libraries/Components/Touchable/TouchableOpacity',
  () => {
    const mockReact = require('react');
    const mockTO = mockReact.forwardRef((props, ref) => {
      const mockAccessible = props.accessible !== undefined ? props.accessible : true;
      return mockReact.createElement('TouchableOpacity', { ...props, accessible: mockAccessible, ref }, props.children);
    });
    mockTO.displayName = 'TouchableOpacity';
    return { __esModule: true, default: mockTO };
  },
);

jest.mock(
  'react-native/Libraries/Components/Touchable/TouchableHighlight',
  () => {
    const mockReact = require('react');
    const mockTH = mockReact.forwardRef((props, ref) => {
      const mockAccessible = props.accessible !== undefined ? props.accessible : true;
      return mockReact.createElement('TouchableHighlight', { ...props, accessible: mockAccessible, ref }, props.children);
    });
    mockTH.displayName = 'TouchableHighlight';
    return { __esModule: true, default: mockTH };
  },
);

jest.mock(
  'react-native/Libraries/Components/Touchable/TouchableWithoutFeedback',
  () => {
    const mockReact = require('react');
    const mockTWF = mockReact.forwardRef((props, ref) => {
      const mockAccessible = props.accessible !== undefined ? props.accessible : true;
      return mockReact.createElement('TouchableWithoutFeedback', { ...props, accessible: mockAccessible, ref }, props.children);
    });
    mockTWF.displayName = 'TouchableWithoutFeedback';
    return { __esModule: true, default: mockTWF };
  },
);

jest.mock('react-native/Libraries/Components/Pressable/Pressable', () => {
  const mockReact = require('react');
  const mockPressable = mockReact.forwardRef((props, ref) => {
    const { children, style, disabled, onPress, onPressIn, onPressOut, onLongPress, ...rest } = props;
    const mockResolvedStyle = typeof style === 'function' ? style({ pressed: false }) : style;
    const mockResolvedChildren = typeof children === 'function' ? children({ pressed: false }) : children;
    const mockAccessible = props.accessible !== undefined ? props.accessible : true;
    return mockReact.createElement('Pressable', { ...rest, accessible: mockAccessible, style: mockResolvedStyle, ref, onPress: disabled ? undefined : onPress, onPressIn, onPressOut, onLongPress, disabled }, mockResolvedChildren);
  });
  mockPressable.displayName = 'Pressable';
  return { __esModule: true, default: mockPressable };
});

jest.mock('react-native/Libraries/Components/Button', () => {
  const mockReact = require('react');
  const mockText = require('react-native/Libraries/Text/Text').default;
  function mockButton({ title, onPress, disabled, testID, color, accessibilityLabel, accessibilityRole, role, accessible, ...rest }) {
    return mockReact.createElement('Button', { onPress, disabled, testID, color, accessibilityLabel, accessibilityRole: accessibilityRole || 'button', accessible: accessible !== undefined ? accessible : true, ...rest }, mockReact.createElement(mockText, null, title));
  }
  return { __esModule: true, default: mockButton };
});

jest.mock(
  'react-native/Libraries/Components/ActivityIndicator/ActivityIndicator',
  () => {
    return {
      __esModule: true,
      default: mockForwardRef('ActivityIndicator'),
    };
  },
);

jest.mock('react-native/Libraries/Components/Switch/Switch', () => {
  return {
    __esModule: true,
    default: mockForwardRef('Switch'),
  };
});

jest.mock('react-native/Libraries/Modal/Modal', () => {
  const mockReact = require('react');
  class mockModal extends mockReact.Component {
    render() {
      if (this.props.visible === false) return null;
      return mockReact.createElement('Modal', this.props, this.props.children);
    }
  }
  mockModal.displayName = 'Modal';
  return { __esModule: true, default: mockModal };
});

jest.mock(
  'react-native/Libraries/Components/SafeAreaView/SafeAreaView',
  () => {
    return {
      __esModule: true,
      default: mockForwardRef('SafeAreaView'),
    };
  },
);

jest.mock(
  'react-native/Libraries/Components/Keyboard/KeyboardAvoidingView',
  () => {
    return {
      __esModule: true,
      default: mockForwardRef('KeyboardAvoidingView'),
    };
  },
);

jest.mock('react-native/Libraries/Image/ImageBackground', () => {
  return {
    __esModule: true,
    default: mockForwardRef('ImageBackground'),
  };
});

jest.mock(
  'react-native/Libraries/Components/RefreshControl/RefreshControl',
  () => {
    return {
      __esModule: true,
      default: mockForwardRef('RefreshControl'),
    };
  },
);

jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => {
  const mockReact = require('react');
  class mockStatusBar extends mockReact.Component {
    static currentHeight = 42;
    static setBarStyle = jest.fn();
    static setBackgroundColor = jest.fn();
    static setHidden = jest.fn();
    static setNetworkActivityIndicatorVisible = jest.fn();
    static setTranslucent = jest.fn();
    static pushStackEntry = jest.fn(() => ({}));
    static popStackEntry = jest.fn();
    static replaceStackEntry = jest.fn(() => ({}));
    render() { return null; }
  }
  return { __esModule: true, default: mockStatusBar };
});

// ---------------------------------------------------------------------------
// API mocks
// ---------------------------------------------------------------------------

jest.mock('react-native/Libraries/Utilities/Platform', () => {
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
});

jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => {
  const StyleSheet = {
    create: (styles) => styles,
    flatten: (style) => {
      if (!style) return {};
      if (Array.isArray(style)) return Object.assign({}, ...style.filter(Boolean));
      return style;
    },
    compose: (style1, style2) => [style1, style2],
    absoluteFill: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    absoluteFillObject: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    hairlineWidth: 0.5,
    setStyleAttributePreprocessor: jest.fn(),
  };
  return { __esModule: true, default: StyleSheet, ...StyleSheet };
});

jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  __esModule: true,
  default: {
    get: (dim) => {
      if (dim === 'window' || dim === 'screen')
        return { width: 750, height: 1334, scale: 2, fontScale: 2 };
      return {};
    },
    set: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  __esModule: true,
  default: {
    get: () => 2,
    getFontScale: () => 2,
    getPixelSizeForLayoutSize: (size) => size * 2,
    roundToNearestPixel: (size) => Math.round(size * 2) / 2,
  },
}));

jest.mock('react-native/Libraries/AppState/AppState', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    currentState: 'active',
    isAvailable: true,
  },
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  __esModule: true,
  default: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    openSettings: jest.fn(() => Promise.resolve()),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    sendIntent: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  __esModule: true,
  default: { alert: jest.fn(), prompt: jest.fn() },
}));

jest.mock('react-native/Libraries/Share/Share', () => ({
  __esModule: true,
  default: {
    share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
  },
}));

jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
  __esModule: true,
  default: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    dismiss: jest.fn(),
    scheduleLayoutAnimation: jest.fn(),
    isVisible: jest.fn(() => false),
    metrics: jest.fn(() => null),
  },
}));

jest.mock('react-native/Libraries/LayoutAnimation/LayoutAnimation', () => ({
  __esModule: true,
  default: {
    configureNext: jest.fn(),
    create: jest.fn(),
    checkConfig: jest.fn(),
    Types: {
      spring: 'spring',
      linear: 'linear',
      easeInEaseOut: 'easeInEaseOut',
      easeIn: 'easeIn',
      easeOut: 'easeOut',
      keyboard: 'keyboard',
    },
    Properties: {
      opacity: 'opacity',
      scaleX: 'scaleX',
      scaleY: 'scaleY',
      scaleXY: 'scaleXY',
    },
    Presets: {
      easeInEaseOut: { duration: 300, type: 'easeInEaseOut' },
      linear: { duration: 500, type: 'linear' },
      spring: { duration: 700, type: 'spring', springDamping: 0.4 },
    },
  },
}));

jest.mock('react-native/Libraries/Interaction/InteractionManager', () => ({
  __esModule: true,
  default: {
    runAfterInteractions: jest.fn((task) => {
      if (typeof task === 'function') task();
      else if (task && typeof task.gen === 'function') task.gen();
      return { then: jest.fn(), done: jest.fn(), cancel: jest.fn() };
    }),
    createInteractionHandle: jest.fn(() => 1),
    clearInteractionHandle: jest.fn(),
    setDeadline: jest.fn(),
  },
}));

jest.mock('react-native/Libraries/Interaction/PanResponder', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      panHandlers: {
        onStartShouldSetResponder: jest.fn(),
        onMoveShouldSetResponder: jest.fn(),
        onStartShouldSetResponderCapture: jest.fn(),
        onMoveShouldSetResponderCapture: jest.fn(),
        onResponderGrant: jest.fn(),
        onResponderMove: jest.fn(),
        onResponderRelease: jest.fn(),
        onResponderTerminate: jest.fn(),
        onResponderTerminationRequest: jest.fn(),
      },
    })),
  },
}));

jest.mock('react-native/Libraries/Vibration/Vibration', () => ({
  __esModule: true,
  default: { vibrate: jest.fn(), cancel: jest.fn() },
}));

jest.mock('react-native/Libraries/Utilities/BackHandler', () => ({
  __esModule: true,
  default: {
    exitApp: jest.fn(),
    addEventListener: jest.fn((eventName, handler) => ({
      remove: jest.fn(),
    })),
    removeEventListener: jest.fn(),
  },
}));

jest.mock(
  'react-native/Libraries/PermissionsAndroid/PermissionsAndroid',
  () => ({
    __esModule: true,
    default: {
      PERMISSIONS: {
        CAMERA: 'android.permission.CAMERA',
        READ_CONTACTS: 'android.permission.READ_CONTACTS',
        READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
        WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
      },
      RESULTS: {
        GRANTED: 'granted',
        DENIED: 'denied',
        NEVER_ASK_AGAIN: 'never_ask_again',
      },
      check: jest.fn(() => Promise.resolve('granted')),
      request: jest.fn(() => Promise.resolve('granted')),
      requestMultiple: jest.fn(() => Promise.resolve({})),
    },
  }),
);

jest.mock(
  'react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo',
  () => ({
    __esModule: true,
    default: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      announceForAccessibility: jest.fn(),
      announceForAccessibilityWithOptions: jest.fn(),
      isAccessibilityServiceEnabled: jest.fn(() => Promise.resolve(false)),
      isBoldTextEnabled: jest.fn(() => Promise.resolve(false)),
      isGrayscaleEnabled: jest.fn(() => Promise.resolve(false)),
      isInvertColorsEnabled: jest.fn(() => Promise.resolve(false)),
      isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
      prefersCrossFadeTransitions: jest.fn(() => Promise.resolve(false)),
      isReduceTransparencyEnabled: jest.fn(() => Promise.resolve(false)),
      isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
      setAccessibilityFocus: jest.fn(),
      sendAccessibilityEvent: jest.fn(),
      getRecommendedTimeoutMillis: jest.fn(() => Promise.resolve(0)),
    },
  }),
);

jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
  __esModule: true,
  getColorScheme: jest.fn(() => 'light'),
  setColorScheme: jest.fn(),
  addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    width: 750,
    height: 1334,
    scale: 2,
    fontScale: 2,
  })),
}));

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}));

// Animated API
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const mockAnimValue = class {
    constructor(value) {
      this._value = value || 0;
    }
    setValue(value) {
      this._value = value;
    }
    setOffset() {}
    flattenOffset() {}
    extractOffset() {}
    addListener() {
      return '0';
    }
    removeListener() {}
    removeAllListeners() {}
    stopAnimation(cb) {
      cb && cb(this._value);
    }
    resetAnimation(cb) {
      cb && cb(this._value);
    }
    interpolate() {
      return new mockAnimValue(0);
    }
  };

  const mockAnim = () => ({
    start: jest.fn((cb) => cb && cb({ finished: true })),
    stop: jest.fn(),
    reset: jest.fn(),
  });

  const mockView = mockForwardRef('View');
  const mockAnimText = mockComponent('Text');
  const mockAnimImage = mockComponent('Image');
  const mockAnimScroll = mockComponent('ScrollView');

  return {
    __esModule: true,
    default: {
      Value: mockAnimValue,
      ValueXY: class {
        constructor(v) {
          this.x = new mockAnimValue(v?.x || 0);
          this.y = new mockAnimValue(v?.y || 0);
        }
        setValue(v) {
          this.x.setValue(v.x);
          this.y.setValue(v.y);
        }
        setOffset() {}
        flattenOffset() {}
        extractOffset() {}
        stopAnimation(cb) {
          cb && cb({ x: 0, y: 0 });
        }
        resetAnimation(cb) {
          cb && cb({ x: 0, y: 0 });
        }
        addListener() {
          return '0';
        }
        removeListener() {}
        removeAllListeners() {}
        getLayout() {
          return { left: this.x, top: this.y };
        }
        getTranslateTransform() {
          return [{ translateX: this.x }, { translateY: this.y }];
        }
      },
      View: mockView,
      Text: mockAnimText,
      Image: mockAnimImage,
      ScrollView: mockAnimScroll,
      timing: jest.fn(() => mockAnim()),
      spring: jest.fn(() => mockAnim()),
      decay: jest.fn(() => mockAnim()),
      parallel: jest.fn(() => mockAnim()),
      sequence: jest.fn(() => mockAnim()),
      stagger: jest.fn(() => mockAnim()),
      loop: jest.fn(() => mockAnim()),
      delay: jest.fn(() => mockAnim()),
      event: jest.fn(() => jest.fn()),
      add: jest.fn(),
      subtract: jest.fn(),
      divide: jest.fn(),
      multiply: jest.fn(),
      modulo: jest.fn(),
      diffClamp: jest.fn(),
      createAnimatedComponent: jest.fn((C) => C),
    },
  };
});

// NativeEventEmitter
jest.mock(
  'react-native/Libraries/EventEmitter/NativeEventEmitter',
  () => {
    class NativeEventEmitter {
      addListener() {
        return { remove: jest.fn() };
      }
      removeListener() {}
      removeAllListeners() {}
      emit() {}
    }
    return { __esModule: true, default: NativeEventEmitter };
  },
);

// VirtualizedList
jest.mock('react-native/Libraries/Lists/VirtualizedList', () => {
  const mockReact = require('react');
  class MockVirtualizedList extends mockReact.Component {
    scrollToEnd = jest.fn();
    scrollToIndex = jest.fn();
    scrollToOffset = jest.fn();
    render() {
      const { data, renderItem, getItem, getItemCount, ListHeaderComponent, ListFooterComponent, ListEmptyComponent, keyExtractor, ...rest } = this.props;
      const mockChildren = [];
      if (ListHeaderComponent) mockChildren.push(mockReact.createElement('View', { key: 'header' }, typeof ListHeaderComponent === 'function' ? mockReact.createElement(ListHeaderComponent) : ListHeaderComponent));
      const mockItemCount = getItemCount ? getItemCount(data) : (data ? data.length : 0);
      if (mockItemCount > 0) {
        for (let i = 0; i < mockItemCount; i++) {
          const mockItem = getItem ? getItem(data, i) : data[i];
          mockChildren.push(renderItem({ item: mockItem, index: i, separators: {} }));
        }
      } else if (ListEmptyComponent) {
        mockChildren.push(typeof ListEmptyComponent === 'function' ? mockReact.createElement(ListEmptyComponent) : ListEmptyComponent);
      }
      if (ListFooterComponent) mockChildren.push(mockReact.createElement('View', { key: 'footer' }, typeof ListFooterComponent === 'function' ? mockReact.createElement(ListFooterComponent) : ListFooterComponent));
      return mockReact.createElement('VirtualizedList', rest, mockChildren);
    }
  }
  MockVirtualizedList.displayName = 'VirtualizedList';
  return { __esModule: true, default: MockVirtualizedList };
});

// TouchableNativeFeedback
jest.mock('react-native/Libraries/Components/Touchable/TouchableNativeFeedback', () => {
  const mockReact = require('react');
  class MockTNF extends mockReact.Component {
    render() {
      const mockAccessible = this.props.accessible !== undefined ? this.props.accessible : true;
      return mockReact.createElement('TouchableNativeFeedback', { ...this.props, accessible: mockAccessible }, this.props.children);
    }
  }
  MockTNF.displayName = 'TouchableNativeFeedback';
  MockTNF.SelectableBackground = jest.fn(() => ({}));
  MockTNF.SelectableBackgroundBorderless = jest.fn(() => ({}));
  MockTNF.Ripple = jest.fn(() => ({}));
  MockTNF.canUseNativeForeground = jest.fn(() => false);
  return { __esModule: true, default: MockTNF };
});

// DrawerLayoutAndroid
jest.mock('react-native/Libraries/Components/DrawerAndroid/DrawerLayoutAndroid', () => {
  const mockReact = require('react');
  class MockDrawer extends mockReact.Component {
    openDrawer = jest.fn();
    closeDrawer = jest.fn();
    render() {
      return mockReact.createElement('DrawerLayoutAndroid', this.props, this.props.children);
    }
  }
  MockDrawer.displayName = 'DrawerLayoutAndroid';
  MockDrawer.positions = { Left: 'left', Right: 'right' };
  return { __esModule: true, default: MockDrawer };
});

// ToastAndroid
jest.mock('react-native/Libraries/Components/ToastAndroid/ToastAndroid', () => ({
  __esModule: true,
  default: {
    SHORT: 0, LONG: 1, TOP: 0, BOTTOM: 1, CENTER: 2,
    show: jest.fn(), showWithGravity: jest.fn(), showWithGravityAndOffset: jest.fn(),
  },
}));

// ActionSheetIOS
jest.mock('react-native/Libraries/ActionSheetIOS/ActionSheetIOS', () => ({
  __esModule: true,
  default: {
    showActionSheetWithOptions: jest.fn(),
    showShareActionSheetWithOptions: jest.fn(),
  },
}));

// Clipboard
jest.mock('react-native/Libraries/Components/Clipboard/Clipboard', () => ({
  __esModule: true,
  default: {
    getString: jest.fn(() => Promise.resolve('')),
    setString: jest.fn(),
    hasString: jest.fn(() => Promise.resolve(false)),
  },
}));

// Settings
jest.mock('react-native/Libraries/Settings/Settings', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => null),
    set: jest.fn(),
    watchKeys: jest.fn(() => 0),
    clearWatch: jest.fn(),
  },
}));

// InputAccessoryView
jest.mock('react-native/Libraries/Components/TextInput/InputAccessoryView', () => {
  const mockReact = require('react');
  function MockIAV(props) {
    return mockReact.createElement('InputAccessoryView', props, props.children);
  }
  MockIAV.displayName = 'InputAccessoryView';
  return { __esModule: true, default: MockIAV };
});

// NativeModules
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
  __esModule: true,
  default: {
    AlertManager: { alertWithArgs: jest.fn() },
    DevSettings: { addMenuItem: jest.fn(), reload: jest.fn() },
    ImageLoader: { getSize: jest.fn(() => Promise.resolve([320, 240])) },
    PlatformConstants: { getConstants: () => ({ isTesting: true, reactNativeVersion: { major: 0, minor: 83, patch: 0 } }) },
    Timing: { createTimer: jest.fn(), deleteTimer: jest.fn() },
    I18nManager: { allowRTL: jest.fn(), forceRTL: jest.fn(), getConstants: () => ({ isRTL: false }) },
  },
}));

// Configure RNTL
try {
  const { configure } = require('@testing-library/react-native');
  configure({
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
  // RNTL may not be available
}
