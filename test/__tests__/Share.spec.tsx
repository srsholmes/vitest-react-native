import { test, expect, describe, vi, beforeEach } from 'vitest';
import { Share } from 'react-native';

describe('Share', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('share is callable', async () => {
    await Share.share({ message: 'Hello World' });
    expect(Share.share).toHaveBeenCalled();
  });

  test('share returns a promise', () => {
    const result = Share.share({ message: 'Test' });
    expect(result).toBeInstanceOf(Promise);
  });

  test('share resolves with action', async () => {
    const result = await Share.share({ message: 'Test' });
    expect(result).toHaveProperty('action');
    expect(result.action).toBe('sharedAction');
  });

  test('share with message', async () => {
    await Share.share({ message: 'Check this out!' });
    expect(Share.share).toHaveBeenCalledWith({ message: 'Check this out!' });
  });

  test('share with url', async () => {
    await Share.share({ url: 'https://example.com' });
    expect(Share.share).toHaveBeenCalledWith({ url: 'https://example.com' });
  });

  test('share with title', async () => {
    await Share.share({ message: 'Content', title: 'Share Title' });
    expect(Share.share).toHaveBeenCalledWith({ message: 'Content', title: 'Share Title' });
  });

  test('share with message and url', async () => {
    const content = {
      message: 'Check out this link!',
      url: 'https://example.com',
    };
    await Share.share(content);
    expect(Share.share).toHaveBeenCalledWith(content);
  });

  test('share with options', async () => {
    const content = { message: 'Test' };
    const options = { dialogTitle: 'Share via', subject: 'Subject line' };
    await Share.share(content, options);
    expect(Share.share).toHaveBeenCalledWith(content, options);
  });

  test('share with excludedActivityTypes', async () => {
    const content = { message: 'Test' };
    const options = { excludedActivityTypes: ['com.apple.UIKit.activity.PostToTwitter'] };
    await Share.share(content, options);
    expect(Share.share).toHaveBeenCalledWith(content, options);
  });

  test('share method is defined', () => {
    expect(Share.share).toBeDefined();
  });
});
