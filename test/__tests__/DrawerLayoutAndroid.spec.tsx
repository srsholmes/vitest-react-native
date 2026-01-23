import React from 'react';
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react-native';
import { DrawerLayoutAndroid, View, Text } from 'react-native';

describe('DrawerLayoutAndroid', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <DrawerLayoutAndroid
        drawerWidth={300}
        drawerPosition="left"
        renderNavigationView={() => (
          <View>
            <Text>Drawer Content</Text>
          </View>
        )}
      >
        <View>
          <Text>Main Content</Text>
        </View>
      </DrawerLayoutAndroid>
    );

    expect(getByText('Main Content')).toBeTruthy();
  });

  test('has static positions', () => {
    expect(DrawerLayoutAndroid.positions).toBeDefined();
    expect(DrawerLayoutAndroid.positions.Left).toBe('left');
    expect(DrawerLayoutAndroid.positions.Right).toBe('right');
  });

  test('has openDrawer method', () => {
    let drawerRef: DrawerLayoutAndroid | null = null;

    render(
      <DrawerLayoutAndroid
        ref={(ref) => {
          drawerRef = ref;
        }}
        drawerWidth={300}
        drawerPosition="left"
        renderNavigationView={() => (
          <View>
            <Text>Drawer</Text>
          </View>
        )}
      >
        <View>
          <Text>Content</Text>
        </View>
      </DrawerLayoutAndroid>
    );

    expect(drawerRef).toBeTruthy();
    expect(drawerRef!.openDrawer).toBeDefined();
    drawerRef!.openDrawer();
    expect(drawerRef!.openDrawer).toHaveBeenCalled();
  });

  test('has closeDrawer method', () => {
    let drawerRef: DrawerLayoutAndroid | null = null;

    render(
      <DrawerLayoutAndroid
        ref={(ref) => {
          drawerRef = ref;
        }}
        drawerWidth={300}
        drawerPosition="left"
        renderNavigationView={() => (
          <View>
            <Text>Drawer</Text>
          </View>
        )}
      >
        <View>
          <Text>Content</Text>
        </View>
      </DrawerLayoutAndroid>
    );

    expect(drawerRef).toBeTruthy();
    expect(drawerRef!.closeDrawer).toBeDefined();
    drawerRef!.closeDrawer();
    expect(drawerRef!.closeDrawer).toHaveBeenCalled();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <DrawerLayoutAndroid
        drawerWidth={300}
        drawerPosition="left"
        renderNavigationView={() => (
          <View>
            <Text>Drawer</Text>
          </View>
        )}
      >
        <View>
          <Text>Main</Text>
        </View>
      </DrawerLayoutAndroid>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
