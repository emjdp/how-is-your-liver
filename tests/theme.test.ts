import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getTheme, setTheme, applyTheme, nextTheme } from "@/lib/theme";
import type { ThemeMode } from "@/lib/theme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("theme-light", "theme-dark");
});

afterEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("theme-light", "theme-dark");
});

describe("getTheme", () => {
  it("저장된 값 없으면 system 반환", () => {
    expect(getTheme()).toBe("system");
  });

  it("'dark' 저장 후 dark 반환", () => {
    localStorage.setItem("hiyl:v1:theme", "dark");
    expect(getTheme()).toBe("dark");
  });

  it("'light' 저장 후 light 반환", () => {
    localStorage.setItem("hiyl:v1:theme", "light");
    expect(getTheme()).toBe("light");
  });

  it("잘못된 값 저장 시 system 폴백", () => {
    localStorage.setItem("hiyl:v1:theme", "invalid-value");
    expect(getTheme()).toBe("system");
  });
});

describe("setTheme → localStorage + class", () => {
  it("dark: localStorage에 저장되고 theme-dark 클래스 추가", () => {
    setTheme("dark");
    expect(localStorage.getItem("hiyl:v1:theme")).toBe("dark");
    expect(document.documentElement.classList.contains("theme-dark")).toBe(true);
    expect(document.documentElement.classList.contains("theme-light")).toBe(false);
  });

  it("light: localStorage에 저장되고 theme-light 클래스 추가", () => {
    setTheme("light");
    expect(localStorage.getItem("hiyl:v1:theme")).toBe("light");
    expect(document.documentElement.classList.contains("theme-light")).toBe(true);
    expect(document.documentElement.classList.contains("theme-dark")).toBe(false);
  });

  it("system: localStorage에 저장되고 theme 클래스 모두 제거", () => {
    document.documentElement.classList.add("theme-dark");
    setTheme("system");
    expect(localStorage.getItem("hiyl:v1:theme")).toBe("system");
    expect(document.documentElement.classList.contains("theme-dark")).toBe(false);
    expect(document.documentElement.classList.contains("theme-light")).toBe(false);
  });

  it("dark → light 전환 시 theme-dark 제거 + theme-light 추가", () => {
    setTheme("dark");
    setTheme("light");
    expect(document.documentElement.classList.contains("theme-dark")).toBe(false);
    expect(document.documentElement.classList.contains("theme-light")).toBe(true);
  });
});

describe("applyTheme", () => {
  it("dark: theme-dark 추가, theme-light 없음", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("theme-dark")).toBe(true);
    expect(document.documentElement.classList.contains("theme-light")).toBe(false);
  });

  it("light: theme-light 추가, theme-dark 없음", () => {
    applyTheme("light");
    expect(document.documentElement.classList.contains("theme-light")).toBe(true);
    expect(document.documentElement.classList.contains("theme-dark")).toBe(false);
  });

  it("system: 클래스 모두 제거", () => {
    document.documentElement.classList.add("theme-dark", "theme-light");
    applyTheme("system");
    expect(document.documentElement.classList.contains("theme-dark")).toBe(false);
    expect(document.documentElement.classList.contains("theme-light")).toBe(false);
  });

  it("예외를 throw하지 않음 (SSR 가드 유효)", () => {
    expect(() => applyTheme("dark")).not.toThrow();
    expect(() => applyTheme("light")).not.toThrow();
    expect(() => applyTheme("system")).not.toThrow();
  });
});

describe("nextTheme 순환", () => {
  const cases: [ThemeMode, ThemeMode][] = [
    ["system", "light"],
    ["light", "dark"],
    ["dark", "system"],
  ];

  it.each(cases)("nextTheme('%s') === '%s'", (current, expected) => {
    expect(nextTheme(current)).toBe(expected);
  });
});
