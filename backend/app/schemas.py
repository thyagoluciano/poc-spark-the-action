from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str


class RegisterResponse(BaseModel):
    id: int
    email: str
    name: str
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
    title: str = Field(min_length=1)
    description: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1)
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
    position: int = Field(ge=0)


class TaskReorderItem(BaseModel):
    id: int
    column_id: int
    position: int = Field(ge=0)


class TaskReorderRequest(BaseModel):
    tasks: list[TaskReorderItem] = Field(min_length=1)


class StatusResponse(BaseModel):
    status: str


# Column
class ColumnCreate(BaseModel):
    title: str = Field(min_length=1)


class ColumnUpdate(BaseModel):
    title: str = Field(min_length=1)


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
    title: str = Field(min_length=1)


class BoardUpdate(BaseModel):
    title: str = Field(min_length=1)


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
