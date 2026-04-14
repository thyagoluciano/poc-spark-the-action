from datetime import datetime

from pydantic import BaseModel, EmailStr


# ─── Auth ────────────────────────────────────────────────────────────────────


class Token(BaseModel):
    access_token: str
    token_type: str


# ─── User ────────────────────────────────────────────────────────────────────


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    email: str
    name: str


# ─── Task ────────────────────────────────────────────────────────────────────


class TaskCreate(BaseModel):
    title: str
    description: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


class TaskResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    title: str
    description: str | None
    position: int
    column_id: int
    created_at: datetime
    updated_at: datetime


class TaskMove(BaseModel):
    column_id: int
    position: int


class TaskReorderItem(BaseModel):
    id: int
    column_id: int
    position: int


class TaskReorderRequest(BaseModel):
    tasks: list[TaskReorderItem]


# ─── Column ───────────────────────────────────────────────────────────────────


class ColumnCreate(BaseModel):
    title: str


class ColumnResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    title: str
    position: int
    board_id: int


class ColumnWithTasksResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    title: str
    position: int
    tasks: list[TaskResponse]


# ─── Board ────────────────────────────────────────────────────────────────────


class BoardCreate(BaseModel):
    title: str


class BoardResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    title: str
    owner_id: int
    created_at: datetime


class BoardDetailResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    title: str
    columns: list[ColumnWithTasksResponse]
