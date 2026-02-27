const target = "https://suris.api.sentryapp.io";

const defaultProxyOptions = {
  target,
  changeOrigin: true,
  secure: true,
};

const endpoints = {
  "^/api": defaultProxyOptions,
};

export { endpoints };
