import tasksData from '@/services/mockData/tasks.json';

// Initialize storage
function initializeStorage() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(tasksData));
  }
}

// Get stored tasks
function getStoredTasks() {
  initializeStorage();
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}

// Save tasks to storage
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add delay to simulate API calls
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get all tasks
export async function getAllTasks() {
  await delay(300);
  return [...getStoredTasks()]; // Return copy to prevent external mutations
}

// Get task by ID
export async function getTaskById(id) {
  await delay(200);
  const tasks = getStoredTasks();
  const task = tasks.find(t => t.Id === parseInt(id));
  if (!task) {
    throw new Error(`Task with ID ${id} not found`);
  }
  return { ...task };
}

// Create new task
export async function createTask(taskData) {
  await delay(400);
  const tasks = getStoredTasks();
  const newId = Math.max(0, ...tasks.map(t => t.Id)) + 1;
  
  const newTask = {
    Id: newId,
    title: taskData.title || '',
    description: taskData.description || '',
    dueDate: taskData.dueDate || null,
    priority: taskData.priority || 'Medium',
    status: taskData.status || 'Not Started',
    assignedUserId: taskData.assignedUserId || null,
    relatedRecordType: taskData.relatedRecordType || null,
    relatedRecordId: taskData.relatedRecordId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  saveTasks(tasks);
  return { ...newTask };
}

// Update task
export async function updateTask(id, taskData) {
  await delay(400);
  const tasks = getStoredTasks();
  const taskIndex = tasks.findIndex(t => t.Id === parseInt(id));
  
  if (taskIndex === -1) {
    throw new Error(`Task with ID ${id} not found`);
  }
  
  const updatedTask = {
    ...tasks[taskIndex],
    ...taskData,
    Id: parseInt(id), // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  
  tasks[taskIndex] = updatedTask;
  saveTasks(tasks);
  return { ...updatedTask };
}

// Delete task
export async function deleteTask(id) {
  await delay(300);
  const tasks = getStoredTasks();
  const taskIndex = tasks.findIndex(t => t.Id === parseInt(id));
  
  if (taskIndex === -1) {
    throw new Error(`Task with ID ${id} not found`);
  }
  
  tasks.splice(taskIndex, 1);
  saveTasks(tasks);
  return true;
}

// Get tasks by status
export async function getTasksByStatus(status) {
  await delay(200);
  const tasks = getStoredTasks();
  return tasks.filter(task => task.status === status).map(task => ({ ...task }));
}

// Get tasks by assigned user
export async function getTasksByAssignedUser(userId) {
  await delay(200);
  const tasks = getStoredTasks();
  return tasks.filter(task => task.assignedUserId === parseInt(userId)).map(task => ({ ...task }));
}

// Get tasks by related record
export async function getTasksByRelatedRecord(recordType, recordId) {
  await delay(200);
  const tasks = getStoredTasks();
  return tasks.filter(task => 
    task.relatedRecordType === recordType && 
    task.relatedRecordId === parseInt(recordId)
  ).map(task => ({ ...task }));
}

export const taskService = {
  getAll: getAllTasks,
  getById: getTaskById,
  create: createTask,
  update: updateTask,
  delete: deleteTask,
  getByStatus: getTasksByStatus,
  getByAssignedUser: getTasksByAssignedUser,
  getByRelatedRecord: getTasksByRelatedRecord
};