from flask import render_template, Blueprint, request, jsonify
from datetime import datetime

from app.models.service_order import ServiceOrder
from app.service.dashboard_service import DashboardService

master_bp = Blueprint('master', __name__)

@master_bp.route('/')
def main_dashboard():
    """Rota principal do dashboard - renderiza o template HTML"""
    return render_template('user/index.html')

@master_bp.route('/api/data')
def get_dashboard_data():
    """API para obter todos os dados do dashboard com filtros opcionais"""
    try:
        # Obter parâmetros de filtro da query string
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        # Validar e definir valores padrão
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
        
        # Validar valores
        if not (1 <= month <= 12):
            return jsonify({'error': 'Mês inválido. Use valores de 1 a 12.'}), 400
        
        if year < 2000 or year > datetime.now().year + 1:
            return jsonify({'error': 'Ano inválido.'}), 400
        
        # Obter dados completos do dashboard
        dashboard_data = DashboardService.get_complete_dashboard_data(month, year)
        
        return jsonify({
            'success': True,
            'data': dashboard_data,
            'filters': {
                'month': month,
                'year': year,
                'month_name': DashboardService.get_month_name(month)
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro ao carregar dados: {str(e)}'}), 500

@master_bp.route('/api/metrics')
def get_metrics():
    """API para obter apenas as métricas principais"""
    try:
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
        
        data = {
            'totalServices': DashboardService.get_total_services(month, year),
            'totalExperts': DashboardService.get_total_experts(),
            'servicesWithAssist': DashboardService.get_services_with_assist(month, year)['data'][1],
            'repeatedServices': len(DashboardService.get_repeated_services(month, year))
        }
        
        return jsonify({
            'success': True,
            'data': data,
            'filters': {
                'month': month,
                'year': year,
                'month_name': DashboardService.get_month_name(month)
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro ao carregar métricas: {str(e)}'}), 500

@master_bp.route('/api/charts/services-by-expert')
def get_services_by_expert_chart():
    """API para obter dados do gráfico de serviços por técnico"""
    try:
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
        
        data = DashboardService.get_services_by_expert(month, year)
        
        return jsonify({
            'success': True,
            'data': data,
            'filters': {
                'month': month,
                'year': year,
                'month_name': DashboardService.get_month_name(month)
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro ao carregar dados do gráfico: {str(e)}'}), 500

@master_bp.route('/api/charts/services-by-category')
def get_services_by_category_chart():
    """API para obter dados do gráfico de serviços por categoria"""
    try:
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
        
        data = DashboardService.get_services_by_category(month, year)
        
        return jsonify({
            'success': True,
            'data': data,
            'filters': {
                'month': month,
                'year': year,
                'month_name': DashboardService.get_month_name(month)
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro ao carregar dados do gráfico: {str(e)}'}), 500

@master_bp.route('/api/charts/services-with-assist')
def get_services_with_assist_chart():
    """API para obter dados do gráfico de serviços com auxílio"""
    try:
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
        
        data = DashboardService.get_services_with_assist(month, year)
        
        return jsonify({
            'success': True,
            'data': data,
            'filters': {
                'month': month,
                'year': year,
                'month_name': DashboardService.get_month_name(month)
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro ao carregar dados do gráfico: {str(e)}'}), 500

@master_bp.route('/api/charts/assistance-network')
def get_assistance_network_chart():
    """API para obter dados do gráfico de rede de assistência"""
    try:
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
        
        data = DashboardService.get_assistance_network(month, year)
        
        return jsonify({
            'success': True,
            'data': data,
            'filters': {
                'month': month,
                'year': year,
                'month_name': DashboardService.get_month_name(month)
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro ao carregar dados do gráfico: {str(e)}'}), 500

@master_bp.route('/api/charts/assistance-by-service-type')
def get_assistance_by_service_type_chart():
    """API para obter dados do gráfico de assistência por tipo de serviço"""
    try:
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
        
        data = DashboardService.get_assistance_by_service_type(month, year)
        
        return jsonify({
            'success': True,
            'data': data,
            'filters': {
                'month': month,
                'year': year,
                'month_name': DashboardService.get_month_name(month)
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro ao carregar dados do gráfico: {str(e)}'}), 500

@master_bp.route('/api/tables/repeated-services')
def get_repeated_services_table():
    """API para obter dados da tabela de serviços repetidos"""
    try:
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        if month is None:
            month = datetime.now().month
        if year is None:
            year = datetime.now().year
        
        data = DashboardService.get_repeated_services(month, year)
        
        return jsonify({
            'success': True,
            'data': data,
            'filters': {
                'month': month,
                'year': year,
                'month_name': DashboardService.get_month_name(month)
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro ao carregar dados da tabela: {str(e)}'}), 500

@master_bp.route('/api/available-months')
def get_available_months():
    """API para obter meses e anos disponíveis no banco de dados"""
    try:
        all_orders = ServiceOrder.list(limit=10000)
        
        # Extrair meses e anos únicos
        date_combinations = set()
        for order in all_orders:
            date_combinations.add((order.os_data_agendamento.year, order.os_data_agendamento.month))
        
        # Ordenar por ano e mês
        sorted_dates = sorted(date_combinations, key=lambda x: (x[0], x[1]), reverse=True)
        
        available_months = [
            {
                'year': year,
                'month': month,
                'month_name': DashboardService.get_month_name(month),
                'display': f"{DashboardService.get_month_name(month)}/{year}"
            }
            for year, month in sorted_dates
        ]
        
        return jsonify({
            'success': True,
            'data': available_months
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro ao carregar meses disponíveis: {str(e)}'}), 500
