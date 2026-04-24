from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    boards: Mapped[list["Board"]] = relationship(
        "Board", back_populates="owner", cascade="all, delete-orphan"
    )


class Board(Base):
    __tablename__ = "boards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    owner_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    owner: Mapped["User"] = relationship("User", back_populates="boards")
    columns: Mapped[list["Column"]] = relationship(
        "Column",
        back_populates="board",
        cascade="all, delete-orphan",
        order_by="Column.position",
    )


class Column(Base):
    __tablename__ = "columns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    board_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("boards.id"), nullable=False
    )

    board: Mapped["Board"] = relationship("Board", back_populates="columns")
    tasks: Mapped[list["Task"]] = relationship(
        "Task",
        back_populates="column",
        cascade="all, delete-orphan",
        order_by="Task.position",
    )


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    column_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("columns.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    # Must be set explicitly on every UPDATE operation
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    column: Mapped["Column"] = relationship("Column", back_populates="tasks")
