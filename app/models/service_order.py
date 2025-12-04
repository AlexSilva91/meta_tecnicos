from sqlalchemy import and_
from app.database import db
from datetime import datetime, date

from app.models.expert import Expert
from app.models.type_service import TypeService

class ServiceOrder(db.Model):
    __tablename__ = 'service_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    os_id = db.Column(db.String(50), unique=True, nullable=False)
    os_data_agendamento = db.Column(db.DateTime, nullable=True)
    os_data_cadastro = db.Column(db.DateTime, nullable=False)
    os_data_finalizacao = db.Column(db.DateTime, nullable=True)
    os_conteudo = db.Column(db.Text, nullable=False)
    os_servicoprestado = db.Column(db.Text, nullable=False)
    retrabalho = db.Column(db.Boolean, nullable=False, default=False)
    observacoes = db.Column(db.Text, nullable=True)
    
    type_service_id = db.Column(db.Integer, db.ForeignKey('type_services.id'), nullable=False)
    type_service = db.relationship("TypeService", backref="service_orders")
    
    os_tecnico_responsavel = db.Column(db.Integer, db.ForeignKey('experts.id'), nullable=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)

    def __repr__(self):
        return f"<ServiceOrder {self.os_id}>"

    # ---------- CRUD ----------
    @classmethod
    def create(cls, os_id: str, os_data_agendamento: datetime = None,
            os_conteudo: str = "", os_servicoprestado: str = "",
            os_tecnico_responsavel: int = None,
            customer_id: int = None, type_service_id: int = None,
            os_data_finalizacao: datetime = None, 
            os_data_cadastro: datetime = None, assistants: list = None):

        order = cls(
            os_id=os_id,
            os_data_agendamento=os_data_agendamento,
            os_data_cadastro=os_data_cadastro or datetime.now(),
            os_data_finalizacao=os_data_finalizacao,
            os_conteudo=os_conteudo,
            os_servicoprestado=os_servicoprestado,
            os_tecnico_responsavel=os_tecnico_responsavel,
            customer_id=customer_id,
            type_service_id=type_service_id
        )

        db.session.add(order)

        if assistants:
            for assistant_id in assistants:
                assistant = Expert.query.get(assistant_id)
                if assistant:
                    order.os_tecnicos_auxiliares.append(assistant)

        db.session.commit()
        return order

    @classmethod
    def get_by_customer_id(cls, customer_id: int):
        """Busca ServiceOrder pelo ID."""
        return cls.query.filter_by(customer_id=customer_id).all()

    @classmethod
    def get_by_id(cls, order_id: int):
        """Busca ServiceOrder pelo ID."""
        return cls.query.get(order_id)

    @classmethod
    def get_by_os_id(cls, os_id):
        """Busca uma OS pelo os_id."""
        return cls.query.filter_by(os_id=os_id).first()
    
    @classmethod
    def get_service_orders_grouped(cls, month: int = None, year: int = None):
        """
        Retorna:
        {
            expert_id: {
                type_service_id: quantidade
            }
        }

        Se month/year não forem enviados → usa mês vigente.
        """

        # Define mês/ano padrão (vigente)
        now = datetime.now()
        month = month or now.month
        year = year or now.year

        # Início do período
        start_date = date(year, month, 1)

        # Fim do período (início do próximo mês)
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)

        base_query = db.session.query(ServiceOrder).filter(
            and_(
                ServiceOrder.os_data_agendamento >= start_date,
                ServiceOrder.os_data_agendamento < end_date
            )
        )

        orders = base_query.all()
        result = {}

        for order in orders:

            resp_id = order.os_tecnico_responsavel
            ts_id = order.type_service_id
            
            if resp_id not in result:
                result[resp_id] = {}

            result[resp_id][ts_id] = result[resp_id].get(ts_id, 0) + 1

            for assistant in order.os_tecnicos_auxiliares:
                asst_id = assistant.id
                if asst_id not in result:
                    result[asst_id] = {}
                result[asst_id][ts_id] = result[asst_id].get(ts_id, 0) + 1

        return result

    @staticmethod
    def get_retrabalho_by_interval(expert_id: int, start_date: datetime, end_date: datetime):
        """
        Retorna retrabalhos dentro de um intervalo de datas real (>= start e <= end),
        considerando apenas o técnico responsável.
        """
        if not expert_id or not start_date or not end_date:
            return []

        query = (
            ServiceOrder.query
                .filter(ServiceOrder.os_tecnico_responsavel == expert_id)
                .filter(ServiceOrder.retrabalho.is_(True))
                .filter(ServiceOrder.os_data_finalizacao >= start_date)
                .filter(ServiceOrder.os_data_finalizacao <= end_date)
                .order_by(ServiceOrder.os_data_finalizacao.asc())
        )

        result = query.all()
       
        return result

    @classmethod
    def update(cls, order_id: int, **kwargs):
        """Atualiza uma ServiceOrder."""
        order = cls.query.get(order_id)
        if not order:
            return None
        
        # Trata técnicos auxiliares separadamente
        assistants = kwargs.pop('assistants', None)
        
        for key, value in kwargs.items():
            if hasattr(order, key):
                setattr(order, key, value)
        
        # Atualiza técnicos auxiliares se fornecidos
        if assistants is not None:
            order.os_tecnicos_auxiliares = []
            for assistant_id in assistants:
                assistant = Expert.query.get(assistant_id)
                if assistant:
                    order.os_tecnicos_auxiliares.append(assistant)
        
        db.session.commit()
        return order

    @classmethod
    def update_retrabalho(cls, os_id: str, retrabalho: bool, observacao: str = None):
        """
        Atualiza o campo 'retrabalho' de uma ServiceOrder usando os_id.
        Retorna o objeto atualizado ou None se não existir.
        """
        try:
            order = cls.query.filter_by(os_id=os_id).first()
            if not order:
                return None

            order.retrabalho = bool(retrabalho)
            order.observacoes = observacao
            db.session.commit()
            return order

        except Exception:
            db.session.rollback()
            return None

    @classmethod
    def delete(cls, order_id: int) -> bool:
        """Deleta uma ServiceOrder pelo ID."""
        order = cls.query.get(order_id)
        if not order:
            return False
        db.session.delete(order)
        db.session.commit()
        return True

    @classmethod
    def list(cls, limit: int = 50, offset: int = 0):
        """Lista ServiceOrders com paginação."""
        return cls.query.offset(offset).limit(limit).all()

    def get_assistants_ids(self):
        """Retorna lista de IDs dos técnicos auxiliares."""
        return [assistant.id for assistant in self.os_tecnicos_auxiliares]