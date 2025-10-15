from datetime import datetime
from flask_login import UserMixin
from app.database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    login_hash = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    def __repr__(self):
        return f'<User {self.first_name} {self.last_name}>'
    
    def generate_unique_login(self):
        """Gera um login único baseado em first_name e last_name."""
        base_login = f"{self.first_name.lower()}.{self.last_name.lower()}"
        login = base_login
        counter = 1
        while User.query.filter_by(login_hash=login).first() is not None:
            login = f"{base_login}{counter}"
            counter += 1
        self.login_hash = login
        return self.login_hash

    # ---------- CRUD ----------

    @classmethod
    def create(cls, first_name, last_name, password):
        """Cria um novo usuário e salva no banco."""
        user = cls(first_name=first_name, last_name=last_name)
        user.generate_unique_login()
        user.password_hash = generate_password_hash(password)
        db.session.add(user)
        db.session.commit()
        return user

    @classmethod
    def get_by_id(cls, user_id):
        """Retorna um usuário pelo ID."""
        return cls.query.get(user_id)

    @classmethod
    def get_by_login(cls, login_hash):
        """Retorna um usuário pelo login."""
        return cls.query.filter_by(login_hash=login_hash).first()

    @classmethod
    def update(cls, user_id, **kwargs):
        """
        Atualiza campos de um usuário.
        Ex: User.update(1, first_name="Novo", password="1234")
        """
        user = cls.query.get(user_id)
        if not user:
            return None
        if "first_name" in kwargs:
            user.first_name = kwargs["first_name"]
        if "last_name" in kwargs:
            user.last_name = kwargs["last_name"]
        if "password" in kwargs:
            user.password_hash = generate_password_hash(kwargs["password"])
        # Re-gerar login se first_name ou last_name mudar
        if "first_name" in kwargs or "last_name" in kwargs:
            user.generate_unique_login()
        db.session.commit()
        return user

    @classmethod
    def delete(cls, user_id):
        """Deleta um usuário pelo ID."""
        user = cls.query.get(user_id)
        if not user:
            return False
        db.session.delete(user)
        db.session.commit()
        return True

    # ---------- Funções auxiliares ----------

    def check_password(self, password):
        """Verifica se a senha está correta."""
        return check_password_hash(self.password_hash, password)
