import os
import logging
from logging.handlers import RotatingFileHandler
import logging
from flask import g
from sqlalchemy import event
from sqlalchemy.orm.attributes import get_history
from app.models.audit_log import AuditLog
from app.database.connection import db


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

def register_audit_listeners():

    def is_audit_model(obj):
        return getattr(obj.__class__, "__tablename__", None) == "audit_logs"

    # ------------------------------------------
    # BEFORE FLUSH  -> UPDATE + DELETE
    # ------------------------------------------
    @event.listens_for(db.session, "before_flush")
    def audit_before_flush(session, flush_context, instances):

        user_id = getattr(g, "current_user_id", 0) or 0

        # UPDATE
        for obj in list(session.dirty):

            if is_audit_model(obj):
                continue

            state = db.inspect(obj)

            if state.transient or state.deleted:
                continue

            for attr in state.attrs:
                hist = get_history(obj, attr.key)

                if not hist.has_changes():
                    continue

                old = hist.deleted[0] if hist.deleted else None
                new = hist.added[0] if hist.added else None

                if old == new:
                    continue

                session.add(
                    AuditLog(
                        table_name=obj.__tablename__,
                        record_id=str(getattr(obj, "id", "")),
                        field=attr.key,
                        old_value=str(old) if old is not None else None,
                        new_value=str(new) if new is not None else None,
                        changed_by=user_id,
                        action="UPDATE",
                    )
                )

        # DELETE
        for obj in list(session.deleted):

            if is_audit_model(obj):
                continue

            session.add(
                AuditLog(
                    table_name=obj.__tablename__,
                    record_id=str(getattr(obj, "id", "")),
                    field="*",
                    old_value="DELETED",
                    new_value=None,
                    changed_by=user_id,
                    action="DELETE",
                )
            )

    # ------------------------------------------
    # AFTER FLUSH → INSERT (agora com ID real)
    # ------------------------------------------
    @event.listens_for(db.session, "after_flush")
    def audit_after_flush(session, flush_context):

        user_id = getattr(g, "current_user_id", 0) or 0

        for obj in list(session.new):

            if is_audit_model(obj):
                continue

            session.add(
                AuditLog(
                    table_name=obj.__tablename__,
                    record_id=str(getattr(obj, "id", "")),
                    field="*",
                    old_value=None,
                    new_value="CREATED",
                    changed_by=user_id,
                    action="INSERT",
                )
            )