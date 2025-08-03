// k6 run --console-output=log.txt product.health.js

import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1, // virtual users (= connections)
  duration: '1s',
};

export default function () {
  const res = http.get('http://localhost/health', {
    headers: {
      'host': 'product',
    },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}