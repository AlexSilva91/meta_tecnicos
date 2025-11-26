from datetime import datetime
from ..database.connection import db

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    table_name = db.Column(db.String(100), nullable=False)
    record_id = db.Column(db.String(100), nullable=False)
    field = db.Column(db.String(100), nullable=False)

    old_value = db.Column(db.Text, nullable=True)
    new_value = db.Column(db.Text, nullable=True)

    changed_by = db.Column(db.Integer, nullable=False)  
    changed_at = db.Column(db.DateTime, default=datetime.now)

    action = db.Column(db.String(20), nullable=False)  

    def __repr__(self):
        return f"<AuditLog {self.table_name} {self.record_id} {self.field}>"
