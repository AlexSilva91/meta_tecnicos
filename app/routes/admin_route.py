from datetime import datetime
from flask import render_template, Blueprint, request, jsonify, redirect, url_for
from app.database import db
from app.models.customer import Customer
from app.models.expert import Expert
from app.models.type_service import TypeService
from app.models.service_order import ServiceOrder

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/')
def admin_dashboard():
    """Dashboard principal do admin"""
    customers_count = Customer.query.count()
    experts_count = Expert.query.count()
    service_orders_count = ServiceOrder.query.count()
    typeservices_count = TypeService.query.count()
    
    # Últimas ordens de serviço
    recent_orders = ServiceOrder.query.order_by(ServiceOrder.appointment_date.desc()).limit(5).all()
    
    return render_template('admin/dashboard.html',
                         customers_count=customers_count,
                         experts_count=experts_count,
                         service_orders_count=service_orders_count,
                         typeservices_count=typeservices_count,
                         recent_orders=recent_orders)

@admin_bp.route('/admin/customers')
def admin_customers():
    """Página de gerenciamento de clientes"""
    customers = Customer.query.all()
    return render_template('admin/models/customers.html', customers=customers)

@admin_bp.route('/admin/experts')
def admin_experts():
    """Página de gerenciamento de técnicos"""
    experts = Expert.query.all()
    return render_template('admin/models/experts.html', experts=experts)

@admin_bp.route('/admin/typeservices')
def admin_typeservices():
    """Página de gerenciamento de tipos de serviço"""
    typeservices = TypeService.query.all()
    return render_template('admin/models/typeservices.html', typeservices=typeservices)

@admin_bp.route('/admin/serviceorders')
def admin_serviceorders():
    """Página de gerenciamento de ordens de serviço"""
    service_orders = ServiceOrder.query.all()
    customers = Customer.query.all()
    experts = Expert.query.all()
    typeservices = TypeService.query.all()
    
    # Estatísticas
    completed_orders = ServiceOrder.query.filter(ServiceOrder.completion_date.isnot(None)).count()
    pending_orders = ServiceOrder.query.filter(ServiceOrder.completion_date.is_(None)).count()
    in_progress_orders = pending_orders  # Você pode ajustar essa lógica conforme necessário
    
    return render_template('admin/models/serviceorders.html',
                         service_orders=service_orders,
                         customers=customers,
                         experts=experts,
                         typeservices=typeservices,
                         completed_orders=completed_orders,
                         pending_orders=pending_orders,
                         in_progress_orders=in_progress_orders)
    
# API Routes para CRUD operations
@admin_bp.route('/admin/api/customers', methods=['GET', 'POST'])
def api_customers():
    if request.method == 'POST':
        # Criar novo cliente
        data = request.get_json()
        customer = Customer.create(
            name=data['name'],
            contract_id=data['contract_id'],
            internet_package=data['internet_package']
        )
        return jsonify({'success': True, 'customer': {
            'id': customer.id,
            'name': customer.name,
            'contract_id': customer.contract_id,
            'internet_package': customer.internet_package
        }})
    
    # GET - Listar clientes
    customers = Customer.query.all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'contract_id': c.contract_id,
        'internet_package': c.internet_package
    } for c in customers])

@admin_bp.route('/admin/api/customers/<int:customer_id>', methods=['PUT', 'DELETE'])
def api_customer(customer_id):
    if request.method == 'PUT':
        # Atualizar cliente
        data = request.get_json()
        customer = Customer.update(customer_id, **data)
        if customer:
            return jsonify({'success': True, 'customer': {
                'id': customer.id,
                'name': customer.name,
                'contract_id': customer.contract_id,
                'internet_package': customer.internet_package
            }})
        return jsonify({'success': False, 'error': 'Cliente não encontrado'}), 404
    
    elif request.method == 'DELETE':
        # Deletar cliente
        success = Customer.delete(customer_id)
        return jsonify({'success': success})

@admin_bp.route('/admin/api/experts', methods=['GET', 'POST'])
def api_experts():
    if request.method == 'POST':
        data = request.get_json()
        expert = Expert.create(
            name=data['name'],
            field=data['field'],
            experience_years=data['experience_years']
        )
        return jsonify({'success': True, 'expert': {
            'id': expert.id,
            'name': expert.name,
            'field': expert.field,
            'experience_years': expert.experience_years
        }})
    
    experts = Expert.query.all()
    return jsonify([{
        'id': e.id,
        'name': e.name,
        'field': e.field,
        'experience_years': e.experience_years
    } for e in experts])

