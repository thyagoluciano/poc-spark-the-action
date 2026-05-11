from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Board, Column, User
from app.schemas import ColumnCreate, ColumnResponse, ColumnUpdate

router = APIRouter(tags=["columns"])


def _get_owned_board(board_id: int, user: User, db: Session) -> Board:
    board = db.get(Board, board_id)
    if board is None or board.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Board not found"
        )
    return board


def _get_owned_column(column_id: int, user: User, db: Session) -> Column:
    column = (
        db.query(Column)
        .join(Board, Column.board_id == Board.id)
        .filter(Column.id == column_id, Board.owner_id == user.id)
        .first()
    )
    if column is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Column not found"
        )
    return column


@router.post(
    "/boards/{board_id}/columns",
    response_model=ColumnResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_column(
    board_id: int,
    body: ColumnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Column:
    board = _get_owned_board(board_id, current_user, db)
    max_pos = (
        db.query(func.max(Column.position)).filter(Column.board_id == board_id).scalar()
    )
    next_position = 0 if max_pos is None else max_pos + 1
    column = Column(title=body.title, position=next_position, board_id=board.id)
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
) -> Column:
    column = _get_owned_column(column_id, current_user, db)
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
    column = _get_owned_column(column_id, current_user, db)
    db.delete(column)
    db.commit()
