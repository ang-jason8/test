class Todolist {
  constructor({ todo_id, title, date_due, author_id, is_completed }) {
    this.todo_id = todo_id
    this.title = title
    this.date_due = date_due
    this.is_completed = is_completed
    this.author_id = author_id
  }
}
class TodolistSpecial {
  constructor({ todo_id, title, date_due, author_id, is_completed, is_deleted }) {
    this.todo_id = todo_id
    this.title = title
    this.date_due = date_due
    this.is_completed = is_completed
    this.author_id = author_id
    this.is_deleted = is_deleted
  }
}

module.exports = (Todolist,TodolistSpecial)
