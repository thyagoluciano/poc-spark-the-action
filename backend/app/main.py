from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth_router
from app.routers import boards as boards_router
from app.routers import columns as columns_router
from app.routers import tasks as tasks_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kanban API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(boards_router.router)
app.include_router(columns_router.router)
app.include_router(tasks_router.router)
