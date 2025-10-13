import requests
import json
from datetime import datetime

# ----------------- Função genérica para salvar JSON ----------------- #
def salvar_json(dados, arquivo: str):
    """
    Salva os dados em um arquivo JSON.
    """
    with open(arquivo, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=4)
    print(f"✅ Dados salvos em {arquivo}")

# ----------------- Funções para O.S. ----------------- #
def buscar_os(token: str, app: str, url: str, data: str = None, limit: int = 1000):
    if data is None:
        data = datetime.today().strftime("%Y-%m-%d")
    else:
        datetime.strptime(data, "%Y-%m-%d")

    payload = {
        "app": app,
        "token": token,
        "offset": 0,
        "limit": limit,
        "status": 1,  # 1 = Encerrada
        "data_finalizacao_inicio": data,
        "data_finalizacao_fim": data
    }

    response = requests.post(url, data=payload)
    response.raise_for_status()
    return response.json()

def executar_os(token: str, app: str, url: str, arquivo: str, data: str = None):
    dados = buscar_os(token, app, url, data)
    salvar_json(dados, arquivo)
    return dados  # Retorna para extração de IDs

# ----------------- Funções para Ocorrências ----------------- #
def buscar_ocorrencias(token: str, app: str, url: str, data: str = None, limit: int = 1000):
    if data is None:
        data = datetime.today().strftime("%Y-%m-%d")
    else:
        datetime.strptime(data, "%Y-%m-%d")

    payload = {
        "app": app,
        "token": token,
        "offset": 0,
        "limit": limit,
        "status": 1,
        "data_finalizacao_inicio": data,
        "data_finalizacao_fim": data
    }

    response = requests.post(url, data=payload)
    response.raise_for_status()
    return response.json()

def executar_ocorrencias(token: str, app: str, url: str, arquivo: str, data: str = None):
    dados = buscar_ocorrencias(token, app, url, data)
    salvar_json(dados, arquivo)

# ----------------- Funções para Técnicos ----------------- #
def listar_tecnicos(token: str, app: str, url: str):
    payload = {
        "app": app,
        "token": token
    }

    response = requests.post(url, data=payload)
    response.raise_for_status()
    return response.json()

def executar_tecnicos(token: str, app: str, url: str, arquivo: str):
    dados = listar_tecnicos(token, app, url)
    salvar_json(dados, arquivo)

# ----------------- NOVO: Buscar detalhes por OS_ID ----------------- #
def buscar_os_por_id(token: str, app: str, os_id: int, base_url: str):
    url = f"{base_url}/api/os/list/id/{os_id}"
    payload = {
        "app": app,
        "token": token
    }

    response = requests.post(url, json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Erro ao buscar OS {os_id}: {response.status_code}")
        return None

def executar_busca_os_ids(token: str, app: str, base_url: str, os_ids: list, arquivo_saida: str):
    resultados = {}
    for os_id in os_ids:
        print(f"🔎 Buscando detalhes da OS {os_id}...")
        dados = buscar_os_por_id(token, app, os_id, base_url)
        if dados:
            resultados[os_id] = dados

    salvar_json(resultados, arquivo_saida)

# ----------------- Execução principal ----------------- #
if __name__ == "__main__":
    TOKEN = "1eb4fb6f-c527-458e-8e95-562df138de59"
    APP = "metricas"
    DATA_DESEJADA = "2025-09-17"

    BASE_URL = "https://ourinet.sgplocal.com.br"
    URL_OS = f"{BASE_URL}/api/ura/ordemservico/list/"
    URL_OCORRENCIA = f"{BASE_URL}/api/ura/ocorrencia/list/"
    URL_TECNICOS = f"{BASE_URL}/api/ura/tecnicos/"

    # 1️⃣ Buscar e salvar O.S. finalizadas
    os_dados = executar_os(TOKEN, APP, URL_OS, "os_finalizadas.json", DATA_DESEJADA)

    # 2️⃣ Extrair os_ids da chave "ordens_servicos"
    os_ids = [os["id"] for os in os_dados.get("ordens_servicos", []) if "id" in os]
    print(f"📦 Total de OS finalizadas encontradas: {len(os_ids)}")

    # 3️⃣ Buscar detalhes por OS_ID e salvar
    executar_busca_os_ids(TOKEN, APP, BASE_URL, os_ids, "os_detalhadas_por_id.json")

    # 4️⃣ Buscar e salvar Ocorrências
    executar_ocorrencias(TOKEN, APP, URL_OCORRENCIA, "ocorrencias_finalizadas.json", DATA_DESEJADA)

    # 5️⃣ Listar e salvar Técnicos
    executar_tecnicos(TOKEN, APP, URL_TECNICOS, "tecnicos.json")
