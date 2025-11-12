import 'dotenv/config';

export default ({ config
}) => {
  return {
    ...config,
    extra: {
      MAP_WEBVIEW_URL: process.env.MAP_WEBVIEW_URL,
      BACKEND_IP: process.env.BACKEND_IP,
      BACKEND_PORT: process.env.BACKEND_PORT,
      DEBUG_MODE: process.env.DEBUG_MODE === 'true',
    },
  };
};
