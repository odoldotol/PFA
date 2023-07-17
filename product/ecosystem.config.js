module.exports = {
  apps : [
    {
      name: 'pfa_product_prod',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      listen_timeout: 60000, // 1분
      kill_timeout: 20000, // 20초
      max_restarts: 50,
      restart_delay: 500,
      max_memory_restart: '200M',

      env: {
        PORT: 7001,
        PM2_NAME: 'pfa_product_prod',
      },
    },
    {
      name: 'pfa_product_dev',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: ['dist'],
      listen_timeout: 60000, // 1분
      kill_timeout: 20000, // 20초
      max_restarts: 50,
      restart_delay: 500,
      max_memory_restart: '200M',

      env: {
        PORT: 7001,
        PM2_NAME: 'pfa_product_dev',
      },
    },
  ],
};
