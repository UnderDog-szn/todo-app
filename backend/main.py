from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import Optional

DATABASE_URL = "sqlite:///./todos.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class TodoModel(Base):
    __tablename__ = "todos"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    priority = Column(String, default="media")
    due_date = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TodoCreate(BaseModel):
    title: str
    priority: Optional[str] = "media"
    due_date: Optional[str] = None

class TodoUpdate(BaseModel):
    completed: Optional[bool] = None
    title: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/todos")
def get_todos(db: Session = Depends(get_db)):
    return db.query(TodoModel).all()

@app.post("/todos")
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    new_todo = TodoModel(
        title=todo.title,
        priority=todo.priority,
        due_date=todo.due_date
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

@app.patch("/todos/{todo_id}")
def update_todo(todo_id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(TodoModel).filter(TodoModel.id == todo_id).first()
    if todo.completed is not None:
        db_todo.completed = todo.completed
    if todo.title is not None:
        db_todo.title = todo.title
    if todo.priority is not None:
        db_todo.priority = todo.priority
    if todo.due_date is not None:
        db_todo.due_date = todo.due_date
    db.commit()
    db.refresh(db_todo)
    return db_todo

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(TodoModel).filter(TodoModel.id == todo_id).first()
    db.delete(db_todo)
    db.commit()
    return {"message": "Eliminado"}