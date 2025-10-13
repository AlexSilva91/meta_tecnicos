from datetime import datetime
import os
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app import create_app
from app.tasks.helpers import salvar_dados_no_banco
from app.utils.busca_OS import buscar_os, buscar_os_por_id, listar_tecnicos

# Carrega variáveis do .env
load_dotenv()

# Configurações principais do .env
TOKEN = os.getenv("OS_API_TOKEN")
APP_NAME = os.getenv("OS_APP_NAME")
BASE_URL = os.getenv("OS_BASE_URL")
DATA = os.getenv("OS_DATA", datetime.today().strftime("%Y-%m-%d"))
HORARIO_EXECUCAO = os.getenv("OS_EXECUTION_HOUR")  

app = create_app()

def rotina_diaria_os():
    """
    Função que executa a rotina diária de buscar e salvar OS.
    """
    with app.app_context():
        data = DATA or datetime.today().strftime("%Y-%m-%d")
        print(f"⏰ Iniciando rotina diária: {datetime.now()} (data: {data})")
        try:
            # 1. Buscar técnicos
            dados_tecnicos = listar_tecnicos(TOKEN, APP_NAME, f"{BASE_URL}/api/ura/tecnicos/")
            # 2. Buscar OS
            os_dados = buscar_os(TOKEN, APP_NAME, f"{BASE_URL}/api/ura/ordemservico/list/", data)
            # 3. Extrair IDs e buscar detalhes
            os_ids = [os["id"] for os in os_dados.get("ordens_servicos", []) if "id" in os]
            dados_os_detalhadas = {}
            for os_id in os_ids:
                detalhes = buscar_os_por_id(TOKEN, APP_NAME, os_id, BASE_URL)
                if detalhes:
                    dados_os_detalhadas[str(os_id)] = detalhes
            # 4. Salvar no banco
            resultado = salvar_dados_no_banco(dados_tecnicos, dados_os_detalhadas)
            print(f"✅ Rotina diária finalizada: {resultado}")
        except Exception as e:
            print(f"❌ Erro na rotina diária: {e}")

def iniciar_scheduler():
    """
    Inicializa o APScheduler para executar a rotina diariamente.
    """
    scheduler = BackgroundScheduler(timezone="America/Sao_Paulo")
    hora, minuto = map(int, HORARIO_EXECUCAO.split(":"))
    trigger = CronTrigger(hour=hora, minute=minuto)
    scheduler.add_job(rotina_diaria_os, trigger, id="rotina_diaria_os", replace_existing=True)
    scheduler.start()
    print(f"🕒 Scheduler iniciado, rotina diária marcada para {HORARIO_EXECUCAO}")
