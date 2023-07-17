module.exports = {
  apps : [
    {
      name: 'pfa_market_prod',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      listen_timeout: 600000, // 10분
      kill_timeout: 60000, // 1분
      max_restarts: 50,
      restart_delay: 500,
      max_memory_restart: '300M',

      env: {
        NODE_ENV: 'production',
        PORT: 6001,
        PM2_NAME: 'pfa_market_prod',
      },
    },
    {
      name: 'pfa_market_dev',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: ['dist'],
      listen_timeout: 600000, // 10분
      kill_timeout: 60000, // 1분
      max_restarts: 50,
      restart_delay: 500,
      max_memory_restart: '300M',

      env: {
        NODE_ENV: 'development',
        PORT: 6001,
        PM2_NAME: 'pfa_market_dev',
      },
    },
  ],
};
