# Market

Market Updater 에서 일으키는 요청을 감당하고 최적화하는 설정값.

자세한 내용은 최적화 관련 문서 참고.

### PRICE_REQUEST_STRATEGY
- multi (default)
- single

### CHILD_API_TIMEOUT
- 하나의 요청에 들어오는 자산의 수에 따라 길어지는 레이턴시를 고려

### CHILD_WORKERS
- 

## Child 의 Concurrency 와 ThreadPoolWorkers

Market Updater 에서 일으키는 요청을 감당하고 최적화하는 것에 집중

### CHILD_CONCURRENCY
- PRICE_REQUEST_STRATEGY = single 인 경우
  - CONCURRENCY 가 곧 한번에 받을 요청수 = 한번에 처리할 자산의 수.

- PRICE_REQUEST_STRATEGY = multi 인 경우에는 업데이트 최적화와는 거의 상관이 없음

### CHILD_THREADPOOL_WORKERS
- PRICE_REQUEST_STRATEGY = single 인 경우
  - CONCURRENCY 보다 작은 값을 설정하면 강제로 CONCURRENCY 와 같게 설정됨

- PRICE_REQUEST_STRATEGY = multi 인 경우
  - CHILD_THREADPOOL_WORKERS 가 곧 한번에 처리할 자산의 수.
