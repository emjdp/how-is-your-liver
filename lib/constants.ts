export const DRINKS = {
  soju:      { mlPerUnit: 360, abv: 0.165, unitLabel: "병" },
  sojuGlass: { mlPerUnit:  50, abv: 0.165, unitLabel: "잔" },
  beer:      { mlPerUnit: 500, abv: 0.045, unitLabel: "잔" },
  highball:  { mlPerUnit: 350, abv: 0.070, unitLabel: "잔" },
} as const;

export const ALCOHOL_DENSITY_G_PER_ML = 0.789;

// 시간당 알코올 대사량 (보수적 평균치 — 개인차 큼)
// 일반 성인 약 7~10g/h. 처리 추정 시간 표시는 8g/h 기준 계산 + ±25% 범위를 hint로 제공.
export const METABOLISM_G_PER_HOUR = 8;

export const KCAL_PER_G_ALCOHOL = 7;

export const INPUT_MAX = { soju: 30, sojuGlass: 30, beer: 30, highball: 30 } as const;

export const STORAGE_KEY = "hiyl:v1:records";

// 소주 1병 순수 알코올 g (360 * 0.165 * 0.789)
export const SOJU_G_PER_BOTTLE =
  DRINKS.soju.mlPerUnit * DRINKS.soju.abv * ALCOHOL_DENSITY_G_PER_ML;

// 소주 1잔 순수 알코올 g (50 * 0.165 * 0.789 ≈ 6.51g)
export const SOJU_GLASS_G_PER_UNIT =
  DRINKS.sojuGlass.mlPerUnit * DRINKS.sojuGlass.abv * ALCOHOL_DENSITY_G_PER_ML;

// 맥주 1잔 순수 알코올 g (500 * 0.045 * 0.789 ≈ 17.75g)
export const BEER_G_PER_UNIT =
  DRINKS.beer.mlPerUnit * DRINKS.beer.abv * ALCOHOL_DENSITY_G_PER_ML;

// 하이볼 1잔 순수 알코올 g (350 * 0.07 * 0.789 ≈ 19.33g)
export const HIGHBALL_G_PER_UNIT =
  DRINKS.highball.mlPerUnit * DRINKS.highball.abv * ALCOHOL_DENSITY_G_PER_ML;
