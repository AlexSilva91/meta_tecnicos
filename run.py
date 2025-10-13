from app import create_app
from app.tasks.daily_os import iniciar_scheduler

app = create_app()

if __name__ == "__main__":
    # Inicia o scheduler
    iniciar_scheduler()
    # Inicia o Flask
    app.run(debug=True, use_reloader=True)