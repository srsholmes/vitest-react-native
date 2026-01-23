import { test, expect, describe, vi, beforeEach } from 'vitest';
import { LayoutAnimation } from 'react-native';

describe('LayoutAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('configureNext is callable', () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    expect(LayoutAnimation.configureNext).toHaveBeenCalled();
  });

  test('configureNext with callback', () => {
    const callback = vi.fn();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring, callback);
    expect(LayoutAnimation.configureNext).toHaveBeenCalled();
  });

  test('configureNext with error callback', () => {
    const onAnimationDidEnd = vi.fn();
    const onError = vi.fn();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear, onAnimationDidEnd, onError);
    expect(LayoutAnimation.configureNext).toHaveBeenCalled();
  });

  test('create is callable', () => {
    const _config = LayoutAnimation.create(300, 'easeInEaseOut', 'opacity');
    expect(LayoutAnimation.create).toHaveBeenCalledWith(300, 'easeInEaseOut', 'opacity');
  });

  test('checkConfig is callable', () => {
    LayoutAnimation.checkConfig({});
    expect(LayoutAnimation.checkConfig).toHaveBeenCalled();
  });

  test('Types are defined', () => {
    expect(LayoutAnimation.Types).toBeDefined();
    expect(LayoutAnimation.Types.spring).toBe('spring');
    expect(LayoutAnimation.Types.linear).toBe('linear');
    expect(LayoutAnimation.Types.easeInEaseOut).toBe('easeInEaseOut');
    expect(LayoutAnimation.Types.easeIn).toBe('easeIn');
    expect(LayoutAnimation.Types.easeOut).toBe('easeOut');
    expect(LayoutAnimation.Types.keyboard).toBe('keyboard');
  });

  test('Properties are defined', () => {
    expect(LayoutAnimation.Properties).toBeDefined();
    expect(LayoutAnimation.Properties.opacity).toBe('opacity');
    expect(LayoutAnimation.Properties.scaleX).toBe('scaleX');
    expect(LayoutAnimation.Properties.scaleY).toBe('scaleY');
    expect(LayoutAnimation.Properties.scaleXY).toBe('scaleXY');
  });

  test('Presets are defined', () => {
    expect(LayoutAnimation.Presets).toBeDefined();
  });

  test('Presets.easeInEaseOut is defined', () => {
    expect(LayoutAnimation.Presets.easeInEaseOut).toBeDefined();
    expect(LayoutAnimation.Presets.easeInEaseOut.duration).toBe(300);
    expect(LayoutAnimation.Presets.easeInEaseOut.type).toBe('easeInEaseOut');
  });

  test('Presets.linear is defined', () => {
    expect(LayoutAnimation.Presets.linear).toBeDefined();
    expect(LayoutAnimation.Presets.linear.duration).toBe(500);
    expect(LayoutAnimation.Presets.linear.type).toBe('linear');
  });

  test('Presets.spring is defined', () => {
    expect(LayoutAnimation.Presets.spring).toBeDefined();
    expect(LayoutAnimation.Presets.spring.duration).toBe(700);
    expect(LayoutAnimation.Presets.spring.type).toBe('spring');
    expect(LayoutAnimation.Presets.spring.springDamping).toBe(0.4);
  });

  test('configureNext with custom config', () => {
    const customConfig = {
      duration: 400,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleXY,
      },
      update: {
        type: LayoutAnimation.Types.spring,
      },
    };
    LayoutAnimation.configureNext(customConfig);
    expect(LayoutAnimation.configureNext).toHaveBeenCalledWith(customConfig);
  });

  test('all methods are defined', () => {
    expect(LayoutAnimation.configureNext).toBeDefined();
    expect(LayoutAnimation.create).toBeDefined();
    expect(LayoutAnimation.checkConfig).toBeDefined();
    expect(LayoutAnimation.Types).toBeDefined();
    expect(LayoutAnimation.Properties).toBeDefined();
    expect(LayoutAnimation.Presets).toBeDefined();
  });
});
