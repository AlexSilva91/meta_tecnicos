from datetime import datetime
from flask import render_template, Blueprint, request, jsonify, redirect, url_for

from app.service.customer_service import CustomerService
from app.service.expert_service import ExpertService
from app.service.service_order_service import ServiceOrderService
from app.service.type_service_service import TypeServiceService


admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/')
def admin_dashboard():
    """Dashboard principal do admin"""
    customers_count = CustomerService.list_customers(limit=1000)  # Usar count seria melhor
    experts_count = ExpertService.list_experts(limit=1000)
    service_orders_count = ServiceOrderService.list_service_orders(limit=1000)
    typeservices_count = TypeServiceService.list_type_services(limit=1000)
    
    # Últimas ordens de serviço
    recent_orders = ServiceOrderService.list_service_orders(limit=5)
    
    return render_template('admin/dashboard.html',
                         customers_count=len(customers_count),
                         experts_count=len(experts_count),
                         service_orders_count=len(service_orders_count),
                         typeservices_count=len(typeservices_count),
                         recent_orders=recent_orders)

@admin_bp.route('/customers')
def admin_customers():
    """Página de gerenciamento de clientes"""
    customers = CustomerService.list_customers()
    return render_template('admin/models/customers.html', customers=customers)

@admin_bp.route('/experts')
def admin_experts():
    """Página de gerenciamento de técnicos"""
    experts = ExpertService.list_experts()
    return render_template('admin/models/experts.html', experts=experts)

@admin_bp.route('/typeservices')
def admin_typeservices():
    """Página de gerenciamento de tipos de serviço"""
    typeservices = TypeServiceService.list_type_services()
    return render_template('admin/models/typeservices.html', typeservices=typeservices)

@admin_bp.route('/serviceorders')
def admin_serviceorders():
    """Página de gerenciamento de ordens de serviço"""
    service_orders = ServiceOrderService.list_service_orders()
    customers = CustomerService.list_customers()
    experts = ExpertService.list_experts()
    typeservices = TypeServiceService.list_type_services()
    
    # Estatísticas
    completed_orders = [so for so in service_orders if so.os_data_finalizacao]
    pending_orders = [so for so in service_orders if not so.os_data_finalizacao]
    
    return render_template('admin/models/serviceorders.html',
                         service_orders=service_orders,
                         customers=customers,
                         experts=experts,
                         typeservices=typeservices,
                         completed_orders=len(completed_orders),
                         pending_orders=len(pending_orders),
                         in_progress_orders=len(pending_orders))

# API Routes para CRUD operations
@admin_bp.route('/api/customers', methods=['GET', 'POST'])
def api_customers():
    if request.method == 'POST':
        data = request.get_json()
        customer = CustomerService.create_customer(
            cliente_nome=data['cliente_nome'],
            plano=data['plano'],
            id_contrato=data['id_contrato']
        )
        return jsonify({'success': True, 'customer': {
            'id': customer.id,
            'cliente_nome': customer.cliente_nome,
            'plano': customer.plano,
            'id_contrato': customer.id_contrato
        }})
    
    # GET - Listar clientes
    customers = CustomerService.list_customers()
    return jsonify([{
        'id': c.id,
        'cliente_nome': c.cliente_nome,
        'plano': c.plano,
        'id_contrato': c.id_contrato
    } for c in customers])

@admin_bp.route('/api/customers/<int:customer_id>', methods=['PUT', 'DELETE'])
def api_customer(customer_id):
    if request.method == 'PUT':
        data = request.get_json()
        customer = CustomerService.update_customer(customer_id, **data)
        if customer:
            return jsonify({'success': True, 'customer': {
                'id': customer.id,
                'cliente_nome': customer.cliente_nome,
                'plano': customer.plano,
                'id_contrato': customer.id_contrato
            }})
        return jsonify({'success': False, 'error': 'Cliente não encontrado'}), 404
    
    elif request.method == 'DELETE':
        success = CustomerService.delete_customer(customer_id)
        return jsonify({'success': success})

@admin_bp.route('/api/experts', methods=['GET', 'POST'])
def api_experts():
    if request.method == 'POST':
        data = request.get_json()
        expert = ExpertService.create_expert(
            nome=data['nome']
        )
        return jsonify({'success': True, 'expert': {
            'id': expert.id,
            'nome': expert.nome
        }})
    
    experts = ExpertService.list_experts()
    return jsonify([{
        'id': e.id,
        'nome': e.nome
    } for e in experts])

@admin_bp.route('/api/experts/<int:expert_id>', methods=['PUT', 'DELETE'])
def api_expert(expert_id):
    if request.method == 'PUT':
        data = request.get_json()
        expert = ExpertService.update_expert(expert_id, **data)
        if expert:
            return jsonify({'success': True, 'expert': {
                'id': expert.id,
                'nome': expert.nome
            }})
        return jsonify({'success': False, 'error': 'Técnico não encontrado'}), 404
    
    elif request.method == 'DELETE':
        success = ExpertService.delete_expert(expert_id)
        return jsonify({'success': success})

