from collections import defaultdict
from app.models.service_order import ServiceOrder
from app.models.expert import Expert
from app.models.type_service import TypeService

class DashboardService:
    @staticmethod
    def get_total_service_orders() -> int:
        return len(ServiceOrder.list(limit=10000))

    @staticmethod
    def get_total_experts() -> int:
        return len(Expert.list(limit=10000))

    @staticmethod
    def get_services_by_expert() -> dict:
        data = defaultdict(int)
        for expert in Expert.list(limit=10000):
            # Técnico responsável
            data[expert.nome] += len(expert.responsible_orders)
            # Técnico auxiliar
            for order in expert.assistant_orders:
                data[expert.nome] += 1
        labels = list(data.keys())
        values = list(data.values())
        return {'labels': labels, 'data': values}

    @staticmethod
    def get_services_with_assist() -> dict:
        with_assist = 0
        without_assist = 0
        for order in ServiceOrder.list(limit=10000):
            if order.os_tecnicos_auxiliares:
                with_assist += 1
            else:
                without_assist += 1
        return {'labels': ['Sem Auxílio', 'Com Auxílio'], 'data': [without_assist, with_assist]}

    @staticmethod
    def get_services_by_category() -> dict:
        categories = TypeService.list(limit=10000)
        experts = Expert.list(limit=10000)
        datasets = []
        for expert in experts:
            data = []
            for cat in categories:
                count = 0
                # Responsável
                count += sum(1 for o in expert.responsible_orders if o.type_service_id == cat.id)
                # Auxiliar
                count += sum(1 for o in expert.assistant_orders if o.type_service_id == cat.id)
                data.append(count)
            datasets.append({
                'label': expert.nome,
                'data': data,
                'backgroundColor': f'rgba({hash(expert.nome)%256}, {(hash(expert.nome)*2)%256}, {(hash(expert.nome)*3)%256}, 0.7)'
            })
        labels = [cat.name for cat in categories]
        return {'labels': labels, 'datasets': datasets}
