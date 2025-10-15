from flask import Flask
from .database import db
from flask_migrate import Migrate
from flask_login import LoginManager
from dotenv import load_dotenv
import os

# Carrega variáveis do .env
load_dotenv()

login_manager = LoginManager()
login_manager.login_view = 'login.login' 
login_manager.login_message_category = 'info'
login_manager.login_message = "Você precisa fazer login para acessar essa página."
login_manager.login_message_category = "warning"


def create_app(config_object=None):
    app = Flask(__name__,
                static_folder='static',
                template_folder='templates')

    # Configurações do banco
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = os.getenv('DB_PORT')
    DB_NAME = os.getenv('DB_NAME')

    # Monta a URI do PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

    # Garante que o schema public será usado
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "connect_args": {"options": "-c search_path=public"}
    }

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'chave-padrao-segura')
    app.config['DEBUG'] = os.getenv('DEBUG', 'False') == 'True'

    # Inicializa extensões
    db.init_app(app)
    Migrate(app, db)
    login_manager.init_app(app)

    # Importa serviços e blueprints
    from .service.user_service import UserService
    from .routes.login import login_bp
    from .routes.admin_route import admin_bp

    app.register_blueprint(login_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')

    # --- Função que carrega o usuário logado ---
    @login_manager.user_loader
    def load_user(user_id):
        """Carrega o usuário pelo ID armazenado na sessão."""
        return UserService.get_user_by_id(user_id)

    return app
