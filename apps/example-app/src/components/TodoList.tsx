import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  useSharedValue,
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface TodoListProps {
  initialItems?: TodoItem[];
  onItemsChange?: (items: TodoItem[]) => void;
  testID?: string;
}

interface TodoItemComponentProps {
  item: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  testID?: string;
}

const TodoItemComponent: React.FC<TodoItemComponentProps> = ({
  item,
  onToggle,
  onDelete,
  testID,
}) => {
  const opacity = useSharedValue(item.completed ? 0.6 : 1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleToggle = useCallback(() => {
    opacity.value = withTiming(item.completed ? 1 : 0.6);
    onToggle(item.id);
  }, [item.id, item.completed, onToggle, opacity]);

  return (
    <Animated.View
      testID={testID}
      style={[styles.todoItem, animatedStyle]}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
    >
      <Pressable
        testID={`${testID}-toggle`}
        style={styles.checkbox}
        onPress={handleToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.completed }}
      >
        <View style={[styles.checkboxInner, item.completed && styles.checkboxChecked]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </Pressable>

      <Text
        testID={`${testID}-text`}
        style={[styles.todoText, item.completed && styles.todoTextCompleted]}
      >
        {item.text}
      </Text>

      <Pressable
        testID={`${testID}-delete`}
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
        accessibilityRole="button"
        accessibilityLabel="Delete todo"
      >
        <Text style={styles.deleteText}>×</Text>
      </Pressable>
    </Animated.View>
  );
};

export const TodoList: React.FC<TodoListProps> = ({ initialItems = [], onItemsChange, testID }) => {
  const [items, setItems] = useState<TodoItem[]>(initialItems);
  const [inputText, setInputText] = useState('');
  const inputScale = useSharedValue(1);

  const updateItems = useCallback(
    (newItems: TodoItem[]) => {
      setItems(newItems);
      onItemsChange?.(newItems);
    },
    [onItemsChange]
  );

  const addTodo = useCallback(() => {
    if (inputText.trim()) {
      const newItem: TodoItem = {
        id: Date.now().toString(),
        text: inputText.trim(),
        completed: false,
        createdAt: new Date(),
      };
      updateItems([newItem, ...items]);
      setInputText('');
      inputScale.value = withSpring(1.05, {}, () => {
        inputScale.value = withSpring(1);
      });
    }
  }, [inputText, items, updateItems, inputScale]);

  const toggleTodo = useCallback(
    (id: string) => {
      updateItems(
        items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
      );
    },
    [items, updateItems]
  );

  const deleteTodo = useCallback(
    (id: string) => {
      updateItems(items.filter((item) => item.id !== id));
    },
    [items, updateItems]
  );

  const clearCompleted = useCallback(() => {
    updateItems(items.filter((item) => !item.completed));
  }, [items, updateItems]);

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>Todo List</Text>

      <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
        <TextInput
          testID={`${testID}-input`}
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Add a new todo..."
          placeholderTextColor="#8E8E93"
          onSubmitEditing={addTodo}
          returnKeyType="done"
        />
        <Pressable
          testID={`${testID}-add`}
          style={[styles.addButton, !inputText.trim() && styles.addButtonDisabled]}
          onPress={addTodo}
          disabled={!inputText.trim()}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.statsContainer}>
        <Text testID={`${testID}-stats`} style={styles.stats}>
          {completedCount} of {totalCount} completed
        </Text>
        {completedCount > 0 && (
          <Pressable testID={`${testID}-clear`} onPress={clearCompleted} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear completed</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        testID={`${testID}-list`}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TodoItemComponent
            item={item}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            testID={`${testID}-item-${index}`}
          />
        )}
        ListEmptyComponent={
          <Text testID={`${testID}-empty`} style={styles.emptyText}>
            No todos yet. Add one above!
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1C1E',
  },
  addButton: {
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stats: {
    fontSize: 14,
    color: '#8E8E93',
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  listContent: {
    gap: 8,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 24,
    color: '#FF3B30',
    fontWeight: '300',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 40,
  },
});
