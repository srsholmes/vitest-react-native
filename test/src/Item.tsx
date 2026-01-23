import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';

interface ItemProps {
  id: string;
  state: 'pending' | 'done';
  trashTodo: (id: string) => void;
}

const Item: React.FC<ItemProps> = ({ id, state, trashTodo }) => {
  return (
    <View style={styles.itemContainer}>
      <Pressable
        style={[styles.trashButton, state === 'done' && styles.trashButtonDone]}
        onPress={() => trashTodo(id)}
        hitSlop={10}
        testID="trash-button"
      >
        <View style={styles.icon} />
      </Pressable>
    </View>
  );
};

interface Styles {
  itemContainer: ViewStyle;
  trashButton: ViewStyle;
  trashButtonDone: ViewStyle;
  icon: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f7f8fa',
  },
  trashButton: {
    opacity: 0.8,
  },
  trashButtonDone: {
    opacity: 0.3,
  },
  icon: {
    width: 20,
    height: 20,
  },
});

export default Item;
