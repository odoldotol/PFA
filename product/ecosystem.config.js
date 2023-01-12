// pm2 (5.2.2 lts)
module.exports = {
  apps : [
    {
      name: 'pfa_product',
      script: 'dist/main.js',
      instances: 1, // 배포서버는 어차피 1코어. market 을 차일드로 돌리는 경우 멀티프로세스 불가능 주의
      exec_mode: 'cluster',
      watch: '.',
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
