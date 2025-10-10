from flask import Flask
from .database import db
from flask_migrate import Migrate

def create_app(config_object=None):
    app = Flask(__name__,
                static_folder='static',
                template_folder='templates')

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///meta_tecnicos.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'uma_chave_secreta_aqui'

    db.init_app(app)

    # Inicializa o Flask-Migrate
    migrate = Migrate(app, db)

    # Importa e registra os blueprints
    from .routes.login import login_bp
    from .routes.admin_route import admin_bp

    app.register_blueprint(login_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')

    return app
