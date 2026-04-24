from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str


# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1, max_length=100)


class UserResponse(BaseModel):
    id: int
    email: str
    name: str

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Task schemas
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
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


# Column schemas
class ColumnCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)


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


# Board schemas
class BoardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)


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
