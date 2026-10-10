/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Required: both component suites ship untranspiled ESM that Next has to
  // compile itself, otherwise the server build throws on `import` syntax.
  transpilePackages: [
    'devextreme',
    'devextreme-react',
    '@progress/kendo-react-animation',
    '@progress/kendo-react-buttons',
    '@progress/kendo-react-common',
    '@progress/kendo-react-data-tools',
    '@progress/kendo-react-dateinputs',
    '@progress/kendo-react-dialogs',
    '@progress/kendo-react-dropdowns',
    '@progress/kendo-react-form',
    '@progress/kendo-react-grid',
    '@progress/kendo-react-indicators',
    '@progress/kendo-react-inputs',
    '@progress/kendo-react-intl',
    '@progress/kendo-react-labels',
    '@progress/kendo-react-layout',
    '@progress/kendo-react-notification',
    '@progress/kendo-react-progressbars',
    '@progress/kendo-react-scheduler',
    '@progress/kendo-react-tooltip'
  ],

  // Produces .next/standalone so the Docker image can be a thin runtime layer
  output: 'standalone',

  env: {
    API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:5145'
  }
};

export default nextConfig;
