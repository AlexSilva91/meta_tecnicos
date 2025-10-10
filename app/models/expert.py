from app.database import db

class Expert(db.Model):
    __tablename__ = 'experts'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    field = db.Column(db.String(100), nullable=False)
    experience_years = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"<Expert {self.name}>"

    # ---------- CRUD ----------

    @classmethod
    def create(cls, name: str, field: str, experience_years: int):
        """Cria um novo especialista."""
        expert = cls(name=name, field=field, experience_years=experience_years)
        db.session.add(expert)
        db.session.commit()
        return expert

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