@admin_bp.route('/admin/api/experts/<int:expert_id>', methods=['PUT', 'DELETE'])
def api_expert(expert_id):
    if request.method == 'PUT':
        data = request.get_json()
        expert = Expert.update(expert_id, **data)
        if expert:
            return jsonify({'success': True, 'expert': {
                'id': expert.id,
                'name': expert.name,
                'field': expert.field,
                'experience_years': expert.experience_years
            }})
        return jsonify({'success': False, 'error': 'Técnico não encontrado'}), 404
    
    elif request.method == 'DELETE':
        success = Expert.delete(expert_id)
        return jsonify({'success': success})

@admin_bp.route('/admin/api/typeservices', methods=['GET', 'POST'])
def api_typeservices():
    if request.method == 'POST':
        data = request.get_json()
        type_service = TypeService.create(
            name=data['name'],
            description=data.get('description')
        )
        return jsonify({'success': True, 'type_service': {
            'id': type_service.id,
            'name': type_service.name,
            'description': type_service.description
        }})
    
    typeservices = TypeService.query.all()
    return jsonify([{
        'id': ts.id,
        'name': ts.name,
        'description': ts.description
    } for ts in typeservices])

@admin_bp.route('/admin/api/typeservices/<int:type_service_id>', methods=['PUT', 'DELETE'])
def api_typeservice(type_service_id):
    if request.method == 'PUT':
        data = request.get_json()
        type_service = TypeService.update(type_service_id, **data)
        if type_service:
            return jsonify({'success': True, 'type_service': {
                'id': type_service.id,
                'name': type_service.name,
                'description': type_service.description
            }})
        return jsonify({'success': False, 'error': 'Tipo de serviço não encontrado'}), 404
    
    elif request.method == 'DELETE':
        success = TypeService.delete(type_service_id)
        return jsonify({'success': success})

@admin_bp.route('/admin/api/serviceorders', methods=['GET', 'POST'])
def api_serviceorders():
    if request.method == 'POST':
        data = request.get_json()
        service_order = ServiceOrder.create(
            admin_bpointment_date=datetime.fromisoformat(data['admin_bpointment_date']),
            reported_problem=data['reported_problem'],
            service_provided=data['service_provided'],
            id_OS=data['id_OS'],
            expert_id=data['expert_id'],
            type_service_id=data['type_service_id'],
            customer_id=data['customer_id'],
            completion_date=datetime.fromisoformat(data['completion_date']) if data.get('completion_date') else None
        )
        return jsonify({'success': True, 'service_order': {
            'id': service_order.id,
            'id_OS': service_order.id_OS,
            'admin_bpointment_date': service_order.admin_bpointment_date.isoformat(),
            'completion_date': service_order.completion_date.isoformat() if service_order.completion_date else None,
            'reported_problem': service_order.reported_problem,
            'service_provided': service_order.service_provided
        }})
    
    service_orders = ServiceOrder.query.all()
    return jsonify([{
        'id': so.id,
        'id_OS': so.id_OS,
        'admin_bpointment_date': so.admin_bpointment_date.isoformat(),
        'completion_date': so.completion_date.isoformat() if so.completion_date else None,
        'reported_problem': so.reported_problem,
        'service_provided': so.service_provided,
        'customer_id': so.customer_id,
        'expert_id': so.expert_id,
        'type_service_id': so.type_service_id
    } for so in service_orders])

@admin_bp.route('/admin/api/serviceorders/<int:order_id>', methods=['PUT', 'DELETE'])
def api_serviceorder(order_id):
    if request.method == 'PUT':
        data = request.get_json()
        # Converter datas se fornecidas
        if 'admin_bpointment_date' in data:
            data['admin_bpointment_date'] = datetime.fromisoformat(data['admin_bpointment_date'])
        if 'completion_date' in data:
            data['completion_date'] = datetime.fromisoformat(data['completion_date']) if data['completion_date'] else None
        
        service_order = ServiceOrder.update(order_id, **data)
        if service_order:
            return jsonify({'success': True, 'service_order': {
                'id': service_order.id,
                'id_OS': service_order.id_OS,
                'admin_bpointment_date': service_order.admin_bpointment_date.isoformat(),
                'completion_date': service_order.completion_date.isoformat() if service_order.completion_date else None,
                'reported_problem': service_order.reported_problem,
                'service_provided': service_order.service_provided
            }})
        return jsonify({'success': False, 'error': 'Ordem de serviço não encontrada'}), 404
    
    elif request.method == 'DELETE':
        success = ServiceOrder.delete(order_id)
        return jsonify({'success': success})

@admin_bp.route('/admin/api/serviceorders/<int:order_id>/complete', methods=['POST'])
def api_complete_serviceorder(order_id):
    """Marca uma ordem de serviço como concluída"""
    service_order = ServiceOrder.update(order_id, completion_date=datetime.now())
    if service_order:
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Ordem de serviço não encontrada'}), 404