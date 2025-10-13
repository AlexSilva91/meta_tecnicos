from flask import Flask
from .database import db
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

# Carrega variáveis do .env
load_dotenv()

def create_app(config_object=None):
    app = Flask(__name__,
                static_folder='static',
                template_folder='templates')

    # Configurações do banco
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'meta_tecnicos')

    # Monta a URI do PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

    # Garante que o schema public será usado
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "connect_args": {"options": "-c search_path=public"}
    }

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'uma_chave_secreta_aqui')
    app.config['DEBUG'] = os.getenv('DEBUG', 'False') == 'True'

    # Inicializa o SQLAlchemy
    db.init_app(app)

    # Inicializa o Flask-Migrate
    Migrate(app, db)

    # Importa e registra blueprints
    from .routes.login import login_bp
    from .routes.admin_route import admin_bp
    app.register_blueprint(login_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')

    return app
