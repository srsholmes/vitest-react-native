/**
 * Framework-agnostic test utilities.
 *
 * These helpers detect whether we're running under Vitest or Jest and delegate
 * to the appropriate mock-function creator. Test files import `fn` from here
 * instead of directly from vitest or jest, so the same test source works in both.
 */

declare const vi: any;
declare const jest: any;

export function fn(impl?: (...args: any[]) => any) {
  if (typeof vi !== 'undefined') return vi.fn(impl);
  return jest.fn(impl);
}

export function spyOn(obj: any, method: string) {
  if (typeof vi !== 'undefined') return vi.spyOn(obj, method);
  return jest.spyOn(obj, method);
}
