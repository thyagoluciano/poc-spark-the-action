from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Board, BoardColumn, User
from app.schemas import (
    BoardCreate,
    BoardDetailResponse,
    BoardResponse,
    BoardUpdate,
)

router = APIRouter(prefix="/boards", tags=["boards"])

DEFAULT_COLUMNS = [
    ("To Do", 0),
    ("In Progress", 1),
    ("Done", 2),
]


def get_board_or_404(board_id: int, user: User, db: Session) -> Board:
    board = db.query(Board).filter(Board.id == board_id, Board.owner_id == user.id).first()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return board


@router.post("", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(
    body: BoardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Board:
    board = Board(title=body.title, owner_id=current_user.id)
    db.add(board)
    db.flush()

    for title, position in DEFAULT_COLUMNS:
        db.add(BoardColumn(title=title, position=position, board_id=board.id))

    db.commit()
    db.refresh(board)
    return board


@router.get("", response_model=list[BoardResponse])
def list_boards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Board]:
    return db.query(Board).filter(Board.owner_id == current_user.id).all()


@router.get("/{board_id}", response_model=BoardDetailResponse)
def get_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Board:
    return get_board_or_404(board_id, current_user, db)


@router.put("/{board_id}", response_model=BoardResponse)
def update_board(
    board_id: int,
    body: BoardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Board:
    board = get_board_or_404(board_id, current_user, db)
    board.title = body.title
    db.commit()
    db.refresh(board)
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    board = get_board_or_404(board_id, current_user, db)
    db.delete(board)
    db.commit()
