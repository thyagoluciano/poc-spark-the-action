from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Board, BoardColumn, User
from app.schemas import ColumnCreate, ColumnResponse, ColumnUpdate

router = APIRouter(tags=["columns"])


def get_owned_board(board_id: int, user: User, db: Session) -> Board:
    board = db.query(Board).filter(Board.id == board_id, Board.owner_id == user.id).first()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return board


def get_column_with_ownership(column_id: int, user: User, db: Session) -> BoardColumn:
    column = (
        db.query(BoardColumn)
        .join(Board, Board.id == BoardColumn.board_id)
        .filter(BoardColumn.id == column_id, Board.owner_id == user.id)
        .first()
    )
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    return column


@router.post("/boards/{board_id}/columns", response_model=ColumnResponse, status_code=status.HTTP_201_CREATED)
def create_column(
    board_id: int,
    body: ColumnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BoardColumn:
    get_owned_board(board_id, current_user, db)

    max_position = db.query(func.max(BoardColumn.position)).filter(
        BoardColumn.board_id == board_id
    ).scalar()
    next_position = (max_position + 1) if max_position is not None else 0

    column = BoardColumn(title=body.title, position=next_position, board_id=board_id)
    db.add(column)
    db.commit()
    db.refresh(column)
    return column


@router.put("/columns/{column_id}", response_model=ColumnResponse)
def update_column(
    column_id: int,
    body: ColumnUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BoardColumn:
    column = get_column_with_ownership(column_id, current_user, db)
    column.title = body.title
    db.commit()
    db.refresh(column)
    return column


@router.delete("/columns/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_column(
    column_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    column = get_column_with_ownership(column_id, current_user, db)
    db.delete(column)
    db.commit()
