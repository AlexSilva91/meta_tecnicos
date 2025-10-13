from app.database.connection import db
from app.models.expert import Expert
from app.models.customer import Customer
from app.models.service_order import ServiceOrder
from datetime import datetime

from app.models.type_service import TypeService
from tests.busca_OS import buscar_os, buscar_os_por_id, listar_tecnicos

def salvar_dados_no_banco(dados_tecnicos, dados_os_detalhadas):
    """
    Salva os dados de técnicos, clientes e ordens de serviço no banco de dados.
    
    Args:
        dados_tecnicos: Dados dos técnicos do JSON
        dados_os_detalhadas: Dados detalhados das OS do JSON
    """
    try:
        # 1. Primeiro, salvar os técnicos
        print("💾 Salvando técnicos no banco...")
        tecnicos_salvos = salvar_tecnicos(dados_tecnicos)
        
        # 2. Salvar clientes e ordens de serviço
        print("💾 Salvando clientes e ordens de serviço...")
        ordens_salvas = salvar_ordens_servico(dados_os_detalhadas, tecnicos_salvos)
        
        print(f"✅ Dados salvos com sucesso!")
        print(f"📊 Técnicos salvos: {len(tecnicos_salvos)}")
        print(f"📊 Ordens de serviço salvas: {len(ordens_salvas)}")
        
        return {
            'tecnicos': len(tecnicos_salvos),
            'ordens_servico': len(ordens_salvas)
        }
        
    except Exception as e:
        print(f"❌ Erro ao salvar dados no banco: {e}")
        db.session.rollback()
        raise

def salvar_tecnicos(dados_tecnicos):
    """
    Salva os técnicos no banco de dados.
    
    Args:
        dados_tecnicos: Lista de técnicos do JSON
        
    Returns:
        dict: Dicionário com username -> ID do técnico salvo
    """
    tecnicos_salvos = {}
    
    if isinstance(dados_tecnicos, dict) and 'TÉCNICOS' in dados_tecnicos:
        lista_tecnicos = dados_tecnicos['TÉCNICOS']
    elif isinstance(dados_tecnicos, list):
        lista_tecnicos = dados_tecnicos
    else:
        lista_tecnicos = dados_tecnicos
    
    for tecnico_data in lista_tecnicos:
        try:
            # Usar o nome se disponível, caso contrário usar o username
            nome = tecnico_data.get('nome') or tecnico_data.get('username', '')
            
            if not nome:
                continue
                
            # Verificar se o técnico já existe
            tecnico_existente = Expert.get_by_name(nome)
            
            if tecnico_existente:
                # Atualizar se necessário
                tecnicos_salvos[tecnico_data['username']] = tecnico_existente.id
                continue
            
            # Criar novo técnico
            novo_tecnico = Expert.create(nome=nome)
            tecnicos_salvos[tecnico_data['username']] = novo_tecnico.id
            
            print(f"  👨‍💼 Técnico salvo: {nome} (ID: {novo_tecnico.id})")
            
        except Exception as e:
            print(f"  ⚠️ Erro ao salvar técnico {tecnico_data.get('username')}: {e}")
            continue
    
    return tecnicos_salvos

def salvar_ordens_servico(dados_os_detalhadas, tecnicos_salvos):
    """
    Salva clientes e ordens de serviço no banco de dados.
    
    Args:
        dados_os_detalhadas: Dados detalhados das OS
        tecnicos_salvos: Dicionário com username -> ID dos técnicos
        
    Returns:
        list: Lista de IDs das ordens de serviço salvas
    """
    ordens_salvas = []

    if not isinstance(dados_os_detalhadas, dict):
        print("❌ Formato inválido para dados de OS detalhadas")
        return ordens_salvas

    for os_id, os_data in dados_os_detalhadas.items():
        try:
            if not isinstance(os_data, dict):
                continue

            # 1️⃣ Salvar ou buscar cliente
            cliente_id = salvar_ou_buscar_cliente(os_data)
            if not cliente_id:
                print(f"  ⚠️ Não foi possível salvar cliente para OS {os_id}")
                continue

            # 2️⃣ Preparar dados
            dados_os = preparar_dados_os(os_data, tecnicos_salvos, cliente_id)
            if not dados_os:
                continue

            # 3️⃣ Verificar existência da OS
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
            from app.database import db
            db.session.rollback()
            print(f"  ❌ Erro ao salvar OS {os_id}: {e}")

    return ordens_salvas


