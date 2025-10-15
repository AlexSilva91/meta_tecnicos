from app.models.user import User
from app.database import db

class AuthService:
    @staticmethod
    def authenticate(login_hash: str, password: str) -> dict:
        """
        Autentica um usuário com login e senha.
        
        Returns:
            dict: {'success': bool, 'user': User, 'message': str}
        """
        try:
            # Buscar usuário pelo login
            user = User.get_by_login(login_hash)
            
            if not user:
                return {
                    'success': False,
                    'user': None,
                    'message': 'Login ou senha incorretos'
                }
            
            # Verificar senha
            if user.check_password(password):
                return {
                    'success': True,
                    'user': user,
                    'message': 'Login realizado com sucesso'
                }
            else:
                return {
                    'success': False,
                    'user': None,
                    'message': 'Login ou senha incorretos'
                }
                
        except Exception as e:
            return {
                'success': False,
                'user': None,
                'message': f'Erro durante a autenticação: {str(e)}'
            }

    @staticmethod
    def get_user_session_data(user: User) -> dict:
        """Retorna os dados do usuário para a sessão."""
        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'login_hash': user.login_hash
        }