import { describe, test, expect, vi } from 'vitest';
import { ActionSheetIOS } from 'react-native';

describe('ActionSheetIOS', () => {
  test('showActionSheetWithOptions is a function', () => {
    expect(typeof ActionSheetIOS.showActionSheetWithOptions).toBe('function');
  });

  test('showActionSheetWithOptions can be called', () => {
    const callback = vi.fn();
    const options = {
      options: ['Cancel', 'Delete', 'Save'],
      cancelButtonIndex: 0,
      destructiveButtonIndex: 1,
    };

    ActionSheetIOS.showActionSheetWithOptions(options, callback);

    expect(ActionSheetIOS.showActionSheetWithOptions).toHaveBeenCalledWith(options, callback);
  });

  test('showActionSheetWithOptions with all options', () => {
    const callback = vi.fn();
    const options = {
      options: ['Cancel', 'Delete', 'Share', 'Save'],
      cancelButtonIndex: 0,
      destructiveButtonIndex: 1,
      title: 'Choose an action',
      message: 'What would you like to do?',
      anchor: 123,
      tintColor: '#007AFF',
    };

    ActionSheetIOS.showActionSheetWithOptions(options, callback);

    expect(ActionSheetIOS.showActionSheetWithOptions).toHaveBeenCalled();
  });

  test('showShareActionSheetWithOptions is a function', () => {
    expect(typeof ActionSheetIOS.showShareActionSheetWithOptions).toBe('function');
  });

  test('showShareActionSheetWithOptions can be called', () => {
    const failureCallback = vi.fn();
    const successCallback = vi.fn();
    const options = {
      message: 'Check out this content!',
      url: 'https://example.com',
    };

    ActionSheetIOS.showShareActionSheetWithOptions(options, failureCallback, successCallback);

    expect(ActionSheetIOS.showShareActionSheetWithOptions).toHaveBeenCalledWith(
      options,
      failureCallback,
      successCallback
    );
  });

  test('showShareActionSheetWithOptions with subject', () => {
    const failureCallback = vi.fn();
    const successCallback = vi.fn();
    const options = {
      message: 'Check this out!',
      url: 'https://example.com/article',
      subject: 'Interesting Article',
      excludedActivityTypes: ['com.apple.UIKit.activity.PostToTwitter'],
    };

    ActionSheetIOS.showShareActionSheetWithOptions(options, failureCallback, successCallback);

    expect(ActionSheetIOS.showShareActionSheetWithOptions).toHaveBeenCalled();
  });
});
