from app.database import db
from datetime import datetime

class ServiceOrder(db.Model):
    __tablename__ = 'service_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    appointment_date = db.Column(db.DateTime, nullable=False)
    completion_date = db.Column(db.DateTime, nullable=True)
    reported_problem = db.Column(db.String(200), nullable=False)
    service_provided = db.Column(db.String(100), nullable=False)
    id_OS = db.Column(db.String(50), unique=True, nullable=False)
    
    # Foreign key para Expert
    expert_id = db.Column(db.Integer, db.ForeignKey('experts.id'), nullable=False)
    
    # Foreign key para TypeService
    type_service_id = db.Column(db.Integer, db.ForeignKey('type_services.id'), nullable=False)
    
    # Foreign key para Customer
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    
    # Relações backref
    expert = db.relationship('Expert', backref='service_orders')

    def __repr__(self):
        return (f"ServiceOrder({self.type_service.name} for Customer {self.customer.name} "
                f"by Expert {self.expert.name} on {self.appointment_date})")

    # ---------- CRUD ----------

    @classmethod
    def create(cls, appointment_date: datetime, reported_problem: str, service_provided: str,
               id_OS: str, expert_id: int, type_service_id: int, customer_id: int,
               completion_date: datetime = None):
        """Cria uma nova ServiceOrder."""
        order = cls(
            appointment_date=appointment_date,
            completion_date=completion_date,
            reported_problem=reported_problem,
            service_provided=service_provided,
            id_OS=id_OS,
            expert_id=expert_id,
            type_service_id=type_service_id,
            customer_id=customer_id
        )
        db.session.add(order)
        db.session.commit()
        return order

    @classmethod
    def get_by_id(cls, order_id: int):
        """Busca ServiceOrder pelo ID."""
        return cls.query.get(order_id)

    @classmethod
    def update(cls, order_id: int, **kwargs):
        """
        Atualiza uma ServiceOrder.
        Ex: ServiceOrder.update(1, reported_problem="Novo problema", completion_date=datetime.now())
        """
        order = cls.query.get(order_id)
        if not order:
            return None
        for key, value in kwargs.items():
            if hasattr(order, key):
                setattr(order, key, value)
        db.session.commit()
        return order

    @classmethod
    def delete(cls, order_id: int) -> bool:
        """Deleta uma ServiceOrder pelo ID."""
        order = cls.query.get(order_id)
        if not order:
            return False
        db.session.delete(order)
        db.session.commit()
        return True

    @classmethod
    def list(cls, limit: int = 50, offset: int = 0):
        """Lista ServiceOrders com paginação."""
        return cls.query.offset(offset).limit(limit).all()
