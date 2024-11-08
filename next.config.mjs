/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { dev, isServer }) => {
      if (!dev && !isServer) {
        config.cache = false;
      }
      return config;
    },
  };
  
  export default nextConfig;
  