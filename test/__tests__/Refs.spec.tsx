import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react-native';
import {
  ActivityIndicator,
  Pressable,
  Switch,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';

/**
 * Refs to React Native components, and the instance methods they expose.
 *
 * These mocks used to pass `ref` inside the props object of a host element, where React
 * does not consume it as a ref — so `ref.current` stayed null, `TextInput.focus()` was
 * unreachable, and `ref={null}` showed up in every snapshot. Only the class-based mocks
 * (ScrollView and friends) worked, by accident of being classes.
 */

/** What React Native's NativeMethods gives every host instance. */
const HOST_METHODS = [
  'measure',
  'measureInWindow',
  'measureLayout',
  'setNativeProps',
  'focus',
  'blur',
] as const;

type AnyRef = React.RefObject<Record<string, unknown> | null>;

// TouchableWithoutFeedback's published props type does not admit `ref`, though the
// component forwards one.
const RefAcceptingTouchable = TouchableWithoutFeedback as unknown as React.ComponentType<{
  ref?: AnyRef;
  children?: React.ReactNode;
}>;

const renderWithRef = (element: (ref: AnyRef) => React.ReactElement): AnyRef => {
  const ref = React.createRef() as AnyRef;
  render(element(ref));
  return ref;
};

describe('component refs', () => {
  const cases: Array<[string, (ref: AnyRef) => React.ReactElement]> = [
    ['View', (ref) => <View ref={ref as never} />],
    ['Text', (ref) => <Text ref={ref as never} />],
    ['TextInput', (ref) => <TextInput ref={ref as never} />],
    ['Image', (ref) => <Image ref={ref as never} source={{ uri: 'x' }} />],
    ['ImageBackground', (ref) => <ImageBackground ref={ref as never} source={{ uri: 'x' }} />],
    ['ActivityIndicator', (ref) => <ActivityIndicator ref={ref as never} />],
    ['KeyboardAvoidingView', (ref) => <KeyboardAvoidingView ref={ref as never} />],
    ['SafeAreaView', (ref) => <SafeAreaView ref={ref as never} />],
    // Rendered on its own rather than through ScrollView's refreshControl prop: that
    // prop is passed through but never mounted by the ScrollView mock, so nothing
    // given to it renders at all. That is its own gap, separate from ref forwarding.
    ['RefreshControl', (ref) => <RefreshControl ref={ref as never} refreshing={false} />],
    // These three come from shared mock factories, so they had the same defect in a
    // form the first search missed — the ref was on its own line rather than inline.
    ['Pressable', (ref) => <Pressable ref={ref as never} />],
    ['Switch', (ref) => <Switch ref={ref as never} />],
    ['TouchableOpacity', (ref) => <TouchableOpacity ref={ref as never} />],
    ['TouchableHighlight', (ref) => <TouchableHighlight ref={ref as never} />],
    [
      'TouchableWithoutFeedback',
      (ref) => (
        <RefAcceptingTouchable ref={ref}>
          <View />
        </RefAcceptingTouchable>
      ),
    ],
  ];

  it.each(cases)('%s resolves its ref', (_name, element) => {
    const ref = renderWithRef(element);

    expect(ref.current).not.toBeNull();
  });

  it.each(cases)('%s exposes the host instance methods', (_name, element) => {
    const ref = renderWithRef(element);

    for (const method of HOST_METHODS) {
      expect(typeof ref.current?.[method]).toBe('function');
    }
  });

  it('measure reports a layout through its callback', () => {
    const ref = renderWithRef((r) => <View ref={r as never} />);
    const callback = vi.fn();

    (ref.current?.measure as (cb: unknown) => void)(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0]).toHaveLength(6);
  });

  it('measureInWindow reports a layout through its callback', () => {
    const ref = renderWithRef((r) => <View ref={r as never} />);
    const callback = vi.fn();

    (ref.current?.measureInWindow as (cb: unknown) => void)(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0]).toHaveLength(4);
  });

  it('measureLayout calls its success callback', () => {
    const ref = renderWithRef((r) => <View ref={r as never} />);
    const onSuccess = vi.fn();
    const onFail = vi.fn();

    (ref.current?.measureLayout as (n: unknown, s: unknown, f: unknown) => void)(
      1,
      onSuccess,
      onFail
    );

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onFail).not.toHaveBeenCalled();
  });
});

describe('TextInput instance', () => {
  const renderInput = () => renderWithRef((ref) => <TextInput ref={ref as never} />);

  it('exposes its own methods on top of the host ones', () => {
    const ref = renderInput();

    for (const method of ['isFocused', 'clear', 'setSelection']) {
      expect(typeof ref.current?.[method]).toBe('function');
    }
  });

  it('tracks focus through focus() and blur()', () => {
    const ref = renderInput();
    const input = ref.current as {
      focus: () => void;
      blur: () => void;
      isFocused: () => boolean;
    };

    expect(input.isFocused()).toBe(false);

    input.focus();
    expect(input.isFocused()).toBe(true);

    input.blur();
    expect(input.isFocused()).toBe(false);
  });
});

describe('snapshots', () => {
  it('does not leak ref into the rendered props', () => {
    const ref = React.createRef();
    const { toJSON } = render(<View ref={ref as never} testID="root" />);

    expect(JSON.stringify(toJSON())).not.toContain('"ref"');
  });
});
