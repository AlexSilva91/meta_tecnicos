import sys
import os
# Adiciona o diretório raiz do projeto ao caminho do Python
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from app.database.connection import db
from app.models.expert import Expert
from app.models.customer import Customer
from app.models.service_order import ServiceOrder
from datetime import datetime, timedelta
from app.models.type_service import TypeService
from tests.busca_OS import buscar_os, buscar_os_por_id, listar_tecnicos
from app import create_app  # ou de onde você cria o app

def salvar_dados_no_banco(dados_tecnicos, dados_os_detalhadas):
    try:
        print("💾 Salvando técnicos no banco...")
        tecnicos_salvos = salvar_tecnicos(dados_tecnicos)
        print("💾 Salvando clientes e ordens de serviço...")
        ordens_salvas = salvar_ordens_servico(dados_os_detalhadas, tecnicos_salvos)
        print(f"✅ Dados salvos com sucesso!")
        print(f"📊 Técnicos salvos: {len(tecnicos_salvos)}")
        print(f"📊 Ordens de serviço salvas: {len(ordens_salvas)}")
        return {'tecnicos': len(tecnicos_salvos), 'ordens_servico': len(ordens_salvas)}
    except Exception as e:
        print(f"❌ Erro ao salvar dados no banco: {e}")
        db.session.rollback()
        raise

def salvar_tecnicos(dados_tecnicos):
    tecnicos_salvos = {}
    if isinstance(dados_tecnicos, dict) and 'TÉCNICOS' in dados_tecnicos:
        lista_tecnicos = dados_tecnicos['TÉCNICOS']
    elif isinstance(dados_tecnicos, list):
        lista_tecnicos = dados_tecnicos
    else:
        lista_tecnicos = dados_tecnicos
    
    for tecnico_data in lista_tecnicos:
        try:
            nome = tecnico_data.get('nome') or tecnico_data.get('username', '')
            if not nome:
                continue
            tecnico_existente = Expert.get_by_name(nome)
            if tecnico_existente:
                tecnicos_salvos[tecnico_data['username']] = tecnico_existente.id
                continue
            novo_tecnico = Expert.create(nome=nome)
            tecnicos_salvos[tecnico_data['username']] = novo_tecnico.id
            print(f"  👨‍💼 Técnico salvo: {nome} (ID: {novo_tecnico.id})")
        except Exception as e:
            print(f"  ⚠️ Erro ao salvar técnico {tecnico_data.get('username')}: {e}")
            continue
    return tecnicos_salvos

def salvar_ordens_servico(dados_os_detalhadas, tecnicos_salvos):
    ordens_salvas = []
    if not isinstance(dados_os_detalhadas, dict):
        print("❌ Formato inválido para dados de OS detalhadas")
        return ordens_salvas
    
    for os_id, os_data in dados_os_detalhadas.items():
        try:
            if not isinstance(os_data, dict):
                continue
            cliente_id = salvar_ou_buscar_cliente(os_data)
            if not cliente_id:
                print(f"  ⚠️ Não foi possível salvar cliente para OS {os_id}")
                continue
            dados_os = preparar_dados_os(os_data, tecnicos_salvos, cliente_id)
            if not dados_os:
                continue
            os_existente = ServiceOrder.get_by_os_id(os_id)
            if os_existente:
                ServiceOrder.update(os_existente.id, **dados_os)
                ordens_salvas.append(os_existente.id)
                print(f"  🔄 OS atualizada: {os_id}")
            else:
                nova_os = ServiceOrder.create(**dados_os)
                ordens_salvas.append(nova_os.id)
                print(f"  📝 OS salva: {os_id} - Cliente: {os_data.get('cliente', 'N/A')}")
        except Exception as e:
            print(f"  ❌ Erro ao salvar OS {os_id}: {e}")
            continue
    return ordens_salvas

def salvar_ou_buscar_cliente(os_data):
    try:
        contrato_id = str(os_data.get('contrato_id') or os_data.get('servico_id', ''))
        cliente_nome = os_data.get('cliente', '')
        plano = os_data.get('plano', '')
        if not contrato_id or not cliente_nome:
            return None
        cliente_existente = Customer.get_by_contract(contrato_id)
        if cliente_existente:
            return cliente_existente.id
        novo_cliente = Customer.create(
            cliente_nome=cliente_nome,
            plano=plano,
            id_contrato=contrato_id
        )
        return novo_cliente.id
    except Exception as e:
        print(f"    ⚠️ Erro ao salvar cliente: {e}")
        return None

