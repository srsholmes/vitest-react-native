import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { TodoList, TodoItem } from '../src/components/TodoList';

const mockTodos: TodoItem[] = [
  { id: '1', text: 'Buy groceries', completed: false, createdAt: new Date() },
  { id: '2', text: 'Walk the dog', completed: true, createdAt: new Date() },
  { id: '3', text: 'Read a book', completed: false, createdAt: new Date() },
];

describe('TodoList', () => {
  test('renders with title', () => {
    const { getByText } = render(<TodoList testID="todos" />);
    expect(getByText('Todo List')).toBeTruthy();
  });

  test('renders empty state when no items', () => {
    const { getByTestId } = render(<TodoList testID="todos" />);
    expect(getByTestId('todos-empty')).toBeTruthy();
  });

  test('renders initial items', () => {
    const { getByText } = render(<TodoList initialItems={mockTodos} testID="todos" />);

    expect(getByText('Buy groceries')).toBeTruthy();
    expect(getByText('Walk the dog')).toBeTruthy();
    expect(getByText('Read a book')).toBeTruthy();
  });

  test('shows correct stats', () => {
    const { getByTestId } = render(<TodoList initialItems={mockTodos} testID="todos" />);

    expect(getByTestId('todos-stats').props.children).toEqual([1, ' of ', 3, ' completed']);
  });

  test('adds a new todo', () => {
    const onItemsChange = vi.fn();
    const { getByTestId, getByText } = render(
      <TodoList onItemsChange={onItemsChange} testID="todos" />
    );

    const input = getByTestId('todos-input');
    fireEvent.changeText(input, 'New todo item');
    fireEvent.press(getByTestId('todos-add'));

    expect(getByText('New todo item')).toBeTruthy();
    expect(onItemsChange).toHaveBeenCalled();
  });

  test('clears input after adding todo', () => {
    const { getByTestId } = render(<TodoList testID="todos" />);

    const input = getByTestId('todos-input');
    fireEvent.changeText(input, 'New todo');
    fireEvent.press(getByTestId('todos-add'));

    expect(input.props.value).toBe('');
  });

  test('does not add empty todo', () => {
    const onItemsChange = vi.fn();
    const { getByTestId } = render(<TodoList onItemsChange={onItemsChange} testID="todos" />);

    fireEvent.press(getByTestId('todos-add'));
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  test('toggles todo completion', () => {
    const onItemsChange = vi.fn();
    const { getByTestId } = render(
      <TodoList initialItems={[mockTodos[0]]} onItemsChange={onItemsChange} testID="todos" />
    );

    fireEvent.press(getByTestId('todos-item-0-toggle'));
    expect(onItemsChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: '1', completed: true })])
    );
  });

  test('deletes todo', () => {
    const onItemsChange = vi.fn();
    const { getByTestId } = render(
      <TodoList initialItems={[mockTodos[0]]} onItemsChange={onItemsChange} testID="todos" />
    );

    fireEvent.press(getByTestId('todos-item-0-delete'));
    expect(onItemsChange).toHaveBeenCalledWith([]);
  });

  test('clears completed todos', () => {
    const onItemsChange = vi.fn();
    const { getByTestId } = render(
      <TodoList initialItems={mockTodos} onItemsChange={onItemsChange} testID="todos" />
    );

    fireEvent.press(getByTestId('todos-clear'));
    expect(onItemsChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ completed: false })])
    );
  });

  test('shows clear button only when there are completed items', () => {
    // Test without completed items - clear button should not appear
    const { queryByTestId, unmount } = render(
      <TodoList
        initialItems={[mockTodos[0]]} // Only uncompleted
        testID="todos"
      />
    );

    expect(queryByTestId('todos-clear')).toBeNull();
    unmount();

    // Test with completed items - clear button should appear
    const { queryByTestId: queryByTestId2 } = render(
      <TodoList
        initialItems={[mockTodos[1]]} // Only completed
        testID="todos"
      />
    );
    expect(queryByTestId2('todos-clear')).toBeTruthy();
  });

  test('submits on keyboard return', () => {
    const { getByTestId, getByText } = render(<TodoList testID="todos" />);

    const input = getByTestId('todos-input');
    fireEvent.changeText(input, 'Submit on enter');
    fireEvent(input, 'submitEditing');

    expect(getByText('Submit on enter')).toBeTruthy();
  });

  test('disables add button when input is empty', () => {
    const { getByTestId } = render(<TodoList testID="todos" />);

    const addButton = getByTestId('todos-add');
    expect(addButton.props.disabled).toBe(true);
  });

  test('enables add button when input has text', () => {
    const { getByTestId } = render(<TodoList testID="todos" />);

    const input = getByTestId('todos-input');
    fireEvent.changeText(input, 'Some text');

    const addButton = getByTestId('todos-add');
    expect(addButton.props.disabled).toBe(false);
  });

  test('matches snapshot with items', () => {
    const { toJSON } = render(<TodoList initialItems={mockTodos} testID="todos" />);
    expect(toJSON()).toMatchSnapshot();
  });

  test('matches snapshot when empty', () => {
    const { toJSON } = render(<TodoList testID="todos" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
