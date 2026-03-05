from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Board, BoardColumn, Task, User
from app.schemas import (
    StatusResponse,
    TaskCreate,
    TaskMove,
    TaskReorderRequest,
    TaskResponse,
    TaskUpdate,
)

router = APIRouter(tags=["tasks"])


def validate_task_ownership(task_id: int, user_id: int, db: Session) -> Task:
    task = (
        db.query(Task)
        .join(BoardColumn)
        .join(Board)
        .filter(Task.id == task_id, Board.owner_id == user_id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def validate_column_ownership(column_id: int, user_id: int, db: Session) -> BoardColumn:
    column = (
        db.query(BoardColumn)
        .join(Board)
        .filter(BoardColumn.id == column_id, Board.owner_id == user_id)
        .first()
    )
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    return column


@router.post(
    "/columns/{column_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    column_id: int,
    body: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    validate_column_ownership(column_id, current_user.id, db)

    max_position = db.query(func.max(Task.position)).filter(Task.column_id == column_id).scalar()
    next_position = (max_position + 1) if max_position is not None else 0

    task = Task(
        title=body.title,
        description=body.description,
        position=next_position,
        column_id=column_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    body: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    task = validate_task_ownership(task_id, current_user.id, db)

    if body.title is not None:
        task.title = body.title
    if body.description is not None:
        task.description = body.description

    db.commit()
    db.refresh(task)
    return task


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
    body: TaskMove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    task = validate_task_ownership(task_id, current_user.id, db)
    validate_column_ownership(body.column_id, current_user.id, db)

    origin_column_id = task.column_id
    old_position = task.position

    try:
        if origin_column_id == body.column_id:
            # Reorder within same column
            tasks_in_column = (
                db.query(Task)
                .filter(Task.column_id == origin_column_id, Task.id != task_id)
                .order_by(Task.position)
                .all()
            )
            tasks_in_column.insert(body.position, task)
            for index, t in enumerate(tasks_in_column):
                t.position = index
        else:
            # Remove from origin column: shift tasks up
            db.query(Task).filter(
                Task.column_id == origin_column_id, Task.position > old_position
            ).update({Task.position: Task.position - 1})

            # Make room in destination column: shift tasks down
            db.query(Task).filter(
                Task.column_id == body.column_id, Task.position >= body.position
            ).update({Task.position: Task.position + 1})

            task.column_id = body.column_id
            task.position = body.position

        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(task)
    return task


@router.patch("/tasks/reorder", response_model=StatusResponse)
def reorder_tasks(
    body: TaskReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StatusResponse:
    task_ids = [item.id for item in body.tasks]
    column_ids = list({item.column_id for item in body.tasks})

    # Validate ownership of all tasks in a single query
    owned_tasks = (
        db.query(Task)
        .join(BoardColumn)
        .join(Board)
        .filter(Task.id.in_(task_ids), Board.owner_id == current_user.id)
        .all()
    )

    if len(owned_tasks) != len(task_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more tasks not found",
        )

    # Validate ownership of all destination columns in a single query
    owned_columns = (
        db.query(BoardColumn)
        .join(Board)
        .filter(BoardColumn.id.in_(column_ids), Board.owner_id == current_user.id)
        .all()
    )

    if len(owned_columns) != len(column_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more destination columns not found",
        )

    task_map = {t.id: t for t in owned_tasks}

    try:
        for item in body.tasks:
            task = task_map[item.id]
            task.column_id = item.column_id
            task.position = item.position

        db.commit()
    except Exception:
        db.rollback()
        raise

    return StatusResponse(status="ok")
