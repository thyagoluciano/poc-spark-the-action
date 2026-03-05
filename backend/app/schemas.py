from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str


# User
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Task
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    position: int
    column_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskMove(BaseModel):
    column_id: int
    position: int


class TaskReorderItem(BaseModel):
    id: int
    column_id: int
    position: int


class TaskReorderRequest(BaseModel):
    tasks: list[TaskReorderItem]


# Column
class ColumnCreate(BaseModel):
    title: str


class ColumnResponse(BaseModel):
    id: int
    title: str
    position: int
    board_id: int

    model_config = {"from_attributes": True}


class ColumnWithTasksResponse(BaseModel):
    id: int
    title: str
    position: int
    tasks: list[TaskResponse]

    model_config = {"from_attributes": True}


# Board
class BoardCreate(BaseModel):
    title: str


class BoardResponse(BaseModel):
    id: int
    title: str
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class BoardDetailResponse(BaseModel):
    id: int
    title: str
    columns: list[ColumnWithTasksResponse]

    model_config = {"from_attributes": True}
