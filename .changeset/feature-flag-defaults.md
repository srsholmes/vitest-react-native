---
'@srsholmes/vitest-react-native': patch
---

Fix `ReactNativeFeatureFlags` mock missing own-properties (#24).

The Proxy-only mock left every flag except `isLayoutAnimationEnabled` absent as an own-property, so named imports, `Object.keys`, and object spreads could miss `enableNativeCSSParsing` and the other ~100 flags. Now enumerates every flag from RN 0.83 with its real default (booleans, the numeric `preparedTextCacheSize`/`viewCullingOutsetRatio`/`virtualViewHysteresisRatio`/`virtualViewPrerenderRatio`, the string `virtualViewActivityBehavior`, and `override`). The Proxy fallback remains so flags added in future RN releases still degrade to `() => false`.
