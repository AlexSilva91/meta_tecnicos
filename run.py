from app import create_app
from app.tasks.daily_os import iniciar_scheduler
import os

app = create_app()

if __name__ == "__main__":
    if not os.environ.get("WERKZEUG_RUN_MAIN"):
        iniciar_scheduler()
    app.run(debug=True, use_reloader=True)
