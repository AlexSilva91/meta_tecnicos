from flask import render_template, Blueprint, request, jsonify
from datetime import datetime
from app.models.service_order import ServiceOrder
from app.models.type_service import TypeService
from app.service.dashboard_service import DashboardService
import logging

from app.service.service_order_service import ServiceOrderService
logger = logging.getLogger(__name__)

master_bp = Blueprint('master', __name__)

@master_bp.route('/')
def main_dashboard():
    """Rota principal do dashboard - renderiza o template HTML"""
    logger.success('Template renderizado')
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
            logger.error('Mês inválido. Use valores de 1 a 12')
            return jsonify({'error': 'Mês inválido. Use valores de 1 a 12.'}), 400
        
        if year < 2000 or year > datetime.now().year + 1:
            logger.error('Ano inválido')
            return jsonify({'error': 'Ano inválido.'}), 400
        
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
        logger.error(f'Erro ao carregar dados: {e}')
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
        logger.error(f'Erro ao carregar métricas: {e}')
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
        logger.error(f'Erro ao carregar dados do gráfico: {e}')
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
        logger.error(f'Erro ao carregar dados do gráfico: {e}')
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
        logger.error(f'Erro ao carregar dados do gráfico: {e}')
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
        logger.error(f'Erro ao carregar dados do gráfico: {e}')
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
        logger.error(f'Erro ao carregar dados do gráfico: {e}')
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
        logger.error(f'Erro ao carregar dados da tabela: {e}')
        return jsonify({'error': f'Erro ao carregar dados da tabela: {str(e)}'}), 500

@master_bp.route('/api/available-months')
def get_available_months():
    try:
        all_orders = ServiceOrder.list(limit=10000)

        date_combinations = set()
        for order in all_orders:
            dt = order.os_data_finalizacao
            if dt:
                date_combinations.add((dt.year, dt.month))

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
        logger.error(f'Erro ao carregar meses disponíveis: {e}')
        return jsonify({'error': f'Erro ao carregar meses disponíveis: {str(e)}'}), 500


@master_bp.route('/api/details-order-service', methods=["GET", "POST"])
def order_services():
    """
    Aceita GET e POST para consultar serviços.
    GET  -> /api/details-order-service?contract_id=123&id_order_first=10&id_order_secund=20
    POST -> {"contract_id": 123, "id_order_first": 10, "id_order_secund": 20}
    """
    if request.method == "GET":
        contract_id = request.args.get("contract_id", type=int)
        id_order_first = request.args.get("id_order_first", type=int)
        id_order_secund = request.args.get("id_order_secund", type=int)

    else:  # POST
        data = request.get_json() or {}
        contract_id = data.get("contract_id")
        id_order_first = data.get("id_order_first")
        id_order_secund = data.get("id_order_secund")

    if not contract_id:
        return jsonify({"error": "contract_id é obrigatório"}), 400

    resultado = DashboardService.search_datails_order_services(
        contract=contract_id,
        id_order_first=id_order_first,
        id_order_secund=id_order_secund
    )
    
    return jsonify(resultado), 200

@master_bp.route('/api/update-order-service', methods=["POST"])
def update_order_service():
    """
    Atualiza o campo 'retrabalho' e 'observacao' de uma ServiceOrder.
    Espera JSON:
    {
        "os_id": 123,
        "retrabalho": true,
        "observacao": "texto aqui"
    }
    """
    data = request.get_json()

    os_id = data.get("os_id")
    retrabalho = data.get("retrabalho")
    observacao = data.get("observacao") 

    if os_id is None:
        return jsonify({"error": "os_id é obrigatório"}), 400

    if retrabalho is None:
        return jsonify({"error": "retrabalho é obrigatório (true/false)"}), 400

    updated = DashboardService.update_order_service(os_id, retrabalho, observacao)
    if not updated:
        return jsonify({"error": "ServiceOrder não encontrada"}), 404

    return jsonify({
        "id": updated.id,
        "retrabalho": updated.retrabalho,
        "observacao": updated.observacoes 
    }), 200


@master_bp.route('/api/reports/service-orders-by-type', methods=["GET"])
def get_service_orders_by_type():
    """
    Filtros opcionais:
    - type_service: ID ou nome
    - start_date: YYYY-MM-DD
    - end_date: YYYY-MM-DD

    Exemplo:
    /api/reports/service-orders-by-type?type_service=3&start_date=2025-01-01&end_date=2025-12-31
    """

    try:
        # --- FILTRO TYPE_SERVICE ---
        type_service_param = request.args.get("type_service")

        if not type_service_param:
            return jsonify({"error": "O parâmetro type_service é obrigatório"}), 400

        # Aceita ID ou nome
        if type_service_param.isdigit():
            type_service = TypeService.query.get(int(type_service_param))
        else:
            type_service = TypeService.query.filter(
                TypeService.name.ilike(f"%{type_service_param}%")
            ).first()

        if not type_service:
            return jsonify({"error": "Tipo de serviço não encontrado"}), 404

        # --- FILTRO DE DATA ---
        start_date_str = request.args.get("start_date")
        end_date_str = request.args.get("end_date")

        start_date = None
        end_date = None

        if start_date_str:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d")

        if end_date_str:
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d")

        # CHAMA O SERVICE
        totals = ServiceOrderService.get_total_by_month_filtered(
            type_service=type_service,
            start_date=start_date,
            end_date=end_date
        )

        return jsonify({
            "success": True,
            "type_service": {
                "id": type_service.id,
                "name": type_service.name
            },
            "filters": {
                "start_date": start_date_str,
                "end_date": end_date_str
            },
            "data": totals
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500