import sys
import os
# Adiciona o diretório raiz do projeto ao caminho do Python
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.database import db
from app.models.user import User  # ajuste se o caminho for diferente
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
