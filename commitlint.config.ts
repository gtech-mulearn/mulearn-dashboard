import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Allow any case — uppercase subjects, sentence case, whatever
    "subject-case": [0],
    // No length limit on subject or body
    "header-max-length": [0],
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
    // Subject just can't be empty
    "subject-empty": [2, "never"],
    // Type still required (feat, fix, chore, etc.) but any case allowed
    "type-empty": [2, "never"],
    "type-case": [0],
  },
};

export default config;
