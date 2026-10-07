// Minor version of the installed react-native, for tests of APIs that React
// Native has removed (the mocks mirror the installed version).
export const rnMinor: number = Number(require('react-native/package.json').version.split('.')[1]);
