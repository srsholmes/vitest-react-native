import React from 'react';
import { test, expect, describe, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react-native';
import { StatusBar, View } from 'react-native';
import { rnMinor } from '../src/rnVersion';

describe('StatusBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { toJSON } = render(
      <View>
        <StatusBar barStyle="dark-content" />
      </View>
    );
    expect(toJSON()).toBeTruthy();
  });

  test('currentHeight is defined', () => {
    expect(StatusBar.currentHeight).toBeDefined();
    expect(typeof StatusBar.currentHeight).toBe('number');
  });

  test('setBarStyle is callable', () => {
    StatusBar.setBarStyle('light-content');
    expect(StatusBar.setBarStyle).toHaveBeenCalledWith('light-content');
  });

  // setBackgroundColor / setNetworkActivityIndicatorVisible / setTranslucent
  // were removed in RN 0.87; the mock only provides them on older versions.
  const LegacyStatusBar = StatusBar as typeof StatusBar & Record<string, any>;

  test.runIf(rnMinor >= 87)('legacy setters are removed (RN >= 0.87)', () => {
    expect(LegacyStatusBar.setBackgroundColor).toBeUndefined();
    expect(LegacyStatusBar.setNetworkActivityIndicatorVisible).toBeUndefined();
    expect(LegacyStatusBar.setTranslucent).toBeUndefined();
  });

  test.runIf(rnMinor < 87)('setBackgroundColor is callable', () => {
    LegacyStatusBar.setBackgroundColor('#000000');
    expect(LegacyStatusBar.setBackgroundColor).toHaveBeenCalledWith('#000000');
  });

  test('setHidden is callable', () => {
    StatusBar.setHidden(true);
    expect(StatusBar.setHidden).toHaveBeenCalledWith(true);
  });

  test.runIf(rnMinor < 87)('setNetworkActivityIndicatorVisible is callable', () => {
    LegacyStatusBar.setNetworkActivityIndicatorVisible(true);
    expect(LegacyStatusBar.setNetworkActivityIndicatorVisible).toHaveBeenCalledWith(true);
  });

  test.runIf(rnMinor < 87)('setTranslucent is callable', () => {
    LegacyStatusBar.setTranslucent(true);
    expect(LegacyStatusBar.setTranslucent).toHaveBeenCalledWith(true);
  });

  test('pushStackEntry returns object', () => {
    const entry = StatusBar.pushStackEntry({ barStyle: 'dark-content' });
    expect(entry).toBeDefined();
    expect(typeof entry).toBe('object');
  });

  test('popStackEntry is callable', () => {
    const entry = StatusBar.pushStackEntry({ barStyle: 'dark-content' });
    StatusBar.popStackEntry(entry);
    expect(StatusBar.popStackEntry).toHaveBeenCalled();
  });

  test('replaceStackEntry returns object', () => {
    const entry = StatusBar.pushStackEntry({ barStyle: 'dark-content' });
    const newEntry = StatusBar.replaceStackEntry(entry, { barStyle: 'light-content' });
    expect(newEntry).toBeDefined();
  });

  test('renders with various props', () => {
    const { toJSON } = render(
      <View>
        <StatusBar barStyle="light-content" hidden={false} animated={true} />
      </View>
    );
    expect(toJSON()).toBeTruthy();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <View>
        <StatusBar barStyle="dark-content" />
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
