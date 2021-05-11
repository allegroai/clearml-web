export function convertStopToComplete(tasks) {
  return tasks.map(task => {
    if (task.status === 'closed') {
      task.status = 'completed';
    }
    return task;
  });
}
