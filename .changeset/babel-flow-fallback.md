---
'@srsholmes/vitest-react-native': patch
---

Load React Native modules written in Flow's modern `enum` / `component` / `hook` syntax.

`flow-remove-types` erases type annotations but passes those *declarations* through
untouched, after which esbuild fails to parse them — so the modules could not be loaded at
all. The transform now falls back to React Native's own Babel preset, which lowers them,
on the original source rather than the stripped output.

The fallback is lazy and optional: it runs only for a file esbuild rejects, and it needs
`@babel/core` plus `@react-native/babel-preset` to resolve from your project — they ship
with every React Native app. Without them you get an error naming both, and only for the
affected modules; everything else keeps using the Babel-free path. Projects that never
touch these modules are unaffected.

In React Native 0.87 this fixes `experimental_LayoutConformance`, `VirtualViewMode` and
the four `unstable_Virtual*` exports, which previously threw on access.

The enum plugin is applied ahead of the preset deliberately: the preset merges
strip-types before its own enum handling, which deletes `export enum Foo {}` and leaves a
`ReferenceError` at runtime instead of a parse failure.

Also fixes `NativeComponentRegistry.get()` and `getWithFallback_DEPRECATED()`, which
called the `requireNativeComponent` mock's module namespace instead of its `.default` and
threw "requireNativeComponent is not a function". Nothing loaded that path until these
modules started compiling.

The transform cache directory is now keyed by the resolved `@babel/core` and preset
versions, so a toolchain upgrade cannot serve output built by the previous one. Existing
caches are invalidated once.
