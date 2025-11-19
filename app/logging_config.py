import os
import logging
from logging.handlers import RotatingFileHandler

def setup_logging(app):
    log_dir = os.path.join(app.root_path, "logs")
    os.makedirs(log_dir, exist_ok=True)

    log_file = os.path.join(log_dir, "app.log")

    log_format = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    formatter = logging.Formatter(log_format)

    # =====================================================
    # FILE HANDLER — grava sempre
    # =====================================================
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=5_000_000,
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)

    # =====================================================
    # CONSOLE HANDLER — respeita nível INFO também
    # =====================================================
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.INFO)

    # =====================================================
    # ROOT LOGGER
    # =====================================================
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers = []
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    # =====================================================
    # WERKZEUG LOGGER
    # =====================================================
    werk_logger = logging.getLogger("werkzeug")
    werk_logger.propagate = True
    werk_logger.setLevel(logging.INFO)

    root_logger.info("Logging iniciado com sucesso.")
