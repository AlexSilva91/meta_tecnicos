from app.database import db

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_nome = db.Column(db.String(100), nullable=False)
    plano = db.Column(db.String(100), nullable=False)
    id_contrato = db.Column(db.String(50), unique=True, nullable=False)

    # Backref cria a lista de ServiceOrders do cliente
    service_orders = db.relationship('ServiceOrder', backref='customer', lazy=True)

    def __repr__(self):
        return f"<Customer {self.cliente_nome}>"

    # ---------- CRUD ----------

    @classmethod
    def create(cls, cliente_nome: str, plano: str, id_contrato: str):
        """Cria um novo cliente."""
        customer = cls(cliente_nome=cliente_nome, plano=plano, id_contrato=id_contrato)
        db.session.add(customer)
        db.session.commit()
        return customer

    @classmethod
    def get_by_id(cls, customer_id: int):
        """Busca cliente pelo ID."""
        return cls.query.get(customer_id)

    @classmethod
    def get_by_contract(cls, id_contrato: str):
        """Busca cliente pelo contrato."""
        return cls.query.filter_by(id_contrato=id_contrato).first()

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