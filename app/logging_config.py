import os
import logging
from logging.handlers import RotatingFileHandler

class PrettyColorFormatter(logging.Formatter):
    COLORS = {
        "INFO":    ("\033[38;5;39m",  "ℹ"),   # Azul
        "WARNING": ("\033[38;5;214m", "⚠"),   # Laranja
        "ERROR":   ("\033[38;5;196m", "✖"),   # Vermelho
        "SUCCESS": ("\033[38;5;46m",  "✔"),   # Verde
    }

    RESET = "\033[0m"
    BOLD = "\033[1m"

    def format(self, record):
        color, icon = self.COLORS.get(record.levelname, ("\033[0m", "•"))
        timestamp = self.formatTime(record, "%Y-%m-%d %H:%M:%S")

        return (
            f"{self.BOLD}{color}{icon}  {record.levelname:<7}{self.RESET} "
            f"{timestamp} "
            f"{self.BOLD}{record.name}{self.RESET} → "
            f"{color}{record.getMessage()}{self.RESET}"
        )

logging.SUCCESS = 25
logging.addLevelName(logging.SUCCESS, "SUCCESS")

def success(self, msg, *args, **kwargs):
    if self.isEnabledFor(logging.SUCCESS):
        self._log(logging.SUCCESS, msg, args, **kwargs)

logging.Logger.success = success


def setup_logging(app):
    log_dir = os.path.join(app.root_path, "logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "app.log")

    file_format = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"

    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=5_000_000,
        backupCount=5
    )
    file_handler.setFormatter(logging.Formatter(file_format))
    file_handler.setLevel(logging.INFO)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(PrettyColorFormatter())
    console_handler.setLevel(logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers = []
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    werk = logging.getLogger("werkzeug")
    werk.setLevel(logging.INFO)
    werk.propagate = True

    root_logger.success("Logging iniciado com sucesso.")
