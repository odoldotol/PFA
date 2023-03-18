module.exports = {
  apps : [
    {
      name: 'pfa_product',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      // wait_ready: true, // 필요없음
      listen_timeout: 60000, // 1분
      kill_timeout: 20000, // 20초
      max_restarts: 50,
      restart_delay: 500,
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
