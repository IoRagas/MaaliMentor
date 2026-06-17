"""
Caching service for Maali Mentor.

Supports Redis caching with a graceful fallback to a local thread-safe
in-memory cache if Redis is not installed, not configured, or offline.
"""

import time
import json
from typing import Any, Optional
from threading import Lock

# Lock for thread-safe in-memory operations
_memory_cache_lock = Lock()
_memory_cache: dict[str, tuple[Any, float]] = {}  # key -> (value, expiry_timestamp)

class InMemoryCache:
    """Thread-safe fallback in-memory cache with TTL support."""
    
    @staticmethod
    def get(key: str) -> Optional[str]:
        with _memory_cache_lock:
            if key not in _memory_cache:
                return None
            val, expiry = _memory_cache[key]
            if expiry and time.time() > expiry:
                del _memory_cache[key]
                return None
            return val

    @staticmethod
    def set(key: str, value: str, expire: Optional[int] = None) -> None:
        with _memory_cache_lock:
            expiry = time.time() + expire if expire else 0
            _memory_cache[key] = (value, expiry)

    @staticmethod
    def delete(key: str) -> None:
        with _memory_cache_lock:
            if key in _memory_cache:
                del _memory_cache[key]

    @staticmethod
    def flush() -> None:
        with _memory_cache_lock:
            _memory_cache.clear()


class RedisCache:
    """Redis cache connector with fallback handling."""
    
    def __init__(self):
        self.client = None
        self.use_fallback = False
        
        try:
            import redis
            # Connect to Redis. Default local URL, can be configured later.
            self.client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
            # Test connection with a ping
            self.client.ping()
            print("[cache] Connected to Redis successfully.")
        except Exception as e:
            print(f"[cache] Redis not available, falling back to InMemoryCache. Error: {e}")
            self.use_fallback = True

    def get(self, key: str) -> Optional[str]:
        if self.use_fallback or not self.client:
            return InMemoryCache.get(key)
        try:
            return self.client.get(key)
        except Exception as e:
            print(f"[cache] Redis GET error for {key}: {e}. Retrying with fallback.")
            return InMemoryCache.get(key)

    def set(self, key: str, value: str, expire: Optional[int] = None) -> None:
        if self.use_fallback or not self.client:
            InMemoryCache.set(key, value, expire)
            return
        try:
            if expire:
                self.client.set(key, value, ex=expire)
            else:
                self.client.set(key, value)
        except Exception as e:
            print(f"[cache] Redis SET error for {key}: {e}. Retrying with fallback.")
            InMemoryCache.set(key, value, expire)

    def delete(self, key: str) -> None:
        if self.use_fallback or not self.client:
            InMemoryCache.delete(key)
            return
        try:
            self.client.delete(key)
        except Exception as e:
            print(f"[cache] Redis DELETE error for {key}: {e}.")
            InMemoryCache.delete(key)

    def flush(self) -> None:
        if self.use_fallback or not self.client:
            InMemoryCache.flush()
            return
        try:
            self.client.flushdb()
        except Exception as e:
            print(f"[cache] Redis FLUSH error: {e}.")
            InMemoryCache.flush()


# Singleton instance
cache = RedisCache()
