import { afterAll, beforeAll } from "vitest";
import {
  cleanupSecurityFixture,
  createSecurityFixture,
  type SecurityFixture,
} from "./setup";

export function registerSecurityFixture() {
  let fixture: SecurityFixture | undefined;

  beforeAll(async () => {
    fixture = await createSecurityFixture();
  }, 120_000);

  afterAll(async () => {
    if (fixture) {
      await cleanupSecurityFixture(fixture);
    }
  }, 120_000);

  return (): SecurityFixture => {
    if (!fixture) {
      throw new Error("Security fixture has not been initialized.");
    }

    return fixture;
  };
}
