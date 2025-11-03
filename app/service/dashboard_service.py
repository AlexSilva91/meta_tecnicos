from collections import defaultdict
from datetime import datetime
from app.models.service_order import ServiceOrder
from app.models.expert import Expert
from app.models.type_service import TypeService

class DashboardService:
    @staticmethod
    def get_total_service_orders() -> int:
        return len(ServiceOrder.list(limit=10000))

    @staticmethod
    def get_total_experts() -> int:
        return len(Expert.list_active(limit=10000))

    @staticmethod
    def get_services_by_expert() -> dict:
        """Retorna total de serviços por técnico no mês atual."""
        data = defaultdict(int)
        now = datetime.now()
        mes_atual = now.month
        ano_atual = now.year

        experts = Expert.list_active(limit=10000)
        for expert in experts:
            # Técnico responsável (somente OS do mês atual)
            for order in expert.responsible_orders:
                if order.os_data_agendamento.month == mes_atual and order.os_data_agendamento.year == ano_atual:
                    data[expert.nome] += 1

            # Técnico auxiliar (somente OS do mês atual)
            for order in expert.assistant_orders:
                if order.os_data_agendamento.month == mes_atual and order.os_data_agendamento.year == ano_atual:
                    data[expert.nome] += 1

        return {
            'labels': list(data.keys()),
            'data': list(data.values())
        }

    @staticmethod
    def get_services_with_assist() -> dict:
        """Retorna total de ordens com e sem auxílio no mês atual."""
        with_assist = 0
        without_assist = 0
        now = datetime.now()
        mes_atual = now.month
        ano_atual = now.year

        for order in ServiceOrder.list(limit=10000):
            if order.os_data_agendamento.month == mes_atual and order.os_data_agendamento.year == ano_atual:
                if order.os_tecnicos_auxiliares:
                    with_assist += 1
                else:
                    without_assist += 1

        return {'labels': ['Sem Auxílio', 'Com Auxílio'], 'data': [without_assist, with_assist]}

    @staticmethod
    def get_services_by_category() -> dict:
        """Retorna quantidade de serviços por categoria e técnico, apenas do mês atual."""
        now = datetime.now()
        mes_atual = now.month
        ano_atual = now.year

        categories = TypeService.list(limit=10000)
        experts = Expert.list_active(limit=10000)
        datasets = []

        for expert in experts:
            data = []
            for cat in categories:
                count = 0
                # Responsável no mês atual
                count += sum(
                    1 for o in expert.responsible_orders
                    if o.type_service_id == cat.id
                    and o.os_data_agendamento.month == mes_atual
                    and o.os_data_agendamento.year == ano_atual
                )
                # Auxiliar no mês atual
                count += sum(
                    1 for o in expert.assistant_orders
                    if o.type_service_id == cat.id
                    and o.os_data_agendamento.month == mes_atual
                    and o.os_data_agendamento.year == ano_atual
                )
                data.append(count)
            datasets.append({
                'label': expert.nome,
                'data': data,
                'backgroundColor': f'rgba({hash(expert.nome)%256}, {(hash(expert.nome)*2)%256}, {(hash(expert.nome)*3)%256}, 0.7)'
            })

        labels = [cat.name for cat in categories]
        return {'labels': labels, 'datasets': datasets}