import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Modal from '@/components/molecules/Modal';
import { contactService } from '@/services/api/contactService';
import { companyService } from '@/services/api/companyService';
import { leadService } from '@/services/api/leadService';
import { dealService } from '@/services/api/dealService';

const PRIORITIES = [
  { value: "", label: "Select Priority" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" }
];

const STATUSES = [
  { value: "", label: "Select Status" },
  { value: "Not Started", label: "Not Started" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" }
];

const ASSIGNED_USERS = [
  { value: "", label: "Select User" },
  { value: "1", label: "John Smith" },
  { value: "2", label: "Sarah Johnson" },
  { value: "3", label: "Michael Brown" },
  { value: "4", label: "Emily Davis" }
];

const RELATED_RECORD_TYPES = [
  { value: "", label: "Select Record Type" },
  { value: "Contact", label: "Contact" },
  { value: "Company", label: "Company" },
  { value: "Lead", label: "Lead" },
  { value: "Deal", label: "Deal" }
];

function TaskForm({ isOpen, onClose, onSubmit, task = null, isLoading = false }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Not Started',
    assignedUserId: '',
    relatedRecordType: '',
    relatedRecordId: ''
  });
  const [errors, setErrors] = useState({});
  const [relatedRecords, setRelatedRecords] = useState([]);
  const [loadingRelatedRecords, setLoadingRelatedRecords] = useState(false);

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, task]);

  // Load related records when record type changes
  useEffect(() => {
    if (formData.relatedRecordType) {
      loadRelatedRecords(formData.relatedRecordType);
    } else {
      setRelatedRecords([]);
      setFormData(prev => ({ ...prev, relatedRecordId: '' }));
    }
  }, [formData.relatedRecordType]);

  function resetForm() {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
        priority: task.priority || 'Medium',
        status: task.status || 'Not Started',
        assignedUserId: task.assignedUserId ? task.assignedUserId.toString() : '',
        relatedRecordType: task.relatedRecordType || '',
        relatedRecordId: task.relatedRecordId ? task.relatedRecordId.toString() : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Not Started',
        assignedUserId: '',
        relatedRecordType: '',
        relatedRecordId: ''
      });
    }
    setErrors({});
  }

  async function loadRelatedRecords(recordType) {
    setLoadingRelatedRecords(true);
    try {
      let records = [];
      switch (recordType) {
        case 'Contact':
          records = await contactService.getAll();
          break;
        case 'Company':
          records = await companyService.getAll();
          break;
        case 'Lead':
          records = await leadService.getAll();
          break;
        case 'Deal':
          records = await dealService.getAll();
          break;
      }
      
      setRelatedRecords(records.map(record => ({
        value: record.Id.toString(),
        label: getRecordLabel(record, recordType)
      })));
    } catch (error) {
      console.error('Error loading related records:', error);
      toast.error('Failed to load related records');
      setRelatedRecords([]);
    } finally {
      setLoadingRelatedRecords(false);
    }
  }

  function getRecordLabel(record, recordType) {
    switch (recordType) {
      case 'Contact':
        return `${record.firstName} ${record.lastName}`;
      case 'Company':
        return record.name;
      case 'Lead':
        return `${record.firstName} ${record.lastName} (${record.company})`;
      case 'Deal':
        return record.title;
      default:
        return 'Unknown';
    }
  }

  function validateForm() {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (formData.relatedRecordType && !formData.relatedRecordId) {
      newErrors.relatedRecordId = 'Please select a related record';
    }

    if (!formData.relatedRecordType && formData.relatedRecordId) {
      newErrors.relatedRecordType = 'Please select a record type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const taskData = {
      ...formData,
      assignedUserId: formData.assignedUserId ? parseInt(formData.assignedUserId) : null,
      relatedRecordId: formData.relatedRecordId ? parseInt(formData.relatedRecordId) : null,
      relatedRecordType: formData.relatedRecordType || null,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
    };

    await onSubmit(taskData);
  }

  function handleChange(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }

  const title = task ? 'Edit Task' : 'Create New Task';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter task title"
              error={errors.title}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter task description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <Input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              error={errors.dueDate}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <Select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              options={PRIORITIES}
              error={errors.priority}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <Select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={STATUSES}
              error={errors.status}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned User
            </label>
            <Select
              value={formData.assignedUserId}
              onChange={(e) => handleChange('assignedUserId', e.target.value)}
              options={ASSIGNED_USERS}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Record Type
            </label>
            <Select
              value={formData.relatedRecordType}
              onChange={(e) => handleChange('relatedRecordType', e.target.value)}
              options={RELATED_RECORD_TYPES}
              error={errors.relatedRecordType}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Record
            </label>
            <Select
              value={formData.relatedRecordId}
              onChange={(e) => handleChange('relatedRecordId', e.target.value)}
              options={[
                { value: "", label: loadingRelatedRecords ? "Loading..." : "Select Record" },
                ...relatedRecords
              ]}
              disabled={!formData.relatedRecordType || loadingRelatedRecords}
              error={errors.relatedRecordId}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TaskForm;