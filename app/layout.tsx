import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MotionProvider } from "@/components/ui/MotionProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter-var",
  subsets: ["latin"],
  display: "swap",
});

function getMetadataBase(): URL {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (!configuredUrl) return new URL("http://localhost:3000");

  return new URL(
    configuredUrl.startsWith("http")
      ? configuredUrl
      : `https://${configuredUrl}`
  );
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "당신의 간은 안녕하십니까?",
  description:
    "소주·맥주 음주량을 10초만에 기록하고, 오늘의 간 상태를 확인하세요.",
  keywords: ["음주", "간", "건강", "소주", "맥주", "음주량"],
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "당신의 간은 안녕하십니까?",
    description:
      "소주·맥주 음주량을 10초만에 기록하고, 오늘의 간 상태를 확인하세요.",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f3d2e",
};

// 새로고침 시 테마 깜빡임 방지 — 하이드레이션 전에 localStorage를 읽어 클래스를 적용한다.
// html 요소의 class는 이 스크립트가 먼저 변경하므로 suppressHydrationWarning 필요.
const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem('hiyl:v1:theme');if(m==='dark')document.documentElement.classList.add('theme-dark');else if(m==='light')document.documentElement.classList.add('theme-light');}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* 테마 초기화: 하이드레이션 전 실행 → 깜빡임 방지 */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* Pretendard Variable — 한글 웹폰트 CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
