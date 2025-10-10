from flask import Flask
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from .database import db
from flask_migrate import Migrate

# importa seus models
from .models.customer import Customer
from .models.expert import Expert
from .models.type_service import TypeService
from .models.service_order import ServiceOrder

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

    # Inicializa o Flask-Admin
    admin = Admin(app, name="Meta Técnicos Admin", template_mode='bootstrap4')
    admin.add_view(ModelView(Customer, db.session))
    admin.add_view(ModelView(Expert, db.session))
    admin.add_view(ModelView(TypeService, db.session))
    admin.add_view(ModelView(ServiceOrder, db.session))

    # Importa e registra os blueprints
    from .routes.login import login_bp

    app.register_blueprint(login_bp)

    return app
