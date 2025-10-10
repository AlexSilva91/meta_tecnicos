from app.models.service_order import ServiceOrder
from datetime import datetime

class ServiceOrderService:
    @staticmethod
    def create_service_order(appointment_date: datetime, reported_problem: str, service_provided: str,
                             id_OS: str, expert_id: int, type_service_id: int, customer_id: int,
                             completion_date: datetime = None) -> ServiceOrder:
        return ServiceOrder.create(
            appointment_date, reported_problem, service_provided,
            id_OS, expert_id, type_service_id, customer_id, completion_date
        )

    @staticmethod
    def get_service_order_by_id(order_id: int) -> ServiceOrder | None:
        return ServiceOrder.get_by_id(order_id)

    @staticmethod
    def update_service_order(order_id: int, **kwargs) -> ServiceOrder | None:
        return ServiceOrder.update(order_id, **kwargs)

    @staticmethod
    def delete_service_order(order_id: int) -> bool:
        return ServiceOrder.delete(order_id)

    @staticmethod
    def list_service_orders(limit: int = 50, offset: int = 0):
        return ServiceOrder.list(limit=limit, offset=offset)