def preparar_dados_os(os_data, tecnicos_salvos, cliente_id):
    try:
        data_agendamento = parse_datetime(os_data.get('os_data_agendamento'))
        data_cadastro = parse_datetime(os_data.get('os_data_cadastro'))
        data_finalizacao = parse_datetime(os_data.get('os_data_finalizacao'))
        tecnico_responsavel_username = os_data.get('os_tecnico_responsavel')
        tecnico_responsavel_id = tecnicos_salvos.get(tecnico_responsavel_username)
        if not tecnico_responsavel_id:
            print(f"    ⚠️ Técnico responsável não encontrado: {tecnico_responsavel_username}")
            return None
        tecnicos_auxiliares = [
            tecnicos_salvos[username] 
            for username in os_data.get('os_tecnicos_auxiliares', [])
            if username in tecnicos_salvos
        ]
        motivo_descricao = os_data.get('os_motivo_descricao', '').strip()
        type_service = TypeService.get_by_name(motivo_descricao)
        if not type_service and motivo_descricao:
            type_service = TypeService.create(name=motivo_descricao)
        return {
            'os_id': str(os_data.get('os_id', '')),
            'os_data_agendamento': data_agendamento,
            'os_data_cadastro': data_cadastro,
            'os_data_finalizacao': data_finalizacao,
            'os_conteudo': os_data.get('os_conteudo', ''),
            'os_servicoprestado': os_data.get('os_servicoprestado', ''),
            'type_service_id': type_service.id if type_service else None,
            'os_tecnico_responsavel': tecnico_responsavel_id,
            'customer_id': cliente_id,
            'assistants': tecnicos_auxiliares
        }
    except Exception as e:
        print(f"    ⚠️ Erro ao preparar dados da OS: {e}")
        return None

def parse_datetime(data_string):
    if not data_string:
        return None
    try:
        if 'T' in data_string:
            return datetime.fromisoformat(data_string.replace('Z', '+00:00'))
        else:
            return datetime.strptime(data_string, "%Y-%m-%d %H:%M:%S")
    except (ValueError, TypeError):
        return None

def executar_e_salvar_no_banco(token: str, app: str, base_url: str, data: str = None):
    try:
        URL_OS = f"{base_url}/api/ura/ordemservico/list/"
        URL_TECNICOS = f"{base_url}/api/ura/tecnicos/"
        print("🔍 Buscando técnicos...")
        dados_tecnicos = listar_tecnicos(token, app, URL_TECNICOS)
        print(f"🔍 Buscando ordens de serviço de {data}...")
        os_dados = buscar_os(token, app, URL_OS, data)
        os_ids = [os["id"] for os in os_dados.get("ordens_servicos", []) if "id" in os]
        print(f"📦 Total de OS encontradas: {len(os_ids)}")
        dados_os_detalhadas = {}
        for os_id in os_ids:
            detalhes = buscar_os_por_id(token, app, os_id, base_url)
            if detalhes:
                dados_os_detalhadas[str(os_id)] = detalhes
        resultado = salvar_dados_no_banco(dados_tecnicos, dados_os_detalhadas)
        return resultado
    except Exception as e:
        print(f"❌ Erro na execução principal: {e}")
        raise

# -------------------------------
# Execução para os últimos 30 dias
# -------------------------------
if __name__ == "__main__":
    TOKEN = "1eb4fb6f-c527-458e-8e95-562df138de59"
    APP_NAME = "metricas"
    BASE_URL = "https://ourinet.sgplocal.com.br"
    
    app = create_app()
    with app.app_context():
        for i in range(90):
            dia = datetime.today() - timedelta(days=i)
            data_str = dia.strftime("%Y-%m-%d")
            print(f"\n📅 Processando OS para a data: {data_str}")
            resultado = executar_e_salvar_no_banco(TOKEN, APP_NAME, BASE_URL, data_str)
            print(f"🎯 Concluído para {data_str}: {resultado}")
