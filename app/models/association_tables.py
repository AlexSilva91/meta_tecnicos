from app.database import db

service_order_assistants = db.Table('service_order_assistants',
    db.Column('service_order_id', db.Integer, db.ForeignKey('service_orders.id'), primary_key=True),
    db.Column('expert_id', db.Integer, db.ForeignKey('experts.id'), primary_key=True)
)