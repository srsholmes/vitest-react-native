import { test, expect, describe, vi, beforeEach } from 'vitest';
import { InteractionManager } from 'react-native';

describe('InteractionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('runAfterInteractions is callable', () => {
    const callback = vi.fn();
    InteractionManager.runAfterInteractions(callback);
    expect(InteractionManager.runAfterInteractions).toHaveBeenCalledWith(callback);
  });

  test('runAfterInteractions executes callback', () => {
    const callback = vi.fn();
    InteractionManager.runAfterInteractions(callback);
    expect(callback).toHaveBeenCalled();
  });

  test('runAfterInteractions returns cancellable promise', () => {
    const callback = vi.fn();
    const handle = InteractionManager.runAfterInteractions(callback);
    expect(handle).toBeDefined();
    expect(handle.then).toBeDefined();
    expect(handle.done).toBeDefined();
    expect(handle.cancel).toBeDefined();
  });

  test('createInteractionHandle is callable', () => {
    const handle = InteractionManager.createInteractionHandle();
    expect(InteractionManager.createInteractionHandle).toHaveBeenCalled();
    expect(handle).toBeDefined();
    expect(typeof handle).toBe('number');
  });

  test('createInteractionHandle returns a number', () => {
    const handle = InteractionManager.createInteractionHandle();
    expect(handle).toBe(1);
  });

  test('clearInteractionHandle is callable', () => {
    const handle = InteractionManager.createInteractionHandle();
    InteractionManager.clearInteractionHandle(handle);
    expect(InteractionManager.clearInteractionHandle).toHaveBeenCalledWith(handle);
  });

  test('setDeadline is callable', () => {
    InteractionManager.setDeadline(100);
    expect(InteractionManager.setDeadline).toHaveBeenCalledWith(100);
  });

  test('interaction workflow', () => {
    // Create an interaction handle
    const handle = InteractionManager.createInteractionHandle();
    expect(handle).toBeDefined();

    // Run something after interactions
    const callback = vi.fn();
    InteractionManager.runAfterInteractions(callback);

    // Clear the handle
    InteractionManager.clearInteractionHandle(handle);
    expect(InteractionManager.clearInteractionHandle).toHaveBeenCalled();
  });

  test('cancel handle works', () => {
    const callback = vi.fn();
    const handle = InteractionManager.runAfterInteractions(callback);
    expect(() => handle.cancel()).not.toThrow();
  });

  test('all methods are defined', () => {
    expect(InteractionManager.runAfterInteractions).toBeDefined();
    expect(InteractionManager.createInteractionHandle).toBeDefined();
    expect(InteractionManager.clearInteractionHandle).toBeDefined();
    expect(InteractionManager.setDeadline).toBeDefined();
  });
});
