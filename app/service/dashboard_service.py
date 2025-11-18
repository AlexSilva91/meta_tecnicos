from collections import defaultdict
from datetime import datetime, timedelta
from app.models.customer import Customer
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
        """Retorna total de serviços por técnico no mês/ano especificado"""
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
            
        experts = Expert.list_active(limit=10000)
        data = defaultdict(int)
        
        for expert in experts:
            # Serviços como técnico responsável
            for order in expert.responsible_orders:
                if (order.os_data_agendamento.month == month and 
                    order.os_data_agendamento.year == year):
                    data[expert.nome] += 1
            
            # Serviços como auxiliar
            for order in expert.assistant_orders:
                if (order.os_data_agendamento.month == month and 
                    order.os_data_agendamento.year == year):
                    data[expert.nome] += 1
        
        return {
            'labels': list(data.keys()),
            'data': list(data.values())
        }

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
        """Retorna dados detalhados sobre quem ajudou quem incluindo categorias"""
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
            
        experts = Expert.list_active(limit=10000)
        expert_names = [expert.nome for expert in experts]
        
        # Estruturas para armazenar dados
        helped_data = []
        received_help_data = []
        detailed_data = []
        
        for expert in experts:
            # Contador de ajuda recebida (como responsável)
            help_received_count = 0
            help_received_details = []
            
            # Serviços onde este técnico foi o responsável e recebeu ajuda
            for order in expert.responsible_orders:
                if (order.os_data_agendamento.month == month and 
                    order.os_data_agendamento.year == year and
                    order.os_tecnicos_auxiliares):
                    
                    help_received_count += 1
                    
                    # Coletar nomes dos auxiliares
                    assistants = []
                    for assistant in order.os_tecnicos_auxiliares:
                        if assistant.nome != expert.nome:
                            assistants.append(assistant.nome)
                    
                    category = TypeService.get_by_id(order.type_service_id)
                    category_name = category.name if category else 'Desconhecida'
                    
                    help_received_details.append({
                        'assistants': assistants,
                        'date': order.os_data_agendamento.strftime('%Y-%m-%d'),
                        'category': category_name,
                        'service_id': order.id
                    })
            
            # Contador de ajuda prestada (como auxiliar)
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
                            'service_id': order.id
                        })
            
            # Agrupar dados de ajuda recebida por técnico auxiliar
            assistant_summary = defaultdict(int)
            assistant_full_details = defaultdict(list)
            
            for help_data in help_received_details:
                for assistant in help_data['assistants']:
                    assistant_summary[assistant] += 1
                    assistant_full_details[assistant].append({
                        'date': help_data['date'],
                        'category': help_data['category'],
                        'service_id': help_data['service_id']
                    })
            
            # Agrupar dados de ajuda prestada por técnico principal
            helped_summary = defaultdict(int)
            helped_full_details = defaultdict(list)
            
            for help_data in helped_details:
                helped_summary[help_data['main_expert']] += 1
                helped_full_details[help_data['main_expert']].append({
                    'date': help_data['date'],
                    'category': help_data['category'],
                    'service_id': help_data['service_id']
                })
            
            # Preparar dados detalhados para tooltips
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
            
            # Dados para o gráfico
            helped_data.append(helped_count)
            received_help_data.append(help_received_count)
        
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
        """Retorna serviços onde o técnico voltou mais de uma vez em menos de 30 dias"""
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
            
        all_orders = ServiceOrder.list(limit=10000)
        repeated_services = []
        
        # Filtra serviços do mês atual
        current_month_orders = [
            order for order in all_orders 
            if (order.os_data_agendamento.month == month and 
                order.os_data_agendamento.year == year)
        ]
        
        for current_order in current_month_orders:
            customer_id = current_order.customer_id
            
            # Busca serviços anteriores do mesmo cliente
            previous_orders = [
                order for order in all_orders 
                if (order.customer_id == customer_id and
                    order.os_data_agendamento < current_order.os_data_agendamento and
                    order.os_data_agendamento >= (current_order.os_data_agendamento - timedelta(days=30)))
            ]
            
            for prev_order in previous_orders:
                days_between = (current_order.os_data_agendamento - prev_order.os_data_agendamento).days
                
                # Coleta todos os técnicos envolvidos em ambos os serviços
                all_experts = set()
                
                # Técnicos do serviço atual
                current_responsible = Expert.get_by_id(current_order.os_tecnico_responsavel)
                if current_responsible:
                    all_experts.add(current_responsible.nome)
                
                for assistant in current_order.os_tecnicos_auxiliares:
                    all_experts.add(assistant.nome)
                
                # Técnicos do serviço anterior
                prev_responsible = Expert.get_by_id(prev_order.os_tecnico_responsavel)
                if prev_responsible:
                    all_experts.add(prev_responsible.nome)
                
                for assistant in prev_order.os_tecnicos_auxiliares:
                    all_experts.add(assistant.nome)
                
                # Busca informações da categoria
                current_category = TypeService.get_by_id(current_order.type_service_id)
                category_name = current_category.name if current_category else "Desconhecida"
                
                # Busca informações do cliente/contrato
                customer = Customer.get_by_id(current_order.customer_id)
                contract_id = customer.id_contrato if customer else "Desconhecido"
                
                repeated_services.append({
                    'contract': contract_id,
                    'category': category_name,
                    'experts': list(all_experts),
                    'firstServiceDate': prev_order.os_data_agendamento.strftime('%Y-%m-%d'),
                    'secondServiceDate': current_order.os_data_agendamento.strftime('%Y-%m-%d'),
                    'daysBetween': days_between
                })
        
        return repeated_services

    @staticmethod
    def get_month_name(month: int) -> str:
        """Retorna o nome do mês baseado no número"""
        months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ]
        return months[month - 1] if 1 <= month <= 12 else 'Mês Inválido'
    
    @staticmethod
    def get_complete_dashboard_data(month: int = None, year: int = None) -> dict:
        """Retorna todos os dados do dashboard em um único dicionário"""
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
            
        # CORREÇÃO: Usar DashboardService. para chamar os métodos estáticos
        services_with_assist_data = DashboardService.get_services_with_assist(month, year)
        repeated_services_list = DashboardService.get_repeated_services(month, year)
        
        return {
            'totalServices': DashboardService.get_total_services(month, year),
            'totalExperts': DashboardService.get_total_experts(),
            'servicesWithAssist': services_with_assist_data['data'][1],  # Apenas serviços com auxílio
            'repeatedServices': len(repeated_services_list),
            'servicesByExpert': DashboardService.get_services_by_expert(month, year),
            'servicesByCategory': DashboardService.get_services_by_category(month, year),
            'servicesWithAssistChart': services_with_assist_data,
            'assistanceNetwork': DashboardService.get_assistance_network(month, year),
            'assistanceByServiceType': DashboardService.get_assistance_by_service_type(month, year),
            'repeatedServicesList': repeated_services_list
        }