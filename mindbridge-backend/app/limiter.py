"""
MindBridge — Rate Limiter Singleton
Defined here (not in main.py) to avoid circular imports:
  main.py imports routes → routes need limiter → limiter must not import main.py
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
