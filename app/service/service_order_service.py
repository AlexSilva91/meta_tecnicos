from app.models.service_order import ServiceOrder
from datetime import datetime

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