from app.database import db
from app.models.association_tables import service_order_assistants

class Expert(db.Model):
    __tablename__ = 'experts'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)

    # Relação com ServiceOrders onde é técnico responsável
    responsible_orders = db.relationship('ServiceOrder', foreign_keys='ServiceOrder.os_tecnico_responsavel', backref='tecnico_responsavel', lazy=True)
    
    # Relação com ServiceOrders onde é auxiliar
    assistant_orders = db.relationship('ServiceOrder', secondary=service_order_assistants, backref=db.backref('os_tecnicos_auxiliares', lazy=True))

    def __repr__(self):
        return f"<Expert {self.nome}>"

    # ---------- CRUD ----------

    @classmethod
    def create(cls, nome: str):
        """Cria um novo especialista."""
        expert = cls(nome=nome)
        db.session.add(expert)
        db.session.commit()
        return expert

    @classmethod
    def get_by_name(cls, nome):
        return cls.query.filter_by(nome=nome).first()
    
    @classmethod
    def get_by_id(cls, expert_id: int):
        """Retorna um especialista pelo ID."""
        return cls.query.get(expert_id)

    @classmethod
    def update(cls, expert_id: int, **kwargs):
        """Atualiza os dados de um especialista."""
        expert = cls.query.get(expert_id)
        if not expert:
            return None
        for key, value in kwargs.items():
            if hasattr(expert, key):
                setattr(expert, key, value)
        db.session.commit()
        return expert

    @classmethod
    def delete(cls, expert_id: int) -> bool:
        """Deleta um especialista pelo ID."""
        expert = cls.query.get(expert_id)
        if not expert:
            return False
        db.session.delete(expert)
        db.session.commit()
        return True

    @classmethod
    def list(cls, limit: int = 50, offset: int = 0):
        """Lista especialistas com paginação."""
        return cls.query.offset(offset).limit(limit).all()
