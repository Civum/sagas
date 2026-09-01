/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // Workspace packages ship TypeScript source, not build output.
  transpilePackages: ['@sagas/contracts', '@sagas/fixtures', '@sagas/read-model'],
};
