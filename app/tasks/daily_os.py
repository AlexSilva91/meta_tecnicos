from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from flask import current_app
import logging

from app.tasks.helpers import salvar_dados_no_banco
from app.utils.busca_OS import buscar_os, buscar_os_por_id, listar_tecnicos

logger = logging.getLogger(__name__)

# Carrega variáveis do .env
load_dotenv()

TOKEN = os.getenv("TOKEN")
APP_NAME = os.getenv("APP_NAME")
BASE_URL = os.getenv("BASE_URL")
DATA = os.getenv("OS_DATA", datetime.today().strftime("%Y-%m-%d"))
HORARIO_EXECUCAO = os.getenv("OS_EXECUTION_HOUR")

def rotina_diaria_os():
    with current_app.app_context():
        # data = DATA or datetime.today().strftime("%Y-%m-%d")
        data = DATA or (datetime.today() - timedelta(days=1)).strftime("%Y-%m-%d")
        logger.info(f"⏰ Iniciando rotina diária: {datetime.now()} (data: {data})")
        try:
            dados_tecnicos = listar_tecnicos(TOKEN, APP_NAME, f"{BASE_URL}/api/ura/tecnicos/")
            os_dados = buscar_os(TOKEN, APP_NAME, f"{BASE_URL}/api/ura/ordemservico/list/", data)

            os_ids = [os["id"] for os in os_dados.get("ordens_servicos", []) if "id" in os]
            dados_os_detalhadas = {
                str(os_id): buscar_os_por_id(TOKEN, APP_NAME, os_id, BASE_URL)
                for os_id in os_ids
            }

            resultado = salvar_dados_no_banco(dados_tecnicos, dados_os_detalhadas)
            logger.info(f"✅ Rotina diária finalizada: {resultado}")
        except Exception as e:
            logger.erro(f"❌ Erro na rotina diária: {e}")

def iniciar_scheduler(app):
    scheduler = BackgroundScheduler(timezone="America/Sao_Paulo")
    hora, minuto = map(int, HORARIO_EXECUCAO.split(":"))
    trigger = CronTrigger(hour=hora, minute=minuto)

    scheduler.add_job(
        rotina_diaria_os,
        trigger,
        id="rotina_diaria_os",
        replace_existing=True
    )

    # O scheduler precisa da app salva internamente
    scheduler.app = app

    scheduler.start()
    logger.info(f"🕒 Scheduler iniciado, rotina diária marcada para {HORARIO_EXECUCAO}")
