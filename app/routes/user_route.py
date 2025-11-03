from flask_login import current_user, login_required
from flask import jsonify, render_template, Blueprint

from app.service.dashboard_service import DashboardService

user_bp = Blueprint('user', __name__)

@user_bp.route('/dashboard-metrics')
@login_required
def dashboard_metrics():
    return render_template(
        'admin/models/dashboard_metrics.html'
    )
    
@user_bp.route('/dashboard-metrics-data')
@login_required
def dashboard_metrics_data():
    services_by_expert = DashboardService.get_services_by_expert()
    services_with_assist = DashboardService.get_services_with_assist()
    services_by_category = DashboardService.get_services_by_category()

    return jsonify({
        'servicesByExpert': services_by_expert,
        'servicesWithAssist': services_with_assist,
        'servicesByCategory': services_by_category
    })
