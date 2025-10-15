import sys
import os

# Adiciona o diretório raiz do projeto ao Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.database import db
from app.models.user import User

app = create_app()

with app.app_context():
    # Cria todas as tabelas
    db.create_all()
    print("✅ Tabelas criadas com sucesso!")
    print("📊 Tabelas criadas: users")