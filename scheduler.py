from app import create_app
from app.tasks.daily_os import iniciar_scheduler

app = create_app()

if __name__ == "__main__":
    iniciar_scheduler(app)

    import time
    while True:
        time.sleep(60)