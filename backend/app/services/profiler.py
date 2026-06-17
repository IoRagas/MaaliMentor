"""
Console Profiler Service.
Provides a context manager for timing pipeline components and printing clean, formatted latency metrics to the console.
"""

import time
from contextlib import contextmanager
from typing import Optional

class ConsoleProfiler:
    """
    A context manager and decorator to profile blocks of code in the tutor pipeline.
    Logs execution start, end status, and duration with visual color-coded levels.
    """
    def __init__(self, name: str, category: str = "tutor"):
        self.name = name
        self.category = category.upper()
        self.start_time: Optional[float] = None

    def __enter__(self):
        self.start_time = time.perf_counter()
        # Display initialization of profiling segment
        print(f"\033[94m[{self.category} - START]\033[0m {self.name}...")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time is None:
            return
        duration = time.perf_counter() - self.start_time
        status = "SUCCESS" if exc_type is None else "FAILED"
        
        # Color schemes: green for fast/success, yellow for medium, red for slow/error
        reset = "\033[0m"
        bold = "\033[1m"
        green = "\033[92m"
        red = "\033[91m"
        yellow = "\033[93m"
        
        status_color = green if status == "SUCCESS" else red
        
        # Determine duration alert colors
        if duration < 0.1:      # Fast (< 100ms)
            time_color = green
            time_str = f"{duration * 1000:.2f}ms"
        elif duration < 1.0:    # Medium (100ms - 1000ms)
            time_color = yellow
            time_str = f"{duration * 1000:.1f}ms"
        else:                   # Slow (>= 1.0s)
            time_color = red
            time_str = f"{duration:.3f}s"
            
        print(
            f"\033[94m[{self.category} - END]\033[0m {self.name} | "
            f"Status: {status_color}{bold}{status}{reset} | "
            f"Duration: {time_color}{bold}{time_str}{reset}"
        )
