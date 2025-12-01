import activitiesData from '@/services/mockData/activities.json';

// Initialize storage
function initializeStorage() {
  if (!localStorage.getItem('activities')) {
    localStorage.setItem('activities', JSON.stringify(activitiesData));
  }
}

// Get stored activities
function getStoredActivities() {
  initializeStorage();
  return JSON.parse(localStorage.getItem('activities') || '[]');
}

// Save activities to storage
function saveActivities(activities) {
  localStorage.setItem('activities', JSON.stringify(activities));
}

// Add delay to simulate API calls
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get all activities
export async function getAllActivities() {
  await delay(300);
  return [...getStoredActivities()]; // Return copy to prevent external mutations
}

// Get activity by ID
export async function getActivityById(id) {
  await delay(200);
  const activities = getStoredActivities();
  const activity = activities.find(a => a.Id === parseInt(id));
  if (!activity) {
    throw new Error(`Activity with ID ${id} not found`);
  }
  return { ...activity };
}

// Create new activity
export async function createActivity(activityData) {
  await delay(400);
  const activities = getStoredActivities();
  const newId = Math.max(0, ...activities.map(a => a.Id)) + 1;
  
  const newActivity = {
    Id: newId,
    title: activityData.title || '',
    description: activityData.description || '',
    activityTypeId: activityData.activityTypeId || null,
    scheduledDate: activityData.scheduledDate || null,
    duration: activityData.duration || 30, // Default 30 minutes
    location: activityData.location || '',
    notes: activityData.notes || '',
    priority: activityData.priority || 'Medium',
    status: activityData.status || 'Scheduled',
    assignedUserId: activityData.assignedUserId || null,
    relatedRecordType: activityData.relatedRecordType || null,
    relatedRecordId: activityData.relatedRecordId || null,
    reminderEnabled: activityData.reminderEnabled || false,
    reminderMinutes: activityData.reminderMinutes || 15,
    outcome: activityData.outcome || '',
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  activities.push(newActivity);
  saveActivities(activities);
  return { ...newActivity };
}

// Update activity
export async function updateActivity(id, activityData) {
  await delay(400);
  const activities = getStoredActivities();
  const activityIndex = activities.findIndex(a => a.Id === parseInt(id));
  
  if (activityIndex === -1) {
    throw new Error(`Activity with ID ${id} not found`);
  }
  
  // Handle status change to completed
  const updatedActivity = {
    ...activities[activityIndex],
    ...activityData,
    Id: parseInt(id), // Ensure ID doesn't change
    completedAt: activityData.status === 'Completed' && activities[activityIndex].status !== 'Completed' 
      ? new Date().toISOString() 
      : activities[activityIndex].completedAt,
    updatedAt: new Date().toISOString()
  };
  
  activities[activityIndex] = updatedActivity;
  saveActivities(activities);
  return { ...updatedActivity };
}

// Delete activity
export async function deleteActivity(id) {
  await delay(300);
  const activities = getStoredActivities();
  const activityIndex = activities.findIndex(a => a.Id === parseInt(id));
  
  if (activityIndex === -1) {
    throw new Error(`Activity with ID ${id} not found`);
  }
  
  activities.splice(activityIndex, 1);
  saveActivities(activities);
  return true;
}

// Get activities by status
export async function getActivitiesByStatus(status) {
  await delay(200);
  const activities = getStoredActivities();
  return activities.filter(activity => activity.status === status).map(activity => ({ ...activity }));
}

// Get activities by activity type
export async function getActivitiesByType(activityTypeId) {
  await delay(200);
  const activities = getStoredActivities();
  return activities.filter(activity => activity.activityTypeId === parseInt(activityTypeId)).map(activity => ({ ...activity }));
}

// Get activities by assigned user
export async function getActivitiesByAssignedUser(userId) {
  await delay(200);
  const activities = getStoredActivities();
  return activities.filter(activity => activity.assignedUserId === parseInt(userId)).map(activity => ({ ...activity }));
}

// Get activities by related record
export async function getActivitiesByRelatedRecord(recordType, recordId) {
  await delay(200);
  const activities = getStoredActivities();
  return activities.filter(activity => 
    activity.relatedRecordType === recordType && 
    activity.relatedRecordId === parseInt(recordId)
  ).map(activity => ({ ...activity }));
}

// Get activities by date range
export async function getActivitiesByDateRange(startDate, endDate) {
  await delay(200);
  const activities = getStoredActivities();
  return activities.filter(activity => {
    if (!activity.scheduledDate) return false;
    const activityDate = new Date(activity.scheduledDate);
    return activityDate >= new Date(startDate) && activityDate <= new Date(endDate);
  }).map(activity => ({ ...activity }));
}

// Get overdue activities
export async function getOverdueActivities() {
  await delay(200);
  const activities = getStoredActivities();
  const now = new Date();
  return activities.filter(activity => 
    activity.scheduledDate && 
    new Date(activity.scheduledDate) < now && 
    activity.status !== 'Completed'
  ).map(activity => ({ ...activity }));
}

export const activityService = {
  getAll: getAllActivities,
  getById: getActivityById,
  create: createActivity,
  update: updateActivity,
  delete: deleteActivity,
  getByStatus: getActivitiesByStatus,
  getByType: getActivitiesByType,
  getByAssignedUser: getActivitiesByAssignedUser,
  getByRelatedRecord: getActivitiesByRelatedRecord,
  getByDateRange: getActivitiesByDateRange,
  getOverdue: getOverdueActivities
};