@admin_bp.route('/api/typeservices', methods=['GET', 'POST'])
def api_typeservices():
    if request.method == 'POST':
        data = request.get_json()
        type_service = TypeServiceService.create_type_service(
            name=data['name']
        )
        return jsonify({'success': True, 'type_service': {
            'id': type_service.id,
            'name': type_service.name
        }})
    
    typeservices = TypeServiceService.list_type_services()
    return jsonify([{
        'id': ts.id,
        'name': ts.name
    } for ts in typeservices])

@admin_bp.route('/api/typeservices/<int:type_service_id>', methods=['PUT', 'DELETE'])
def api_typeservice(type_service_id):
    if request.method == 'PUT':
        data = request.get_json()
        type_service = TypeServiceService.update_type_service(type_service_id, **data)
        if type_service:
            return jsonify({'success': True, 'type_service': {
                'id': type_service.id,
                'name': type_service.name
            }})
        return jsonify({'success': False, 'error': 'Tipo de serviço não encontrado'}), 404
    
    elif request.method == 'DELETE':
        success = TypeServiceService.delete_type_service(type_service_id)
        return jsonify({'success': success})

@admin_bp.route('/api/serviceorders', methods=['GET', 'POST'])
def api_serviceorders():
    if request.method == 'POST':
        data = request.get_json()
        
        # Converter datas
        os_data_agendamento = datetime.fromisoformat(data['os_data_agendamento'])
        os_data_finalizacao = datetime.fromisoformat(data['os_data_finalizacao']) if data.get('os_data_finalizacao') else None
        os_data_cadastro = datetime.fromisoformat(data['os_data_cadastro']) if data.get('os_data_cadastro') else None
        
        service_order = ServiceOrderService.create_service_order(
            os_id=data['os_id'],
            os_data_agendamento=os_data_agendamento,
            os_conteudo=data['os_conteudo'],
            os_servicoprestado=data['os_servicoprestado'],
            os_tecnico_responsavel=data['os_tecnico_responsavel'],
            customer_id=data['customer_id'],
            type_service_id=data['type_service_id'],
            os_data_finalizacao=os_data_finalizacao,
            os_data_cadastro=os_data_cadastro,
            assistants=data.get('assistants', [])
        )
        return jsonify({'success': True, 'service_order': {
            'id': service_order.id,
            'os_id': service_order.os_id,
            'os_data_agendamento': service_order.os_data_agendamento.isoformat(),
            'os_data_finalizacao': service_order.os_data_finalizacao.isoformat() if service_order.os_data_finalizacao else None,
            'os_conteudo': service_order.os_conteudo,
            'os_servicoprestado': service_order.os_servicoprestado
        }})
    
    service_orders = ServiceOrderService.list_service_orders()
    return jsonify([{
        'id': so.id,
        'os_id': so.os_id,
        'os_data_agendamento': so.os_data_agendamento.isoformat(),
        'os_data_finalizacao': so.os_data_finalizacao.isoformat() if so.os_data_finalizacao else None,
        'os_conteudo': so.os_conteudo,
        'os_servicoprestado': so.os_servicoprestado,
        'customer_id': so.customer_id,
        'os_tecnico_responsavel': so.os_tecnico_responsavel,
        'type_service_id': so.type_service_id,
        'assistants': so.get_assistants_ids()
    } for so in service_orders])

@admin_bp.route('/api/serviceorders/<int:order_id>', methods=['PUT', 'DELETE'])
def api_serviceorder(order_id):
    if request.method == 'PUT':
        data = request.get_json()
        # Converter datas se fornecidas
        if 'os_data_agendamento' in data:
            data['os_data_agendamento'] = datetime.fromisoformat(data['os_data_agendamento'])
        if 'os_data_finalizacao' in data:
            data['os_data_finalizacao'] = datetime.fromisoformat(data['os_data_finalizacao']) if data['os_data_finalizacao'] else None
        if 'os_data_cadastro' in data:
            data['os_data_cadastro'] = datetime.fromisoformat(data['os_data_cadastro']) if data['os_data_cadastro'] else None
        
        service_order = ServiceOrderService.update_service_order(order_id, **data)
        if service_order:
            return jsonify({'success': True, 'service_order': {
                'id': service_order.id,
                'os_id': service_order.os_id,
                'os_data_agendamento': service_order.os_data_agendamento.isoformat(),
                'os_data_finalizacao': service_order.os_data_finalizacao.isoformat() if service_order.os_data_finalizacao else None,
                'os_conteudo': service_order.os_conteudo,
                'os_servicoprestado': service_order.os_servicoprestado
            }})
        return jsonify({'success': False, 'error': 'Ordem de serviço não encontrada'}), 404
    
    elif request.method == 'DELETE':
        success = ServiceOrderService.delete_service_order(order_id)
        return jsonify({'success': success})

@admin_bp.route('/api/serviceorders/<int:order_id>/complete', methods=['POST'])
def api_complete_serviceorder(order_id):
    """Marca uma ordem de serviço como concluída"""
    service_order = ServiceOrderService.complete_service_order(order_id)
    if service_order:
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Ordem de serviço não encontrada'}), 404