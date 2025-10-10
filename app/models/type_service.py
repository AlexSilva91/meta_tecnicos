from app.database import db

class TypeService(db.Model):
    __tablename__ = 'type_services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)

    # Backref cria a lista de ServiceOrders
    service_orders = db.relationship('ServiceOrder', backref='type_service', lazy=True)

    def __repr__(self):
        return f"<TypeService {self.name}>"

    # ---------- CRUD ----------

    @classmethod
    def create(cls, name: str, description: str = None):
        """Cria um novo tipo de serviço."""
        type_service = cls(name=name, description=description)
        db.session.add(type_service)
        db.session.commit()
        return type_service

    @classmethod
    def get_by_id(cls, type_service_id: int):
        """Busca um tipo de serviço pelo ID."""
        return cls.query.get(type_service_id)

    @classmethod
    def update(cls, type_service_id: int, **kwargs):
        """
        Atualiza um tipo de serviço.
        Ex: TypeService.update(1, name="Novo Nome", description="Nova descrição")
        """
        type_service = cls.query.get(type_service_id)
        if not type_service:
            return None
        if "name" in kwargs:
            type_service.name = kwargs["name"]
        if "description" in kwargs:
            type_service.description = kwargs["description"]
        db.session.commit()
        return type_service

    @classmethod
    def delete(cls, type_service_id: int) -> bool:
        """Deleta um tipo de serviço pelo ID."""
        type_service = cls.query.get(type_service_id)
        if not type_service:
            return False
        db.session.delete(type_service)
        db.session.commit()
        return True

    @classmethod
    def list(cls, limit: int = 50, offset: int = 0):
        """Lista tipos de serviço com paginação."""
        return cls.query.offset(offset).limit(limit).all()
