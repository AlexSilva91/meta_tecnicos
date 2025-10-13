from app.database import db

class TypeService(db.Model):
    __tablename__ = 'type_services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"<TypeService {self.name}>"

    # ---------- CRUD ----------

    @classmethod
    def create(cls, name: str):
        """Cria um novo tipo de serviço."""
        type_service = cls(name=name)
        db.session.add(type_service)
        db.session.commit()
        return type_service

    @classmethod
    def get_by_id(cls, type_service_id: int):
        """Busca um tipo de serviço pelo ID."""
        return cls.query.get(type_service_id)

    @classmethod
    def get_by_name(cls, name: str):
        """Busca um tipo de serviço pelo nome."""
        return cls.query.filter_by(name=name).first()

    @classmethod
    def update(cls, type_service_id: int, **kwargs):
        """Atualiza um tipo de serviço."""
        type_service = cls.query.get(type_service_id)
        if not type_service:
            return None
        for key, value in kwargs.items():
            if hasattr(type_service, key):
                setattr(type_service, key, value)
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