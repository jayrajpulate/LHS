import logging
import os
import sys
from logging.handlers import RotatingFileHandler
from app.core.config import settings

def setup_logging():
    """Sets up a robust logging system with console and rotating file handlers."""
    # Ensure logs directory exists
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    log_file = os.path.join(log_dir, "app.log")
    
    # Define format
    log_format = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    formatter = logging.Formatter(log_format, datefmt=date_format)

    # Core logger
    root_logger = logging.getLogger()
    # Set base level from settings or default to INFO
    log_level = logging.INFO
    if settings.APP_ENV == "development":
        log_level = logging.DEBUG
    root_logger.setLevel(log_level)

    # Clear existing handlers to avoid duplicates during reload
    if root_logger.hasHandlers():
        root_logger.handlers.clear()

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Rotating File Handler
    file_handler = RotatingFileHandler(
        log_file, maxBytes=10*1024*1024, backupCount=5, encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)

    # Silence some noisy third-party loggers
    logging.getLogger("uvicorn").handlers = root_logger.handlers
    logging.getLogger("uvicorn.access").handlers = root_logger.handlers
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("python_multipart").setLevel(logging.INFO)
    logging.getLogger("multipart").setLevel(logging.INFO)

    root_logger.info(f"Logging initialized. Level: {logging.getLevelName(log_level)}")
    root_logger.info(f"Logs are being written to: {os.path.abspath(log_file)}")

# Call setup on import to initialize
setup_logging()
logger = logging.getLogger("app")
