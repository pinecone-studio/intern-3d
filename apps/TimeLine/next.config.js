//@ts-check

const { composePlugins, withNx } = require('@nx/next');
const webpack = require('webpack');

const nameHelperBanner = `var __name = globalThis.__name || function(target, value) {
  return Object.defineProperty(target, "name", { value: value, configurable: true });
};
globalThis.__name = __name;`;

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins = config.plugins || [];
      config.plugins.push(new webpack.BannerPlugin({ banner: nameHelperBanner, raw: true, test: /\.js$/ }));
    }

    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

const config = composePlugins(...plugins)(nextConfig);

module.exports = async (phase, context) => {
  if (process.env.NODE_ENV === 'development') {
    const { initOpenNextCloudflareForDev } = await import('@opennextjs/cloudflare');
    initOpenNextCloudflareForDev();
  }

  return config(phase, context);
};
