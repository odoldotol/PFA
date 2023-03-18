// pm2 (5.2.2 lts)
module.exports = {
  apps : [
    {
      name: 'pfa_product',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      wait_ready: true,
      listen_timeout: 600000, // 10분
      kill_timeout: 20000, // 20초
      max_restarts: 50,
      restart_delay: 500,
    },
    // {
    //   script: './service-worker/',
    //   watch: ['./service-worker']
    // }
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
