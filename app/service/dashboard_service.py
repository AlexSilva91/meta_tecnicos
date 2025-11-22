from collections import defaultdict
from datetime import datetime, timedelta
from app.models.customer import Customer
from app.models.service_order import ServiceOrder
from app.models.expert import Expert
from app.models.type_service import TypeService
from collections import defaultdict

blocked_categories = {
    "RETIRADA SEM SUCESSO",
    "REAGENDAMENTO",
    "LOCAL FECHADO",
    "DESISTÊNCIA",
    "REVERTIDO"
}

class DashboardService:
    @staticmethod
    def get_total_service_orders() -> int:
        return len(ServiceOrder.list(limit=10000))

    @staticmethod
    def get_total_experts() -> int:
        return len(Expert.list_active(limit=10000))

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
    
    @staticmethod
    def get_total_services(month: int = None, year: int = None) -> int:
        """Retorna o total de serviços para o mês/ano especificado"""
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
            
        all_orders = ServiceOrder.list(limit=10000)
        count = 0
        for order in all_orders:
            if (order.os_data_agendamento.month == month and 
                order.os_data_agendamento.year == year):
                count += 1
        return count

    @staticmethod
    def get_total_experts() -> int:
        """Retorna o total de técnicos ativos"""
        return len(Expert.list_active(limit=10000))

    @staticmethod
    def get_services_by_expert(month: int = None, year: int = None) -> dict:
        """
        Retorna total de serviços por técnico no mês/ano especificado.
        Mantém o formato original, adicionando somente:
        - not_realized: total de serviços não realizados (categorias bloqueadas)
        """

        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year

        experts = Expert.list_active(limit=10000)

        realized = defaultdict(int)
        not_realized = defaultdict(int)

        def process_order(expert_name, order):
            if (
                order.os_data_agendamento.month == month and
                order.os_data_agendamento.year == year
            ):
                categoria = order.type_service.name if order.type_service else None

                if categoria in blocked_categories:
                    not_realized[expert_name] += 1
                else:
                    realized[expert_name] += 1

        for expert in experts:

            # Como responsável
            for order in expert.responsible_orders:
                process_order(expert.nome, order)

            # Como auxiliar
            for order in expert.assistant_orders:
                process_order(expert.nome, order)

        labels = list(realized.keys())

        result = {
            "labels": labels,
            "data": [realized[name] for name in labels],
            "not_realized": [not_realized[name] for name in labels] 
        }
        return result

    @staticmethod
    def get_services_by_category(month: int = None, year: int = None) -> dict:
        """Retorna quantidade de serviços por categoria no mês/ano especificado"""
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
            
        categories = TypeService.list(limit=10000)
        all_orders = ServiceOrder.list(limit=10000)
        data = defaultdict(int)
        
        for category in categories:
            for order in all_orders:
                if (order.type_service_id == category.id and
                    order.os_data_agendamento.month == month and 
                    order.os_data_agendamento.year == year):
                    data[category.name] += 1
        
        return {
            'labels': list(data.keys()),
            'data': list(data.values())
        }

    @staticmethod
    def get_services_with_assist(month: int = None, year: int = None) -> dict:
        """Retorna total de ordens com e sem auxílio no mês/ano especificado"""
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
            
        all_orders = ServiceOrder.list(limit=10000)
        with_assist = 0
        without_assist = 0
        
        for order in all_orders:
            if (order.os_data_agendamento.month == month and 
                order.os_data_agendamento.year == year):
                if order.os_tecnicos_auxiliares:
                    with_assist += 1
                else:
                    without_assist += 1
        
        return {
            'labels': ['Sem Auxílio', 'Com Auxílio'],
            'data': [without_assist, with_assist]
        }
        
    @staticmethod
    def get_assistance_network(month: int = None, year: int = None) -> dict:
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
            
        experts = Expert.list_active(limit=10000)

        expert_names = []
        helped_data = []
        received_help_data = []
        detailed_data = []

        for expert in experts:
            help_received_count = 0
            help_received_details = []
            for order in expert.responsible_orders:
                if (order.os_data_agendamento.month == month and
                    order.os_data_agendamento.year == year and
                    order.os_tecnicos_auxiliares):

                    help_received_count += 1
                    assistants = [a.nome for a in order.os_tecnicos_auxiliares if a.nome != expert.nome]

                    category = TypeService.get_by_id(order.type_service_id)
                    category_name = category.name if category else 'Desconhecida'

                    help_received_details.append({
                        'assistants': assistants,
                        'date': order.os_data_agendamento.strftime('%Y-%m-%d'),
                        'category': category_name,
                        'service_id': order.id, 
                        'service_os_id': order.os_id 
                    })

            helped_count = 0
            helped_details = []
            for order in expert.assistant_orders:
                if (order.os_data_agendamento.month == month and
                    order.os_data_agendamento.year == year):

                    main_expert = Expert.get_by_id(order.os_tecnico_responsavel)
                    if main_expert and main_expert.nome != expert.nome:
                        helped_count += 1

                        category = TypeService.get_by_id(order.type_service_id)
                        category_name = category.name if category else 'Desconhecida'

                        helped_details.append({
                            'main_expert': main_expert.nome,
                            'date': order.os_data_agendamento.strftime('%Y-%m-%d'),
                            'category': category_name,
                            'service_id': order.id,
                            'service_os_id': order.os_id 
                        })

            assistant_summary = defaultdict(int)
            assistant_full_details = defaultdict(list)
            for data in help_received_details:
                for assistant in data['assistants']:
                    assistant_summary[assistant] += 1
                    assistant_full_details[assistant].append({
                        'date': data['date'],
                        'category': data['category'],
                        'service_id': data['service_id'],
                        'service_os_id': data['service_os_id'] 
                    })

            helped_summary = defaultdict(int)
            helped_full_details = defaultdict(list)
            for data in helped_details:
                helped_summary[data['main_expert']] += 1
                helped_full_details[data['main_expert']].append({
                    'date': data['date'],
                    'category': data['category'],
                    'service_id': data['service_id'],
                    'service_os_id': data['service_os_id'] 
                })

            total_help_interaction = helped_count + help_received_count
            if total_help_interaction == 0:
                continue 

            expert_names.append(expert.nome)
            helped_data.append(helped_count)
            received_help_data.append(help_received_count)

            detailed_data.append({
                'expert': expert.nome,
                'helped_others': [
                    {
                        'main_expert': main_expert,
                        'count': count,
                        'details': helped_full_details[main_expert]
                    }
                    for main_expert, count in helped_summary.items()
                ],
                'helped_by_others': [
                    {
                        'assistant_name': assistant,
                        'count': count,
                        'details': assistant_full_details[assistant]
                    }
                    for assistant, count in assistant_summary.items()
                ]
            })

        return {
            'labels': expert_names,
            'datasets': [
                {
                    'label': 'Ajudou',
                    'data': helped_data,
                    'backgroundColor': 'rgba(34, 197, 94, 0.7)'
                },
                {
                    'label': 'Recebeu Ajuda',
                    'data': received_help_data,
                    'backgroundColor': 'rgba(0, 150, 255, 0.7)'
                }
            ],
            'detailed_data': detailed_data
        }


    @staticmethod
    def get_assistance_by_service_type(month: int = None, year: int = None) -> dict:
        """Retorna tipos de serviço em que houve ajuda"""
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
            
        all_orders = ServiceOrder.list(limit=10000)
        categories = TypeService.list(limit=10000)
        data = defaultdict(int)
        
        for order in all_orders:
            if (order.os_data_agendamento.month == month and 
                order.os_data_agendamento.year == year and
                order.os_tecnicos_auxiliares):
                
                category = next((cat for cat in categories if cat.id == order.type_service_id), None)
                if category:
                    data[category.name] += 1
        
        return {
            'labels': list(data.keys()),
            'data': list(data.values())
        }

    @staticmethod
    def get_repeated_services(month: int = None, year: int = None) -> list:
        """
        Retorna serviços reincidentes dentro de uma janela de 60 dias,
        mas só considera reincidência válida se acontecer em <= 30 dias
        e a categoria NÃO estiver na lista de bloqueio.
        Mantém a estrutura de saída atual, porém agrupada por contrato.
        """
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
            
        all_orders = ServiceOrder.list(limit=10000)
        repeated_services = []
        
        current_month_orders = [
            order for order in all_orders 
            if (
                order.os_data_agendamento.month == month and 
                order.os_data_agendamento.year == year
            )
        ]
        
        for current_order in current_month_orders:
            customer_id = current_order.customer_id
            
            date_limit = current_order.os_data_agendamento - timedelta(days=60)

            previous_orders = [
                order for order in all_orders 
                if (
                    order.customer_id == customer_id and
                    order.os_data_agendamento < current_order.os_data_agendamento and
                    order.os_data_agendamento >= date_limit
                )
            ]
            
            for prev_order in previous_orders:
                days_between = (current_order.os_data_agendamento - prev_order.os_data_agendamento).days
                
                if days_between > 30:
                    continue

                current_category_obj = TypeService.get_by_id(current_order.type_service_id)
                current_category = current_category_obj.name if current_category_obj else "Desconhecida"

                # -------------------------
                # FILTRO DAS CATEGORIAS BLOQUEADAS
                # -------------------------
                if current_category.upper() in blocked_categories:
                    continue

                all_experts = set()
                
                current_responsible = Expert.get_by_id(current_order.os_tecnico_responsavel)
                if current_responsible:
                    all_experts.add(current_responsible.nome)
                
                for assistant in current_order.os_tecnicos_auxiliares:
                    all_experts.add(assistant.nome)
                
                prev_responsible = Expert.get_by_id(prev_order.os_tecnico_responsavel)
                if prev_responsible:
                    all_experts.add(prev_responsible.nome)
                
                for assistant in prev_order.os_tecnicos_auxiliares:
                    all_experts.add(assistant.nome)

                customer = Customer.get_by_id(current_order.customer_id)
                contract_id = customer.id_contrato if customer else "Desconhecido"
                
                repeated_services.append({
                    'contract': contract_id,
                    'category': current_category,
                    'experts': list(all_experts),
                    'firstServiceDate': prev_order.os_data_agendamento.strftime('%Y-%m-%d'),
                    'secondServiceDate': current_order.os_data_agendamento.strftime('%Y-%m-%d'),
                    'daysBetween': days_between,
                    'firstServiceId': prev_order.id,
                    'secondServiceId': current_order.id
                })
        
        grouped = {}
        for item in repeated_services:
            contract = item['contract']
            if contract not in grouped:
                grouped[contract] = []
            grouped[contract].append(item)

        final_output = [
            {
                'contract': contract,
                'items': grouped[contract]
            }
            for contract in grouped
        ]

        return final_output

    @staticmethod
    def get_services_by_expert_with_details(month: int = None, year: int = None) -> dict:
        """Retorna dados detalhados de serviços por técnico incluindo categorias"""
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year

        detailed_data = ServiceOrder.get_service_orders_grouped(month, year)

        experts = Expert.list_active(limit=10000)
        categories = TypeService.list(limit=10000)
        
        expert_map = {expert.id: expert.nome for expert in experts}
        category_map = {category.id: category.name for category in categories}
        
        result = {
            'summary': {},
            'detailed': {}
        }
        
        for expert_id, categories_data in detailed_data.items():
            expert_name = expert_map.get(expert_id, f"Técnico {expert_id}")

            total = sum(categories_data.values())
            result['summary'][expert_name] = total
            
            detailed_categories = []
            for category_id, count in categories_data.items():
                category_name = category_map.get(category_id, f"Categoria {category_id}")
                detailed_categories.append({
                    'name': category_name,
                    'count': count,
                    'percentage': round((count / total) * 100, 1) if total > 0 else 0
                })
        
            detailed_categories.sort(key=lambda x: x['count'], reverse=True)
            
            result['detailed'][expert_name] = {
                'total': total,
                'categories': detailed_categories
            }
        
        return result

    @staticmethod
    def get_month_name(month: int) -> str:
        """Retorna o nome do mês baseado no número"""
        months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ]
        return months[month - 1] if 1 <= month <= 12 else 'Mês Inválido'
    
    @staticmethod
    def combine_services_with_assistance(assistance_data: dict, services_data: dict) -> dict:
        """
        Retorna no MESMO FORMATO de get_services_by_expert(), preservando not_realized:
            {
                'labels': [...],
                'data': [...],
                'not_realized': [...]
            }

        Regra:
            - Cada ajuda prestada soma +1 serviço ao técnico.
        """

        combined = defaultdict(int)
        not_realized_dict = {}
        
        for i, expert in enumerate(services_data['labels']):
            combined[expert] += services_data['data'][i]
            if 'not_realized' in services_data and i < len(services_data['not_realized']):
                not_realized_dict[expert] = services_data['not_realized'][i]
            else:
                not_realized_dict[expert] = 0

        for item in assistance_data['detailed_data']:
            expert_name = item['expert']

            helped_total = sum(h['count'] for h in item['helped_others'])
            combined[expert_name] += helped_total

        labels = list(combined.keys())
        data = list(combined.values())
        not_realized = [not_realized_dict.get(label, 0) for label in labels]

        result = {
            'labels': labels,
            'data': data,
            'not_realized': not_realized
        }
        return result

    @staticmethod
    def merge_services_with_assistance(services_details: dict, assistance: dict) -> dict:

        final_result = {
            "summary": {},
            "detailed": {}
        }

        category_map = defaultdict(lambda: defaultdict(int))
        not_performed_map = defaultdict(int)
        not_performed_categories_map = defaultdict(lambda: defaultdict(int))

        for expert_name, detail in services_details["detailed"].items():
            for cat in detail["categories"]:
                name = cat["name"]
                count = cat["count"]

                if name in blocked_categories:
                    not_performed_map[expert_name] += count
                    not_performed_categories_map[expert_name][name] += count 
                    continue

                category_map[expert_name][name] += count

        for item in assistance["detailed_data"]:
            expert_name = item["expert"]

            for help_block in item["helped_others"]:
                for entry in help_block["details"]:
                    category = entry["category"]

                    if category in blocked_categories:
                        not_performed_map[expert_name] += 1
                        not_performed_categories_map[expert_name][category] += 1  
                        continue

                    category_map[expert_name][category] += 1

        for expert_name, cat_data in category_map.items():
            total = sum(count for cat, count in cat_data.items() if cat not in blocked_categories)

            final_result["summary"][expert_name] = {
                "performed": total,
                "not_performed": not_performed_map.get(expert_name, 0)
            }

            categories_list = []
            for cat_name, count in cat_data.items():
                if cat_name in blocked_categories:
                    continue

                percentage = round((count / total) * 100, 1) if total > 0 else 0

                categories_list.append({
                    "name": cat_name,
                    "count": count,
                    "percentage": percentage
                })

            categories_list.sort(key=lambda x: x["count"], reverse=True)

            not_performed_categories = []
            if expert_name in not_performed_categories_map:
                for cat_name, count in not_performed_categories_map[expert_name].items():
                    not_performed_categories.append({
                        "name": cat_name,
                        "count": count,
                        "percentage": round((count / not_performed_map.get(expert_name, 1)) * 100, 1) if not_performed_map.get(expert_name, 0) > 0 else 0
                    })

            final_result["detailed"][expert_name] = {
                "total": total,
                "not_performed": not_performed_map.get(expert_name, 0),
                "categories": categories_list,
                "not_performed_categories": not_performed_categories 
            }

        return final_result

    @staticmethod
    def get_complete_dashboard_data(month: int = None, year: int = None) -> dict:
        """Retorna todos os dados do dashboard em um único dicionário"""
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
            
        services_with_assist_data = DashboardService.get_services_with_assist(month, year)
        repeated_services_list = DashboardService.get_repeated_services(month, year)
        
        return {
            'totalServices': DashboardService.get_total_services(month, year),
            'totalExperts': DashboardService.get_total_experts(),
            'servicesWithAssist': services_with_assist_data['data'][1], 
            'repeatedServices': len(repeated_services_list),
            'servicesByExpert': DashboardService.combine_services_with_assistance(DashboardService.get_assistance_network(month, year), 
                                                                                  DashboardService.get_services_by_expert(month, year)),
            # 'servicesByExpert': DashboardService.get_services_by_expert(month, year),
            'servicesByCategory': DashboardService.get_services_by_category(month, year),
            'servicesWithAssistChart': services_with_assist_data,
            'assistanceNetwork': DashboardService.get_assistance_network(month, year),
            'assistanceByServiceType': DashboardService.get_assistance_by_service_type(month, year),
            'repeatedServicesList': repeated_services_list,
            'servicesByExpertDetailed': DashboardService.merge_services_with_assistance(DashboardService.get_services_by_expert_with_details(month, year), 
                                                                                        DashboardService.get_assistance_network(month, year)) 
            # 'servicesByExpertDetailed': DashboardService.get_services_by_expert_with_details(month, year)
        }