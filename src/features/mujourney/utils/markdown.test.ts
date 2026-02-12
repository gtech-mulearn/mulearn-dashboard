/**
 * Markdown Utilities Testing
 *
 * 📍 src/features/mujourney/utils/markdown.test.ts
 *
 * Standalone test script runnable with `bun run <file>`
 */

import { decodeUnicodeEscapes } from "./markdown";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.info(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.info("🧪 Running Markdown Utility Tests...");

  try {
    // Test 1: Unicode escapes
    const input1 = "Hello \\u0026 World";
    const expected1 = "Hello & World";
    const result1 = decodeUnicodeEscapes(input1);
    assert(
      result1 === expected1,
      `Should decode unicode escape sequences (Expected: "${expected1}", Got: "${result1}")`,
    );

    // Test 2: Numeric HTML entities
    const input2 = "Hello &#38; World";
    const expected2 = "Hello & World";
    const result2 = decodeUnicodeEscapes(input2);
    assert(
      result2 === expected2,
      `Should decode numeric HTML entities (Expected: "${expected2}", Got: "${result2}")`,
    );

    // Test 3: Hex HTML entities
    const input3 = "Hello &#x26; World";
    const expected3 = "Hello & World";
    const result3 = decodeUnicodeEscapes(input3);
    assert(
      result3 === expected3,
      `Should decode hex HTML entities (Expected: "${expected3}", Got: "${result3}")`,
    );

    // Test 4: Mixed content
    const input4 = "Pixel \\u0026 &#x26; Code";
    const expected4 = "Pixel & & Code";
    const result4 = decodeUnicodeEscapes(input4);
    assert(
      result4 === expected4,
      `Should handle mixed content (Expected: "${expected4}", Got: "${result4}")`,
    );

    console.info("\n✨ All tests passed successfully!");
  } catch (error) {
    console.error("❌ Test script error:", error);
    process.exit(1);
  }
}

runTests();
