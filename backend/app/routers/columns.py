from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Board, Column, User
from app.schemas import ColumnCreate, ColumnResponse, ColumnUpdate

router = APIRouter(tags=["columns"])


def _get_board_or_404(board_id: int, user_id: int, db: Session) -> Board:
    board = db.query(Board).filter(Board.id == board_id).first()
    if board is None or board.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Board not found"
        )
    return board


def _get_column_or_404(column_id: int, user_id: int, db: Session) -> Column:
    column = (
        db.query(Column)
        .join(Board)
        .filter(Column.id == column_id, Board.owner_id == user_id)
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
    payload: ColumnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ColumnResponse:
    _get_board_or_404(board_id, current_user.id, db)

    max_pos = (
        db.query(func.max(Column.position)).filter(Column.board_id == board_id).scalar()
    )
    next_position = (max_pos + 1) if max_pos is not None else 0

    column = Column(title=payload.title, position=next_position, board_id=board_id)
    db.add(column)
    db.commit()
    db.refresh(column)
    return ColumnResponse.model_validate(column)


@router.put("/columns/{column_id}", response_model=ColumnResponse)
def update_column(
    column_id: int,
    payload: ColumnUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ColumnResponse:
    column = _get_column_or_404(column_id, current_user.id, db)
    column.title = payload.title
    db.commit()
    db.refresh(column)
    return ColumnResponse.model_validate(column)


@router.delete("/columns/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_column(
    column_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    column = _get_column_or_404(column_id, current_user.id, db)
    db.delete(column)
    db.commit()
