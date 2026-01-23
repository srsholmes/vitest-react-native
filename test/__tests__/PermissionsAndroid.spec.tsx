import { describe, test, expect } from 'vitest';
import { PermissionsAndroid } from 'react-native';

describe('PermissionsAndroid', () => {
  test('has PERMISSIONS constants', () => {
    expect(PermissionsAndroid.PERMISSIONS).toBeDefined();
    expect(PermissionsAndroid.PERMISSIONS.CAMERA).toBe('android.permission.CAMERA');
    expect(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).toBe('android.permission.READ_CONTACTS');
    expect(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).toBe(
      'android.permission.ACCESS_FINE_LOCATION'
    );
    expect(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO).toBe('android.permission.RECORD_AUDIO');
  });

  test('has RESULTS constants', () => {
    expect(PermissionsAndroid.RESULTS).toBeDefined();
    expect(PermissionsAndroid.RESULTS.GRANTED).toBe('granted');
    expect(PermissionsAndroid.RESULTS.DENIED).toBe('denied');
    expect(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN).toBe('never_ask_again');
  });

  test('check returns granted by default', async () => {
    const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
    expect(result).toBe('granted');
  });

  test('request returns granted by default', async () => {
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    expect(result).toBe('granted');
  });

  test('requestMultiple returns object', async () => {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  test('check is called with correct permission', async () => {
    await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    expect(PermissionsAndroid.check).toHaveBeenCalledWith(
      'android.permission.ACCESS_FINE_LOCATION'
    );
  });

  test('request is called with correct permission and rationale', async () => {
    const rationale = {
      title: 'Camera Permission',
      message: 'App needs camera access',
      buttonPositive: 'OK',
    };

    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, rationale);
    expect(PermissionsAndroid.request).toHaveBeenCalledWith('android.permission.CAMERA', rationale);
  });
});
