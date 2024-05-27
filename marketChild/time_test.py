# 클래스로 구현하고 싶은데 python class 다룰줄 거의 몰라서 일단 아래처럼.

import time

time_test = {}

def start_time_test(test_key: str):
  global time_test
  time_test[test_key] = time.time() * 1000
  print(test_key, "start")

def end_time_test(test_key: str):
  global time_test
  if test_key not in time_test:
    return
  now = time.time() * 1000
  print(test_key, "end", "{} ms".format(now - time_test[test_key]))
  del time_test[test_key]
