cd market
npm run build:prod
wait
cd ../product
npm run build:prod
wait
pm2 logs --lines 200
