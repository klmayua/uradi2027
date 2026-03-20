"""
Health Check Utilities for URADI-360
Comprehensive system health monitoring
"""

import os
import time
import psutil
import httpx
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy import text
from database import SessionLocal
import redis

# Import service clients
from services.kimi_client import kimi_client


class HealthCheckResult:
    """Health check result data class"""
    def __init__(
        self,
        name: str,
        status: str,  # healthy, degraded, unhealthy
        response_time_ms: float,
        message: str = "",
        details: Dict[str, Any] = None
    ):
        self.name = name
        self.status = status
        self.response_time_ms = response_time_ms
        self.message = message
        self.details = details or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "status": self.status,
            "response_time_ms": round(self.response_time_ms, 2),
            "message": self.message,
            "details": self.details
        }


class HealthChecker:
    """Comprehensive health checker for URADI-360"""

    def __init__(self):
        self.checks: List[HealthCheckResult] = []
        self.start_time = time.time()

    async def run_all_checks(self) -> Dict[str, Any]:
        """Run all health checks and return comprehensive report"""
        self.checks = []

        # Run all checks concurrently
        check_tasks = [
            self.check_database(),
            self.check_redis(),
            self.check_kimi_api(),
            self.check_termii_api(),
            self.check_twilio_api(),
            self.check_disk_space(),
            self.check_memory(),
            self.check_cpu(),
        ]

        results = await asyncio.gather(*check_tasks, return_exceptions=True)

        for result in results:
            if isinstance(result, Exception):
                self.checks.append(HealthCheckResult(
                    name="unknown",
                    status="unhealthy",
                    response_time_ms=0,
                    message=str(result)
                ))
            else:
                self.checks.append(result)

        return self._compile_report()

    def _compile_report(self) -> Dict[str, Any]:
        """Compile health check results into report"""
        statuses = [check.status for check in self.checks]

        if "unhealthy" in statuses:
            overall_status = "unhealthy"
        elif "degraded" in statuses:
            overall_status = "degraded"
        else:
            overall_status = "healthy"

        return {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat(),
            "version": os.getenv("APP_VERSION", "1.0.0"),
            "environment": os.getenv("NODE_ENV", "production"),
            "uptime_seconds": int(time.time() - self.start_time),
            "checks": [check.to_dict() for check in self.checks],
            "summary": {
                "total": len(self.checks),
                "healthy": statuses.count("healthy"),
                "degraded": statuses.count("degraded"),
                "unhealthy": statuses.count("unhealthy")
            }
        }

    async def check_database(self) -> HealthCheckResult:
        """Check PostgreSQL database connectivity"""
        start_time = time.time()
        try:
            db = SessionLocal()
            # Run a simple query
            result = db.execute(text("SELECT 1"))
            result.fetchone()
            db.close()

            response_time = (time.time() - start_time) * 1000

            return HealthCheckResult(
                name="database",
                status="healthy",
                response_time_ms=response_time,
                message="PostgreSQL connection successful",
                details={
                    "type": "postgresql",
                    "pool_size": int(os.getenv("DB_POOL_SIZE", 20))
                }
            )
        except Exception as e:
            return HealthCheckResult(
                name="database",
                status="unhealthy",
                response_time_ms=(time.time() - start_time) * 1000,
                message=f"Database connection failed: {str(e)}"
            )

    async def check_redis(self) -> HealthCheckResult:
        """Check Redis connectivity"""
        start_time = time.time()
        try:
            redis_client = redis.from_url(
                os.getenv("REDIS_URL", "redis://localhost:6379/0"),
                encoding="utf-8",
                decode_responses=True
            )
            # Ping Redis
            redis_client.ping()

            # Get Redis info
            info = redis_client.info()

            response_time = (time.time() - start_time) * 1000

            return HealthCheckResult(
                name="redis",
                status="healthy",
                response_time_ms=response_time,
                message="Redis connection successful",
                details={
                    "version": info.get("redis_version"),
                    "used_memory_human": info.get("used_memory_human"),
                    "connected_clients": info.get("connected_clients"),
                    "uptime_in_seconds": info.get("uptime_in_seconds")
                }
            )
        except Exception as e:
            return HealthCheckResult(
                name="redis",
                status="unhealthy",
                response_time_ms=(time.time() - start_time) * 1000,
                message=f"Redis connection failed: {str(e)}"
            )

    async def check_kimi_api(self) -> HealthCheckResult:
        """Check Kimi API availability"""
        start_time = time.time()
        try:
            is_healthy = await kimi_client.health_check()
            response_time = (time.time() - start_time) * 1000

            if is_healthy:
                return HealthCheckResult(
                    name="kimi_api",
                    status="healthy",
                    response_time_ms=response_time,
                    message="Kimi API is accessible",
                    details=kimi_client.get_usage_stats()
                )
            else:
                return HealthCheckResult(
                    name="kimi_api",
                    status="degraded",
                    response_time_ms=response_time,
                    message="Kimi API health check failed"
                )
        except Exception as e:
            return HealthCheckResult(
                name="kimi_api",
                status="degraded",
                response_time_ms=(time.time() - start_time) * 1000,
                message=f"Kimi API check failed: {str(e)}"
            )

    async def check_termii_api(self) -> HealthCheckResult:
        """Check Termii SMS API availability"""
        start_time = time.time()
        try:
            api_key = os.getenv("TERMII_API_KEY")
            if not api_key or api_key == "YOUR_TERMII_API_KEY_HERE":
                return HealthCheckResult(
                    name="termii_api",
                    status="degraded",
                    response_time_ms=0,
                    message="Termii API key not configured"
                )

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    "https://api.termii.com/api/check",
                    params={"api_key": api_key}
                )

            response_time = (time.time() - start_time) * 1000

            if response.status_code == 200:
                return HealthCheckResult(
                    name="termii_api",
                    status="healthy",
                    response_time_ms=response_time,
                    message="Termii API is accessible"
                )
            else:
                return HealthCheckResult(
                    name="termii_api",
                    status="degraded",
                    response_time_ms=response_time,
                    message=f"Termii API returned status {response.status_code}"
                )
        except Exception as e:
            return HealthCheckResult(
                name="termii_api",
                status="degraded",
                response_time_ms=(time.time() - start_time) * 1000,
                message=f"Termii API check failed: {str(e)}"
            )

    async def check_twilio_api(self) -> HealthCheckResult:
        """Check Twilio WhatsApp API availability"""
        start_time = time.time()
        try:
            account_sid = os.getenv("TWILIO_ACCOUNT_SID")
            auth_token = os.getenv("TWILIO_AUTH_TOKEN")

            if not account_sid or account_sid == "YOUR_TWILIO_ACCOUNT_SID_HERE":
                return HealthCheckResult(
                    name="twilio_api",
                    status="degraded",
                    response_time_ms=0,
                    message="Twilio credentials not configured"
                )

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}.json",
                    auth=(account_sid, auth_token)
                )

            response_time = (time.time() - start_time) * 1000

            if response.status_code == 200:
                return HealthCheckResult(
                    name="twilio_api",
                    status="healthy",
                    response_time_ms=response_time,
                    message="Twilio API is accessible"
                )
            else:
                return HealthCheckResult(
                    name="twilio_api",
                    status="degraded",
                    response_time_ms=response_time,
                    message=f"Twilio API returned status {response.status_code}"
                )
        except Exception as e:
            return HealthCheckResult(
                name="twilio_api",
                status="degraded",
                response_time_ms=(time.time() - start_time) * 1000,
                message=f"Twilio API check failed: {str(e)}"
            )

    async def check_disk_space(self) -> HealthCheckResult:
        """Check disk space usage"""
        start_time = time.time()
        try:
            disk = psutil.disk_usage('/')
            used_percent = (disk.used / disk.total) * 100
            response_time = (time.time() - start_time) * 1000

            if used_percent > 90:
                status = "unhealthy"
                message = f"Critical disk usage: {used_percent:.1f}%"
            elif used_percent > 80:
                status = "degraded"
                message = f"High disk usage: {used_percent:.1f}%"
            else:
                status = "healthy"
                message = f"Disk usage normal: {used_percent:.1f}%"

            return HealthCheckResult(
                name="disk_space",
                status=status,
                response_time_ms=response_time,
                message=message,
                details={
                    "total_gb": round(disk.total / (1024**3), 2),
                    "used_gb": round(disk.used / (1024**3), 2),
                    "free_gb": round(disk.free / (1024**3), 2),
                    "used_percent": round(used_percent, 2)
                }
            )
        except Exception as e:
            return HealthCheckResult(
                name="disk_space",
                status="unhealthy",
                response_time_ms=(time.time() - start_time) * 1000,
                message=f"Disk check failed: {str(e)}"
            )

    async def check_memory(self) -> HealthCheckResult:
        """Check memory usage"""
        start_time = time.time()
        try:
            memory = psutil.virtual_memory()
            response_time = (time.time() - start_time) * 1000

            if memory.percent > 90:
                status = "unhealthy"
                message = f"Critical memory usage: {memory.percent:.1f}%"
            elif memory.percent > 80:
                status = "degraded"
                message = f"High memory usage: {memory.percent:.1f}%"
            else:
                status = "healthy"
                message = f"Memory usage normal: {memory.percent:.1f}%"

            return HealthCheckResult(
                name="memory",
                status=status,
                response_time_ms=response_time,
                message=message,
                details={
                    "total_gb": round(memory.total / (1024**3), 2),
                    "available_gb": round(memory.available / (1024**3), 2),
                    "used_percent": memory.percent
                }
            )
        except Exception as e:
            return HealthCheckResult(
                name="memory",
                status="unhealthy",
                response_time_ms=(time.time() - start_time) * 1000,
                message=f"Memory check failed: {str(e)}"
            )

    async def check_cpu(self) -> HealthCheckResult:
        """Check CPU usage"""
        start_time = time.time()
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            response_time = (time.time() - start_time) * 1000

            if cpu_percent > 90:
                status = "unhealthy"
                message = f"Critical CPU usage: {cpu_percent:.1f}%"
            elif cpu_percent > 70:
                status = "degraded"
                message = f"High CPU usage: {cpu_percent:.1f}%"
            else:
                status = "healthy"
                message = f"CPU usage normal: {cpu_percent:.1f}%"

            return HealthCheckResult(
                name="cpu",
                status=status,
                response_time_ms=response_time,
                message=message,
                details={
                    "usage_percent": cpu_percent,
                    "core_count": psutil.cpu_count(),
                    "load_average": os.getloadavg() if hasattr(os, 'getloadavg') else None
                }
            )
        except Exception as e:
            return HealthCheckResult(
                name="cpu",
                status="unhealthy",
                response_time_ms=(time.time() - start_time) * 1000,
                message=f"CPU check failed: {str(e)}"
            )


# Singleton instance
health_checker = HealthChecker()
