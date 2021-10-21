class Task {
  constructor({ task_id, title,detail, date_due,todo_id, author_id, is_completed }) {
    this.task_id = task_id
    this.title = title
    this.detail = detail
    this.date_due = date_due
    this.is_completed = is_completed
    this.todo_id = todo_id
    this.author_id = author_id
  }
}
class TaskSpecial {
  constructor({ task_id, title,detail, date_due,todo_id, author_id, is_completed, is_deleted }) {
    this.task_id = task_id
    this.title = title
    this.detail = detail
    this.date_due = date_due
    this.is_completed = is_completed
    this.todo_id = todo_id
    this.author_id = author_id
    this.is_deleted = is_deleted
  }
}
module.exports = (Task, TaskSpecial)
