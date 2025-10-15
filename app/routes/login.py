from flask import Blueprint, render_template, request, jsonify, redirect, url_for
from flask_login import login_user, logout_user, login_required, current_user
from app.service.auth_service import AuthService

login_bp = Blueprint('login', __name__)

@login_bp.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        # Se já estiver logado, redireciona para o dashboard
        if current_user.is_authenticated:
            return redirect(url_for('admin.admin_dashboard'))
        return render_template('login.html')

    elif request.method == 'POST':
        try:
            data = request.get_json()
            login_hash = data.get('login_hash', '').strip()
            password = data.get('password', '')

            if not login_hash or not password:
                return jsonify({
                    'success': False,
                    'message': 'Login e senha são obrigatórios'
                }), 400

            # Autentica o usuário
            auth_result = AuthService.authenticate(login_hash, password)

            if auth_result['success']:
                user = auth_result['user']

                # Chama login_user do Flask-Login
                login_user(user)

                # Retorna dados extras para o frontend (opcional)
                user_data = AuthService.get_user_session_data(user)

                return jsonify({
                    'success': True,
                    'message': 'Login realizado com sucesso!',
                    'redirect_url': url_for('admin.admin_dashboard'),
                    'user': user_data
                })
            else:
                return jsonify({
                    'success': False,
                    'message': auth_result['message']
                }), 401

        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Erro interno do servidor: {str(e)}'
            }), 500


@login_bp.route('/logout')
@login_required
def logout():
    """Finaliza a sessão do usuário."""
    logout_user()  # limpa o login do Flask-Login
    return redirect(url_for('login.login'))
