export type ThemeMode = "system" | "light" | "dark"

const THEME_KEY = "hiyl:v1:theme"
const CYCLE: ThemeMode[] = ["system", "light", "dark"]

export function getTheme(): ThemeMode {
  if (typeof window === "undefined") return "system"
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === "light" || stored === "dark") return stored
  } catch {
    // localStorage 접근 불가 (개인정보 보호 모드 등)
  }
  return "system"
}

export function setTheme(mode: ThemeMode): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(THEME_KEY, mode)
  } catch {
    // 저장 실패 시 클래스 적용만 시도
  }
  applyTheme(mode)
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof window === "undefined") return
  const root = document.documentElement
  root.classList.remove("theme-light", "theme-dark")
  if (mode === "light") root.classList.add("theme-light")
  else if (mode === "dark") root.classList.add("theme-dark")
  // system: 클래스 없음 → @media (prefers-color-scheme) 에 위임
}

export function nextTheme(current: ThemeMode): ThemeMode {
  const idx = CYCLE.indexOf(current)
  return CYCLE[(idx + 1) % CYCLE.length]
}
