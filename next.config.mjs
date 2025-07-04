/** @type {import('next').NextConfig} */
const nextConfig = {
  // fixes wallet connect dependency issue https://docs.walletconnect.com/web3modal/nextjs/about#extra-configuration
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    domains: [
      "cryptologos.cc",
      "framerusercontent.com",
      "assets.coingecko.com",
      "coin-images.coingecko.com",
      "assets.coingecko.com",
    ],
  },
};

export default nextConfig;
