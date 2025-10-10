from app.models.user import User
from app.database import db

class UserService:
    @staticmethod
    def create_user(first_name: str, last_name: str, password: str) -> User:
        """Cria um novo usuário."""
        return User.create(first_name, last_name, password)

    @staticmethod
    def get_user_by_id(user_id: int) -> User | None:
        """Retorna um usuário pelo ID."""
        return User.get_by_id(user_id)

    @staticmethod
    def get_user_by_login(login_hash: str) -> User | None:
        """Retorna um usuário pelo login."""
        return User.get_by_login(login_hash)

    @staticmethod
    def update_user(user_id: int, **kwargs) -> User | None:
        """Atualiza um usuário."""
        return User.update(user_id, **kwargs)

    @staticmethod
    def delete_user(user_id: int) -> bool:
        """Deleta um usuário pelo ID."""
        return User.delete(user_id)

    @staticmethod
    def check_password(user: User, password: str) -> bool:
        """Verifica se a senha fornecida está correta."""
        if not user:
            return False
        return user.check_password(password)

    @staticmethod
    def list_users(limit: int = 50, offset: int = 0):
        """Lista todos os usuários com paginação."""
        return User.query.offset(offset).limit(limit).all()
