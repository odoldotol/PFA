// k6 run --console-output=log.txt product.health.js

import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
};

export default function () {
  // const res = http.get('http://localhost:7001/health', {
  const res = http.get('https://product.lapiki-invest.com/health', {
    headers: {
      'Content-Type': 'application/json',
      'host': 'product.lapiki-invest.com', //
      'x-maintenance': 'true',
    },
  });

  check(res, {
    'status is 200': (r) => {
      return r.status === 200
    },
  });
}