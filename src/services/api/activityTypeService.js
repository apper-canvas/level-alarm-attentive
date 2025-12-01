import activityTypesData from '@/services/mockData/activityTypes.json';

// Initialize storage
function initializeStorage() {
  if (!localStorage.getItem('activityTypes')) {
    localStorage.setItem('activityTypes', JSON.stringify(activityTypesData));
  }
}

// Get stored activity types
function getStoredActivityTypes() {
  initializeStorage();
  return JSON.parse(localStorage.getItem('activityTypes') || '[]');
}

// Save activity types to storage
function saveActivityTypes(activityTypes) {
  localStorage.setItem('activityTypes', JSON.stringify(activityTypes));
}

// Add delay to simulate API calls
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get all activity types
export async function getAllActivityTypes() {
  await delay(200);
  return [...getStoredActivityTypes()]; // Return copy to prevent external mutations
}

// Get activity type by ID
export async function getActivityTypeById(id) {
  await delay(150);
  const activityTypes = getStoredActivityTypes();
  const activityType = activityTypes.find(at => at.Id === parseInt(id));
  if (!activityType) {
    throw new Error(`Activity type with ID ${id} not found`);
  }
  return { ...activityType };
}

// Create new activity type
export async function createActivityType(activityTypeData) {
  await delay(300);
  const activityTypes = getStoredActivityTypes();
  const newId = Math.max(0, ...activityTypes.map(at => at.Id)) + 1;
  
  const newActivityType = {
    Id: newId,
    name: activityTypeData.name || '',
    description: activityTypeData.description || '',
    icon: activityTypeData.icon || 'Calendar',
    color: activityTypeData.color || '#3b82f6',
    isCustom: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  activityTypes.push(newActivityType);
  saveActivityTypes(activityTypes);
  return { ...newActivityType };
}

// Update activity type
export async function updateActivityType(id, activityTypeData) {
  await delay(300);
  const activityTypes = getStoredActivityTypes();
  const activityTypeIndex = activityTypes.findIndex(at => at.Id === parseInt(id));
  
  if (activityTypeIndex === -1) {
    throw new Error(`Activity type with ID ${id} not found`);
  }
  
  const updatedActivityType = {
    ...activityTypes[activityTypeIndex],
    ...activityTypeData,
    Id: parseInt(id), // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  
  activityTypes[activityTypeIndex] = updatedActivityType;
  saveActivityTypes(activityTypes);
  return { ...updatedActivityType };
}

// Delete activity type (only custom types can be deleted)
export async function deleteActivityType(id) {
  await delay(250);
  const activityTypes = getStoredActivityTypes();
  const activityTypeIndex = activityTypes.findIndex(at => at.Id === parseInt(id));
  
  if (activityTypeIndex === -1) {
    throw new Error(`Activity type with ID ${id} not found`);
  }
  
  const activityType = activityTypes[activityTypeIndex];
  if (!activityType.isCustom) {
    throw new Error('Cannot delete predefined activity types');
  }
  
  activityTypes.splice(activityTypeIndex, 1);
  saveActivityTypes(activityTypes);
  return true;
}

// Get active activity types
export async function getActiveActivityTypes() {
  await delay(150);
  const activityTypes = getStoredActivityTypes();
  return activityTypes.filter(at => at.isActive).map(at => ({ ...at }));
}

// Get predefined activity types
export async function getPredefinedActivityTypes() {
  await delay(150);
  const activityTypes = getStoredActivityTypes();
  return activityTypes.filter(at => !at.isCustom).map(at => ({ ...at }));
}

// Get custom activity types
export async function getCustomActivityTypes() {
  await delay(150);
  const activityTypes = getStoredActivityTypes();
  return activityTypes.filter(at => at.isCustom).map(at => ({ ...at }));
}

// Toggle activity type status
export async function toggleActivityTypeStatus(id) {
  await delay(200);
  const activityTypes = getStoredActivityTypes();
  const activityTypeIndex = activityTypes.findIndex(at => at.Id === parseInt(id));
  
  if (activityTypeIndex === -1) {
    throw new Error(`Activity type with ID ${id} not found`);
  }
  
  activityTypes[activityTypeIndex].isActive = !activityTypes[activityTypeIndex].isActive;
  activityTypes[activityTypeIndex].updatedAt = new Date().toISOString();
  
  saveActivityTypes(activityTypes);
  return { ...activityTypes[activityTypeIndex] };
}

export const activityTypeService = {
  getAll: getAllActivityTypes,
  getById: getActivityTypeById,
  create: createActivityType,
  update: updateActivityType,
  delete: deleteActivityType,
  getActive: getActiveActivityTypes,
  getPredefined: getPredefinedActivityTypes,
  getCustom: getCustomActivityTypes,
  toggleStatus: toggleActivityTypeStatus
};