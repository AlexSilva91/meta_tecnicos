from app.models.service_order import ServiceOrder
from datetime import datetime
from collections import defaultdict

from app.models.type_service import TypeService

class ServiceOrderService:
    @staticmethod
    def create_service_order(
        os_id: str,
        os_data_agendamento: datetime,
        os_conteudo: str,
        os_servicoprestado: str,
        os_tecnico_responsavel: int,
        customer_id: int,
        type_service_id: int,
        os_data_finalizacao: datetime = None,
        os_data_cadastro: datetime = None,
        assistants: list = None
    ) -> ServiceOrder:
        return ServiceOrder.create(
            os_id=os_id,
            os_data_agendamento=os_data_agendamento,
            os_conteudo=os_conteudo,
            os_servicoprestado=os_servicoprestado,
            os_tecnico_responsavel=os_tecnico_responsavel,
            customer_id=customer_id,
            type_service_id=type_service_id,
            os_data_finalizacao=os_data_finalizacao,
            os_data_cadastro=os_data_cadastro,
            assistants=assistants
        )

    @staticmethod
    def get_service_order_by_id(order_id: int) -> ServiceOrder | None:
        return ServiceOrder.get_by_id(order_id)

    @staticmethod
    def get_service_order_by_os_id(os_id: str) -> ServiceOrder | None:
        return ServiceOrder.get_by_os_id(os_id)

    @staticmethod
    def update_service_order(order_id: int, **kwargs) -> ServiceOrder | None:
        return ServiceOrder.update(order_id, **kwargs)

    @staticmethod
    def delete_service_order(order_id: int) -> bool:
        return ServiceOrder.delete(order_id)

    @staticmethod
    def list_service_orders(limit: int = 50, offset: int = 0):
        return ServiceOrder.list(limit=limit, offset=offset)

    @staticmethod
    def complete_service_order(order_id: int) -> ServiceOrder | None:
        """Marca uma ordem de serviço como concluída"""
        return ServiceOrder.update(order_id, os_data_finalizacao=datetime.now())
    
    @staticmethod
    def get_service_orders_by_type_service(type_service) -> list:
        """
        Retorna todas as ServiceOrder pertencentes a um type_service.
        Aceita tanto o ID quanto o objeto TypeService.
        """
        return ServiceOrder.get_by_type_service(type_service)
    
    @staticmethod
    def get_total_by_month_filtered(type_service, start_date=None, end_date=None):

        # Resolver ID ou nome
        if isinstance(type_service, str):
            ts = TypeService.get_by_name(type_service)
            if not ts:
                return {}
            type_service = ts.id

        elif isinstance(type_service, TypeService):
            type_service = type_service.id

        query = ServiceOrder.query.filter(
            ServiceOrder.type_service_id == type_service
        )

        # Aqui removemos os strptime — porque já são datetime
        if start_date:
            query = query.filter(
                (ServiceOrder.os_data_agendamento >= start_date) |
                (ServiceOrder.os_data_cadastro >= start_date)
            )

        if end_date:
            query = query.filter(
                (ServiceOrder.os_data_agendamento <= end_date) |
                (ServiceOrder.os_data_cadastro <= end_date)
            )

        orders = query.all()
        totals = defaultdict(int)

        for order in orders:
            date_ref = order.os_data_agendamento or order.os_data_cadastro
            if not date_ref:
                continue

            key = date_ref.strftime("%Y-%m")
            totals[key] += 1

        return dict(totals)
