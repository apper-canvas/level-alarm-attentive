import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import { format } from 'date-fns';

function TaskTable({ 
  tasks, 
  onEdit, 
  onDelete, 
  onStatusChange,
  contacts,
  companies,
  leads,
  deals,
  className,
  ...props 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task => {
    const searchLower = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower) ||
      getRelatedRecordName(task).toLowerCase().includes(searchLower) ||
      getUserName(task.assignedUserId).toLowerCase().includes(searchLower)
    );
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle special cases
    if (sortField === 'dueDate') {
      aValue = aValue ? new Date(aValue) : new Date('9999-12-31');
      bValue = bValue ? new Date(bValue) : new Date('9999-12-31');
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function getSortIcon(field) {
    if (sortField !== field) {
      return <ApperIcon name="ArrowUpDown" size={14} className="opacity-40" />;
    }
    return sortDirection === 'asc' 
      ? <ApperIcon name="ArrowUp" size={14} /> 
      : <ApperIcon name="ArrowDown" size={14} />;
  }

  function getRelatedRecordName(task) {
    if (!task.relatedRecordType || !task.relatedRecordId) return '-';
    
    let record;
    switch (task.relatedRecordType) {
      case 'Contact':
        record = contacts.find(c => c.Id === task.relatedRecordId);
        return record ? `${record.firstName} ${record.lastName}` : '-';
      case 'Company':
        record = companies.find(c => c.Id === task.relatedRecordId);
        return record ? record.name : '-';
      case 'Lead':
        record = leads.find(l => l.Id === task.relatedRecordId);
        return record ? `${record.firstName} ${record.lastName}` : '-';
      case 'Deal':
        record = deals.find(d => d.Id === task.relatedRecordId);
        return record ? record.title : '-';
      default:
        return '-';
    }
  }

  function getUserName(userId) {
    const users = {
      1: 'John Smith',
      2: 'Sarah Johnson',
      3: 'Michael Brown',
      4: 'Emily Davis'
    };
    return users[userId] || '-';
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return '-';
    }
  }

  function isOverdue(task) {
    if (!task.dueDate || task.status === 'Completed') return false;
    return new Date(task.dueDate) < new Date();
  }

  function getNextStatus(currentStatus) {
    switch (currentStatus) {
      case 'Not Started':
        return 'In Progress';
      case 'In Progress':
        return 'Completed';
      case 'Completed':
        return 'Not Started';
      default:
        return 'In Progress';
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search tasks..."
            className="flex-1"
          />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ApperIcon name="List" size={16} />
            {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  Task
                  {getSortIcon('title')}
                </button>
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  Priority
                  {getSortIcon('priority')}
                </button>
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  Status
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('assignedUserId')}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  Assigned User
                  {getSortIcon('assignedUserId')}
                </button>
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Related Record
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('dueDate')}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  Due Date
                  {getSortIcon('dueDate')}
                </button>
              </th>
              <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTasks.map((task) => (
              <tr 
                key={task.Id} 
                className={`hover:bg-gray-50 transition-colors ${
                  isOverdue(task) ? 'bg-red-50' : ''
                }`}
              >
                <td className="py-4 px-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </h3>
                        {isOverdue(task) && (
                          <ApperIcon name="AlertCircle" size={16} className="text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <Badge 
                    variant="secondary" 
                    className={getPriorityColor(task.priority)}
                  >
                    {task.priority}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => onStatusChange(task, getNextStatus(task.status))}
                    className="inline-flex"
                  >
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(task.status)} hover:opacity-80 cursor-pointer transition-opacity`}
                    >
                      {task.status}
                    </Badge>
                  </button>
                </td>
                <td className="py-4 px-6 text-sm text-gray-900">
                  {getUserName(task.assignedUserId)}
                </td>
                <td className="py-4 px-6">
                  {task.relatedRecordType ? (
                    <div className="text-sm">
                      <span className="text-gray-500">{task.relatedRecordType}:</span>
                      <span className="text-gray-900 ml-1">
                        {getRelatedRecordName(task)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-4 px-6 text-sm text-gray-900">
                  <div className={isOverdue(task) ? 'text-red-600 font-medium' : ''}>
                    {formatDate(task.dueDate)}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(task)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(task)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedTasks.length === 0 && (
        <div className="text-center py-12">
          <ApperIcon name="CheckSquare" size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first task.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default TaskTable;