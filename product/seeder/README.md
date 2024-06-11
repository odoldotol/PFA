## kakaoChatbot Api Benchmark Dev

- Market Seed "simple_dev_20240513" 와 호환

```sh
# ticker 배열 필요. admin 통해서 가져옴
$ data/tickers/kakao-chatbot_api_benchmark_dev.json
```

- 다양한 구독을 랜덤하게 가지는 각 Users 와 Asset_subscriptions 생성.


#### 실행 결과 예시
```
***@***-MacBook-Pro product % npm run seeder:kakaoChatbotApiBenchmark:dev 100000

> product@0.0.1 seeder:kakaoChatbotApiBenchmark:dev
> ts-node -r tsconfig-paths/register seeder/kakaoChatbotApiBenchmark/dev.ts 100000

[kakaoChatbotApiBenchmark-dev] 시작할 users_id_seq: 200226
[getSeedUsersQuery] insert 할 users 레코드 갯수:  100000
[getSubscriptionsArr]: 구독 분포
  0: 66154, P(%): 66.154,
  1~4: 80835, avg: 20208.75, P(%): 20.208750000000002,
  5~14: 104342, avg: 10434.2, P(%): 10.4342,
  15~34: 125291, avg: 6264.55, P(%): 6.264550000000001,
  35~74: 152713, avg: 3817.825, P(%): 3.8178249999999996,
  75~149: 167666, avg: 2235.5466666666666, P(%): 2.2355466666666666,
  150~299: 166950, avg: 1113, P(%): 1.113,
  300~599: 119904, avg: 399.68, P(%): 0.39968,
  600~1199: 45942, avg: 76.57, P(%): 0.07656999999999999,
  1200~2399: 5649, avg: 4.7075, P(%): 0.0047075,
  2400~3915: 89, avg: 0.05870712401055409, P(%): 0.000058707124010554096
[getSeedAssetSubscriptionsQuery] tickers file name:  kakao-chatbot_api_benchmark_dev.json
[getSeedAssetSubscriptionsQuery] tickers file ticker 갯수:  3911
[getSeedAssetSubscriptionsQuery] insert 할 asset_subscriptions 레코드 갯수:  1035535
[seeder] - 08/06/2024, 18:46:23 | Empty tables(users, asset_subscriptions) 실행중...
[seeder] - 08/06/2024, 18:46:23 | Empty tables(users, asset_subscriptions) 완료!!
[seeder] - 08/06/2024, 18:46:23 | Seed users 실행중...
[seeder] - 08/06/2024, 18:46:26 | Seed users 완료!!
[seeder] - 08/06/2024, 18:46:26 | Seed asset_subscriptions 실행중...
[seeder] - 08/06/2024, 18:47:45 | Seed asset_subscriptions 완료!!
[seeder] - 08/06/2024, 18:47:45 | Completed
```
