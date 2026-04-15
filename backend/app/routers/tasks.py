from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Board, Column, Task, User
from app.schemas import (
    TaskCreate,
    TaskMove,
    TaskReorderRequest,
    TaskResponse,
    TaskUpdate,
)

router = APIRouter(tags=["tasks"])


def validate_column_ownership(column_id: int, user_id: int, db: Session) -> Column:
    column = (
        db.query(Column)
        .join(Board)
        .filter(Column.id == column_id, Board.owner_id == user_id)
        .first()
    )
    if not column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Column not found"
        )
    return column


def validate_task_ownership(task_id: int, user_id: int, db: Session) -> Task:
    task = (
        db.query(Task)
        .join(Column)
        .join(Board)
        .filter(Task.id == task_id, Board.owner_id == user_id)
        .first()
    )
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return task


@router.post(
    "/columns/{column_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    column_id: int,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    validate_column_ownership(column_id, current_user.id, db)

    max_position = (
        db.query(func.max(Task.position)).filter(Task.column_id == column_id).scalar()
    )
    next_position = (max_position + 1) if max_position is not None else 0

    task = Task(
        title=payload.title,
        description=payload.description,
        position=next_position,
        column_id=column_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)


@router.patch("/tasks/reorder", status_code=status.HTTP_200_OK)
def reorder_tasks(
    payload: TaskReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    task_ids = [item.id for item in payload.tasks]

    tasks_in_db = (
        db.query(Task)
        .join(Column)
        .join(Board)
        .filter(Task.id.in_(task_ids), Board.owner_id == current_user.id)
        .all()
    )

    if len(tasks_in_db) != len(task_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more tasks not found or not owned by user",
        )

    tasks_by_id = {task.id: task for task in tasks_in_db}

    for item in payload.tasks:
        task = tasks_by_id[item.id]
        task.column_id = item.column_id
        task.position = item.position
        task.updated_at = datetime.now(timezone.utc)

    db.commit()
    return {"status": "ok"}


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    task = validate_task_ownership(task_id, current_user.id, db)

    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description

    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    task = validate_task_ownership(task_id, current_user.id, db)
    db.delete(task)
    db.commit()


@router.patch("/tasks/{task_id}/move", response_model=TaskResponse)
def move_task(
    task_id: int,
    payload: TaskMove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    task = validate_task_ownership(task_id, current_user.id, db)
    validate_column_ownership(payload.column_id, current_user.id, db)

    task.column_id = payload.column_id
    task.position = payload.position
    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)
