import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { Modal, View, Text, Pressable } from 'react-native';

describe('Modal Component', () => {
  test('renders when visible is true', () => {
    const { getByText } = render(
      <Modal visible={true}>
        <Text>Modal Content</Text>
      </Modal>
    );
    expect(getByText('Modal Content')).toBeTruthy();
  });

  test('does not render content when visible is false', () => {
    const { queryByText } = render(
      <Modal visible={false}>
        <Text>Modal Content</Text>
      </Modal>
    );
    expect(queryByText('Modal Content')).toBeNull();
  });

  test('renders with testID', () => {
    const { getByTestId } = render(
      <Modal visible={true} testID="test-modal">
        <View testID="modal-content">
          <Text>Content</Text>
        </View>
      </Modal>
    );
    expect(getByTestId('test-modal')).toBeTruthy();
  });

  test('renders with animationType slide', () => {
    const { getByTestId } = render(
      <Modal visible={true} animationType="slide" testID="slide-modal">
        <Text>Slide Modal</Text>
      </Modal>
    );
    expect(getByTestId('slide-modal')).toBeTruthy();
  });

  test('renders with animationType fade', () => {
    const { getByTestId } = render(
      <Modal visible={true} animationType="fade" testID="fade-modal">
        <Text>Fade Modal</Text>
      </Modal>
    );
    expect(getByTestId('fade-modal')).toBeTruthy();
  });

  test('renders transparent modal', () => {
    const { getByTestId } = render(
      <Modal visible={true} transparent testID="transparent-modal">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Text>Transparent Modal</Text>
        </View>
      </Modal>
    );
    expect(getByTestId('transparent-modal')).toBeTruthy();
  });

  test('handles onRequestClose callback', () => {
    const onRequestClose = vi.fn();
    const { getByTestId } = render(
      <Modal visible={true} onRequestClose={onRequestClose} testID="modal">
        <Text>Modal Content</Text>
      </Modal>
    );
    fireEvent(getByTestId('modal'), 'requestClose');
    expect(onRequestClose).toHaveBeenCalled();
  });

  test('handles onShow callback', () => {
    const onShow = vi.fn();
    const { getByTestId } = render(
      <Modal visible={true} onShow={onShow} testID="modal">
        <Text>Modal Content</Text>
      </Modal>
    );
    fireEvent(getByTestId('modal'), 'show');
    expect(onShow).toHaveBeenCalled();
  });

  test('handles onDismiss callback', () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <Modal visible={true} onDismiss={onDismiss} testID="modal">
        <Text>Modal Content</Text>
      </Modal>
    );
    fireEvent(getByTestId('modal'), 'dismiss');
    expect(onDismiss).toHaveBeenCalled();
  });

  test('renders with presentationStyle', () => {
    const { getByTestId } = render(
      <Modal visible={true} presentationStyle="pageSheet" testID="presentation-modal">
        <Text>Page Sheet Modal</Text>
      </Modal>
    );
    expect(getByTestId('presentation-modal')).toBeTruthy();
  });

  test('renders with complex content', () => {
    const { getByTestId, getByText } = render(
      <Modal visible={true} testID="complex-modal">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Modal Title</Text>
          <Text>Modal Description</Text>
          <Pressable testID="close-button">
            <Text>Close</Text>
          </Pressable>
        </View>
      </Modal>
    );
    expect(getByTestId('complex-modal')).toBeTruthy();
    expect(getByText('Modal Title')).toBeTruthy();
    expect(getByTestId('close-button')).toBeTruthy();
  });

  test('toggles visibility correctly', () => {
    const { getByText, queryByText, rerender } = render(
      <Modal visible={true}>
        <Text>Modal Content</Text>
      </Modal>
    );
    expect(getByText('Modal Content')).toBeTruthy();

    rerender(
      <Modal visible={false}>
        <Text>Modal Content</Text>
      </Modal>
    );
    expect(queryByText('Modal Content')).toBeNull();
  });

  test('matches snapshot when visible', () => {
    const { toJSON } = render(
      <Modal visible={true} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text>Modal Content</Text>
          </View>
        </View>
      </Modal>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  test('matches snapshot when not visible', () => {
    const { toJSON } = render(
      <Modal visible={false}>
        <Text>Hidden Content</Text>
      </Modal>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
