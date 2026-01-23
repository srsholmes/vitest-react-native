import { test, expect, describe, vi, beforeEach } from 'vitest';
import { PanResponder } from 'react-native';

describe('PanResponder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('create is callable', () => {
    const responder = PanResponder.create({});
    expect(PanResponder.create).toHaveBeenCalled();
    expect(responder).toBeDefined();
  });

  test('create returns object with panHandlers', () => {
    const responder = PanResponder.create({});
    expect(responder.panHandlers).toBeDefined();
  });

  test('panHandlers has required methods', () => {
    const responder = PanResponder.create({});
    const { panHandlers } = responder;

    expect(panHandlers.onStartShouldSetResponder).toBeDefined();
    expect(panHandlers.onMoveShouldSetResponder).toBeDefined();
    expect(panHandlers.onStartShouldSetResponderCapture).toBeDefined();
    expect(panHandlers.onMoveShouldSetResponderCapture).toBeDefined();
    expect(panHandlers.onResponderGrant).toBeDefined();
    expect(panHandlers.onResponderMove).toBeDefined();
    expect(panHandlers.onResponderRelease).toBeDefined();
    expect(panHandlers.onResponderTerminate).toBeDefined();
    expect(panHandlers.onResponderTerminationRequest).toBeDefined();
  });

  test('create with config callbacks', () => {
    const config = {
      onStartShouldSetPanResponder: vi.fn(() => true),
      onStartShouldSetPanResponderCapture: vi.fn(() => false),
      onMoveShouldSetPanResponder: vi.fn(() => true),
      onMoveShouldSetPanResponderCapture: vi.fn(() => false),
      onPanResponderGrant: vi.fn(),
      onPanResponderMove: vi.fn(),
      onPanResponderRelease: vi.fn(),
      onPanResponderTerminate: vi.fn(),
      onPanResponderTerminationRequest: vi.fn(() => true),
    };

    const responder = PanResponder.create(config);
    expect(PanResponder.create).toHaveBeenCalledWith(config);
    expect(responder).toBeDefined();
  });

  test('create with partial config', () => {
    const config = {
      onPanResponderGrant: vi.fn(),
      onPanResponderRelease: vi.fn(),
    };

    const responder = PanResponder.create(config);
    expect(responder).toBeDefined();
    expect(responder.panHandlers).toBeDefined();
  });

  test('panHandlers methods are functions', () => {
    const responder = PanResponder.create({});
    const { panHandlers } = responder;

    expect(typeof panHandlers.onStartShouldSetResponder).toBe('function');
    expect(typeof panHandlers.onMoveShouldSetResponder).toBe('function');
    expect(typeof panHandlers.onResponderGrant).toBe('function');
    expect(typeof panHandlers.onResponderMove).toBe('function');
    expect(typeof panHandlers.onResponderRelease).toBe('function');
  });

  test('create method is defined', () => {
    expect(PanResponder.create).toBeDefined();
  });
});
