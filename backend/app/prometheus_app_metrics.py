"""
Application-level Prometheus metrics (GitFlic-style app_* names).
"""
import os
import threading
import time

from prometheus_client import Counter, Gauge

SLO_MS = float(os.getenv("APP_RESPONSE_TIME_SLO_MS", "1000"))

APP_REQUESTS_TOTAL = Counter(
    "app_requests_total",
    "Total number of HTTP requests",
)

APP_REQUEST_ERRORS_TOTAL = Counter(
    "app_request_errors_total",
    "Number of 5xx error responses",
)

APP_RESPONSE_TIME_AVG_MS = Gauge(
    "app_response_time_avg_ms",
    "Average response time in milliseconds",
)

APP_RESPONSE_TIME_MAX_MS = Gauge(
    "app_response_time_max_ms",
    "Maximum response time in milliseconds since process start",
)

APP_RPS_CURRENT = Gauge(
    "app_rps_current",
    "Number of requests in the current calendar second",
)

APP_RPS_AVG = Gauge(
    "app_rps_avg",
    "Average number of requests per second since process start",
)

APP_RPS_PEAK = Gauge(
    "app_rps_peak",
    "Peak number of requests per second (max over completed seconds)",
)

APP_RESPONSE_TIME_SLO_MS = Gauge(
    "app_response_time_slo_ms",
    "Target response time threshold (SLO) in milliseconds",
)

APP_RESPONSE_TIME_SLO_MS.set(SLO_MS)

_start_time = time.time()
_sum_duration_ms = 0.0
_count_requests = 0
_max_duration_ms = 0.0
_current_second = int(time.time())
_current_second_count = 0
_peak_rps = 0
_lock = threading.Lock()


def record_http_request(status_code: int, duration_ms: float) -> None:
    global _sum_duration_ms, _count_requests, _max_duration_ms
    global _current_second, _current_second_count, _peak_rps

    with _lock:
        APP_REQUESTS_TOTAL.inc()
        if status_code >= 500:
            APP_REQUEST_ERRORS_TOTAL.inc()

        _sum_duration_ms += duration_ms
        _count_requests += 1
        APP_RESPONSE_TIME_AVG_MS.set(_sum_duration_ms / _count_requests)

        if duration_ms > _max_duration_ms:
            _max_duration_ms = duration_ms
        APP_RESPONSE_TIME_MAX_MS.set(_max_duration_ms)

        now_sec = int(time.time())
        if now_sec != _current_second:
            if _current_second_count > _peak_rps:
                _peak_rps = _current_second_count
                APP_RPS_PEAK.set(_peak_rps)
            _current_second = now_sec
            _current_second_count = 1
        else:
            _current_second_count += 1
        APP_RPS_CURRENT.set(_current_second_count)

        uptime = time.time() - _start_time
        APP_RPS_AVG.set(_count_requests / uptime if uptime > 0 else 0.0)


def should_skip_metrics_path(path: str) -> bool:
    if path == "/metrics":
        return True
    if path.startswith("/docs") or path == "/openapi.json" or path == "/redoc":
        return True
    return False