def salvar_ou_buscar_cliente(os_data):
    """
    Salva ou busca um cliente no banco de dados.
    
    Args:
        os_data: Dados da ordem de serviço
        
    Returns:
        int: ID do cliente
    """
    try:
        contrato_id = str(os_data.get('contrato_id') or os_data.get('servico_id', ''))
        cliente_nome = os_data.get('cliente', '')
        plano = os_data.get('plano', '')
        
        if not contrato_id or not cliente_nome:
            return None
        
        # Verificar se cliente já existe
        cliente_existente = Customer.get_by_contract(contrato_id)
        if cliente_existente:
            return cliente_existente.id
        
        # Criar novo cliente
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
        # Datas
        data_agendamento = parse_datetime(os_data.get('os_data_agendamento'))
        data_cadastro = parse_datetime(os_data.get('os_data_cadastro'))
        data_finalizacao = parse_datetime(os_data.get('os_data_finalizacao'))
        
        # Técnico responsável
        tecnico_responsavel_username = os_data.get('os_tecnico_responsavel')
        tecnico_responsavel_id = tecnicos_salvos.get(tecnico_responsavel_username)
        if not tecnico_responsavel_id:
            print(f"    ⚠️ Técnico responsável não encontrado: {tecnico_responsavel_username}")
            return None
        
        # Técnicos auxiliares
        tecnicos_auxiliares = [
            tecnicos_salvos[username] 
            for username in os_data.get('os_tecnicos_auxiliares', [])
            if username in tecnicos_salvos
        ]

        # 🔹 Criar ou buscar TypeService
        motivo_descricao = os_data.get('os_motivo_descricao', '').strip()[:200]
        type_service = TypeService.get_by_name(motivo_descricao)
        if not type_service and motivo_descricao:
            type_service = TypeService.create(name=motivo_descricao)

        return {
            'os_id': str(os_data.get('os_id', '')),
            'os_data_agendamento': data_agendamento,
            'os_data_cadastro': data_cadastro,
            'os_data_finalizacao': data_finalizacao,
            'os_conteudo': os_data.get('os_conteudo', '')[:200],
            'os_servicoprestado': os_data.get('os_servicoprestado', '')[:100],
            'type_service_id': type_service.id if type_service else None,
            'os_tecnico_responsavel': tecnico_responsavel_id,
            'customer_id': cliente_id,
            'assistants': tecnicos_auxiliares
        }

    except Exception as e:
        print(f"    ⚠️ Erro ao preparar dados da OS: {e}")
        return None
def parse_datetime(data_string):
    """
    Converte string de data para objeto datetime.
    
    Args:
        data_string: String no formato ISO ou outro formato suportado
        
    Returns:
        datetime: Objeto datetime ou None
    """
    if not data_string:
        return None
    
    try:
        # Tentar parse ISO format
        if 'T' in data_string:
            return datetime.fromisoformat(data_string.replace('Z', '+00:00'))
        # Tentar outros formatos se necessário
        else:
            return datetime.strptime(data_string, "%Y-%m-%d %H:%M:%S")
    except (ValueError, TypeError):
        return None

# Função principal para integrar com suas funções existentes
def executar_e_salvar_no_banco(token: str, app: str, base_url: str, data: str = None):
    """
    Função principal que executa todas as buscas e salva no banco.
    
    Args:
        token: Token de autenticação
        app: Nome da aplicação
        base_url: URL base da API
        data: Data para filtro (opcional)
    """
    try:
        # URLs
        URL_OS = f"{base_url}/api/ura/ordemservico/list/"
        URL_TECNICOS = f"{base_url}/api/ura/tecnicos/"
        
        # 1. Buscar técnicos
        print("🔍 Buscando técnicos...")
        dados_tecnicos = listar_tecnicos(token, app, URL_TECNICOS)
        
        # 2. Buscar OS finalizadas
        print("🔍 Buscando ordens de serviço...")
        os_dados = buscar_os(token, app, URL_OS, data)
        
        # 3. Extrair IDs e buscar detalhes
        os_ids = [os["id"] for os in os_dados.get("ordens_servicos", []) if "id" in os]
        print(f"📦 Total de OS encontradas: {len(os_ids)}")
        
        # 4. Buscar detalhes das OS
        dados_os_detalhadas = {}
        for os_id in os_ids:
            detalhes = buscar_os_por_id(token, app, os_id, base_url)
            if detalhes:
                dados_os_detalhadas[str(os_id)] = detalhes
        
        # 5. Salvar tudo no banco
        resultado = salvar_dados_no_banco(dados_tecnicos, dados_os_detalhadas)
        
        return resultado
        
    except Exception as e:
        print(f"❌ Erro na execução principal: {e}")
        raise
