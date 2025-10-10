from app.database import db

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contract_id = db.Column(db.String(50), unique=True, nullable=False)
    internet_package = db.Column(db.String(100), nullable=False)

    # Backref cria a lista de ServiceOrders do cliente
    service_orders = db.relationship('ServiceOrder', backref='customer', lazy=True)

    def __repr__(self):
        return f"<Customer {self.name}>"

   # ---------- CRUD ----------

    @classmethod
    def create(cls, name: str, contract_id: str, internet_package: str):
        """Cria um novo cliente."""
        customer = cls(name=name, contract_id=contract_id, internet_package=internet_package)
        db.session.add(customer)
        db.session.commit()
        return customer

    @classmethod
    def get_by_id(cls, customer_id: int):
        """Busca cliente pelo ID."""
        return cls.query.get(customer_id)

    @classmethod
    def get_by_contract(cls, contract_id: str):
        """Busca cliente pelo contrato."""
        return cls.query.filter_by(contract_id=contract_id).first()

    @classmethod
    def update(cls, customer_id: int, **kwargs):
        """Atualiza dados do cliente."""
        customer = cls.query.get(customer_id)
        if not customer:
            return None
        for key, value in kwargs.items():
            if hasattr(customer, key):
                setattr(customer, key, value)
        db.session.commit()
        return customer

    @classmethod
    def delete(cls, customer_id: int) -> bool:
        """Deleta cliente pelo ID."""
        customer = cls.query.get(customer_id)
        if not customer:
            return False
        db.session.delete(customer)
        db.session.commit()
        return True

    @classmethod
    def list(cls, limit: int = 50, offset: int = 0):
        """Lista clientes com paginação."""
        return cls.query.offset(offset).limit(limit).all()
