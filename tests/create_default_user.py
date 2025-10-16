from app import create_app
from app.database import db
from app.models.user import User  # ajuste o caminho conforme sua estrutura
from werkzeug.security import generate_password_hash

# --- CONFIGURAÇÃO FLASK ---
app = create_app()

# --- USUÁRIO PADRÃO ---
DEFAULT_USER = {
    "first_name": "Admin",
    "last_name": "Master",
    "password": "admin123"  # altere conforme necessário
}

# --- CRIAÇÃO ---
with app.app_context():
    existing = User.query.filter_by(first_name=DEFAULT_USER["first_name"], last_name=DEFAULT_USER["last_name"]).first()
    if existing:
        print(f"Usuário '{existing.login_hash}' já existe.")
    else:
        user = User.create(
            first_name=DEFAULT_USER["first_name"],
            last_name=DEFAULT_USER["last_name"],
            password=DEFAULT_USER["password"]
        )
        print(f"Usuário padrão criado com sucesso!\nLogin: {user.login_hash}\nSenha: {DEFAULT_USER['password']}")
