module.exports = {
  apps : [
    {
      name: 'pfa_product_prod',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      // watch: ['dist'], // restart 하는것때문에 버림
      // wait_ready: true, // 필요없음
      listen_timeout: 60000, // 1분
      kill_timeout: 20000, // 20초
      max_restarts: 50,
      restart_delay: 500,
      max_memory_restart: '200M',

      env: {
        NODE_ENV: 'production',
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
      // wait_ready: true, // 필요없음
      listen_timeout: 60000, // 1분
      kill_timeout: 20000, // 20초
      max_restarts: 50,
      restart_delay: 500,
      max_memory_restart: '200M',

      env: {
        NODE_ENV: 'development',
        PORT: 7001,
        PM2_NAME: 'pfa_product_dev',
      },
    },
  ],

  // deploy : {
  //   production : {
  //     user : 'SSH_USERNAME',
  //     host : 'SSH_HOSTMACHINE',
  //     ref  : 'origin/master',
  //     repo : 'GIT_REPOSITORY',
  //     path : 'DESTINATION_PATH',
  //     'pre-deploy-local': '',
  //     'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
  //     'pre-setup': ''
  //   }
  // }
};
