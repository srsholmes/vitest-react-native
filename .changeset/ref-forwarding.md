---
'@srsholmes/vitest-react-native': minor
---

Fix ref forwarding: a `ref` to a component now resolves instead of staying `null`.

The component mocks passed `ref` **inside the props object** of the host element they
render — `React.createElement('View', { ...props, ref })` — where React does not consume
it as a ref. It stayed a plain prop, so `ref.current` was always `null`,
`TextInput.focus()` was unreachable, and `ref={null}` appeared in every snapshot. Only the
class-based mocks (`ScrollView`, `Modal`, `FlatList`, …) worked, by accident of being
classes, which is why this went unnoticed: no test in the repo exercised a ref.

Affected, and now fixed: `View`, `Text`, `TextInput`, `Image`, `ImageBackground`,
`ActivityIndicator`, `KeyboardAvoidingView`, `RefreshControl`, `SafeAreaView`,
`Pressable`, `Switch` and the `Touchable*` family.

Each now hands `useImperativeHandle` an object carrying React Native's `NativeMethods`:

```tsx
const input = useRef<TextInput>(null);
input.current?.focus();
input.current?.isFocused(); // true
```

- `measure`, `measureInWindow` and `measureLayout` call back with zeros — nothing in a
  Node test environment has a real layout, the same choice React Native's own Jest mock
  made. All are `vi.fn()` spies, so calls can be asserted.
- `setNativeProps`, `focus` and `blur` are spies.
- `TextInput` adds `isFocused()`, `clear()` and `setSelection(start, end)`, and tracks
  focus state across `focus()` and `blur()`.

**Snapshots change.** Removing `ref` from props drops `ref={null}` from every rendered
element, which collapses tags that had no other props — `<Text ref={null}>` becomes
`<Text>`. 30 snapshot files in this repo were regenerated; yours will need the same
(`vitest -u`). No other content changed.

Mirrored into the Jest parity baseline, where `mockForwardRef` had the identical defect
and the `mockNativeMethods` helper it should have been using was defined but never wired
up.
