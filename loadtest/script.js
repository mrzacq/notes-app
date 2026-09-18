import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  vus: 5,
  duration: '15s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
};

export default function () {
  const listRes = http.get(`${BASE_URL}/notes`);
  check(listRes, { 'GET /notes returns 200': (r) => r.status === 200 });

  const createRes = http.post(
    `${BASE_URL}/notes`,
    JSON.stringify({ title: 'Smoke test note', content: 'k6 smoke test' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(createRes, { 'POST /notes returns 201': (r) => r.status === 201 });

  sleep(1);
}
