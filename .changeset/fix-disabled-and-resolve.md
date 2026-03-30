---
'@srsholmes/vitest-react-native': patch
---

Fix toBeDisabled()/toBeEnabled() matchers by mapping disabled prop to accessibilityState.disabled on all interactive components. Add resolveId hook for extensionless TypeScript imports from node_modules.
