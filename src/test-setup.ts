import "@testing-library/jest-dom";

// jsdom ships neither of these, and Radix-based primitives (dropdowns,
// selects, popovers) construct them on mount. Without the stubs any test
// that renders one dies with a ReferenceError before it reaches an
// assertion.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

if (!globalThis.matchMedia) {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof matchMedia;
}
