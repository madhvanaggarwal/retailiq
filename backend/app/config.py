import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"

MODELS_DIR = DATA_DIR / "models"
OUTPUTS_DIR = DATA_DIR / "outputs"
RAW_DIR = DATA_DIR / "raw"
FIGURES_DIR = DATA_DIR / "figures"
DB_PATH = BASE_DIR / "backend" / "app" / "db" / "retailiq.db"
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

# Port configuration
PORT = int(os.environ.get("PORT", 8000))
HOST = os.environ.get("HOST", "127.0.0.1")

# CORS Configuration
raw_origins = os.environ.get("CORS_ORIGINS", "*")
CORS_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]
