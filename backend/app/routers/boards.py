from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Board, Column, User
from app.schemas import BoardCreate, BoardDetailResponse, BoardResponse, BoardUpdate

router = APIRouter(prefix="/boards", tags=["boards"])

DEFAULT_COLUMNS = [
    ("To Do", 0),
    ("In Progress", 1),
    ("Done", 2),
]


def _get_board_or_404(board_id: int, user_id: int, db: Session) -> Board:
    board = db.query(Board).filter(Board.id == board_id).first()
    if board is None or board.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Board not found"
        )
    return board


@router.post("", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(
    payload: BoardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BoardResponse:
    board = Board(title=payload.title, owner_id=current_user.id)
    db.add(board)
    db.flush()

    for title, position in DEFAULT_COLUMNS:
        db.add(Column(title=title, position=position, board_id=board.id))

    db.commit()
    db.refresh(board)
    return BoardResponse.model_validate(board)


@router.get("", response_model=list[BoardResponse])
def list_boards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BoardResponse]:
    boards = db.query(Board).filter(Board.owner_id == current_user.id).all()
    return [BoardResponse.model_validate(b) for b in boards]


@router.get("/{board_id}", response_model=BoardDetailResponse)
def get_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BoardDetailResponse:
    board = _get_board_or_404(board_id, current_user.id, db)
    return BoardDetailResponse.model_validate(board)


@router.put("/{board_id}", response_model=BoardResponse)
def update_board(
    board_id: int,
    payload: BoardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BoardResponse:
    board = _get_board_or_404(board_id, current_user.id, db)
    board.title = payload.title
    db.commit()
    db.refresh(board)
    return BoardResponse.model_validate(board)


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    board = _get_board_or_404(board_id, current_user.id, db)
    db.delete(board)
    db.commit()
