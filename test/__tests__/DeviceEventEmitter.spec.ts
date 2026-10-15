import { describe, expect, it, vi } from 'vitest';
import { DeviceEventEmitter } from 'react-native';

/**
 * DeviceEventEmitter is the one mock that holds real state: it is a module-level
 * singleton whose listener map lives for the whole test file, so a listener registered
 * in one test is still subscribed in the next unless something clears it.
 */

const emitter = DeviceEventEmitter as typeof DeviceEventEmitter & { _reset: () => void };

describe('DeviceEventEmitter', () => {
  it('delivers emitted events to listeners', () => {
    const listener = vi.fn();
    DeviceEventEmitter.addListener('testEvent', listener);

    DeviceEventEmitter.emit('testEvent', { value: 1 });

    expect(listener).toHaveBeenCalledWith({ value: 1 });
    emitter._reset();
  });

  it('stops delivering to a removed listener', () => {
    const listener = vi.fn();
    DeviceEventEmitter.addListener('testEvent', listener).remove();

    DeviceEventEmitter.emit('testEvent');

    expect(listener).not.toHaveBeenCalled();
    emitter._reset();
  });

  it('_reset clears listeners so they cannot leak into the next test', () => {
    expect(typeof emitter._reset).toBe('function');
    const listener = vi.fn();
    DeviceEventEmitter.addListener('testEvent', listener);

    emitter._reset();
    DeviceEventEmitter.emit('testEvent');

    expect(listener).not.toHaveBeenCalled();
  });
});
