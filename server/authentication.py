from flask import g, session
from werkzeug.local import LocalProxy

def _get_current_task():
    if "task_id" in g:
        return g.task_id

    task_id = session.get("task_id", None)
    
    return task_id

def set_current_task(task_id):
    g.task_id = task_id
    session["task_id"] = task_id

current_task = LocalProxy(_get_current_task)
