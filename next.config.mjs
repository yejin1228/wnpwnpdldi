/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 시연 화면 왼쪽 아래에 뜨는 Next.js 개발 표시(N)를 끈다.
  devIndicators: false,
}

export default nextConfig
