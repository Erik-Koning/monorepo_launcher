// load-test.js
import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  vus: 8, // concurrent users
  duration: "10s", // Run for 30 seconds
  thresholds: {
    http_req_duration: ["p(95)<900"], // 95% of requests < 500ms
    http_req_failed: ["rate<0.01"], // Error rate < 1%
    checks: ["rate>0.99"], // 99% of checks should pass
  },
};
export default function () {
  const url = "";
  const payload = JSON.stringify({
    // Your POST request payload here, if applicable
    userId: "680b9d3e6b4f855278db4c27",
    secret: __ENV.TEST_API_UPDATE_USER_SECRET,
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
      // Add authentication headers if needed
    },
  };

  // Send HTTP request
  const res = http.post(url, payload, params);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 900ms": (r) => r.timings.duration < 900,
  });

  sleep(0.5); // Small delay for realistic pacing
}

//With Prisma Accelerate
/*
  scenarios: (100.00%) 1 scenario, 8 max VUs, 40s max duration (incl. graceful stop):
              * default: 8 looping VUs for 10s (gracefulStop: 30s)



  █ THRESHOLDS

    checks
    ✗ 'rate>0.99' rate=86.44%

    http_req_duration
    ✓ 'p(95)<900' p(95)=334.16ms

    http_req_failed
    ✗ 'rate<0.01' rate=13.55%


  █ TOTAL RESULTS

    checks_total.......................: 214    19.904753/s
    checks_succeeded...................: 86.44% 185 out of 214
    checks_failed......................: 13.55% 29 out of 214

    ✗ status is 200
      ↳  72% — ✓ 78 / ✗ 29
    ✓ response time < 900ms

    HTTP
    http_req_duration.......................................................: avg=129.69ms min=24.2ms   med=96.81ms  max=520.78ms p(90)=265.37ms p(95)=334.16ms
      { expected_response:true }............................................: avg=115.36ms min=24.2ms   med=52.95ms  max=520.78ms p(90)=229.19ms p(95)=325.33ms
    http_req_failed.........................................................: 13.55% 29 out of 214
    http_reqs...............................................................: 214    19.904753/s

    EXECUTION
    iteration_duration......................................................: avg=769.96ms min=649.88ms med=742.62ms max=1.04s    p(90)=910.54ms p(95)=979.85ms
    iterations..............................................................: 107    9.952376/s
    vus.....................................................................: 8      min=8         max=8
    vus_max.................................................................: 8      min=8         max=8

    NETWORK
    data_received...........................................................: 171 kB 16 kB/s
    data_sent...............................................................: 41 kB  3.8 kB/s




running (10.8s), 0/8 VUs, 107 complete and 0 interrupted iterations
default ✓ [======================================] 8 VUs  10s
ERRO[0010] thresholds on metrics 'checks, http_req_failed' have been crossed
*/
