---
'@srsholmes/vitest-react-native': minor
---

Mount the `refreshControl` prop, so pull-to-refresh can be tested.

`refreshControl` takes an element, which React Native mounts as part of the scrollable.
The mocks passed it straight through as a prop instead, so it was never mounted: it did
not render, nothing inside it was queryable, and it serialised into snapshots as an
unmounted element sitting in props.

Fixed on `ScrollView`, `FlatList`, `SectionList` and `VirtualizedList`. The lists had the
same defect because `refreshControl` fell into the props they spread onto their host
element.

The payoff is that the control is now in the tree, so there is something to fire an event
on:

```tsx
const onRefresh = vi.fn();
const { getByTestId } = render(
  <FlatList
    data={items}
    renderItem={renderItem}
    refreshControl={<RefreshControl testID="refresh" refreshing={false} onRefresh={onRefresh} />}
  />
);

fireEvent(getByTestId('refresh'), 'refresh');
expect(onRefresh).toHaveBeenCalledTimes(1);
```

**Snapshots change only where a `refreshControl` is passed.** The control moves out of the
props and in as the scrollable's first child. Scrollables without one are untouched —
mounting is branched on the prop being present specifically so their children keep the
shape they had. One snapshot changed in this repo.

The existing tests for this never caught it because they only ever asserted that the
*scrollable* rendered, never the control.
