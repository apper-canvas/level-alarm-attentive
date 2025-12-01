import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '@/components/organisms/Header';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Modal from '@/components/molecules/Modal';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import ApperIcon from '@/components/ApperIcon';
import { activityService } from '@/services/api/activityService';
import { activityTypeService } from '@/services/api/activityTypeService';
import { contactService } from '@/services/api/contactService';
import { companyService } from '@/services/api/companyService';
import { leadService } from '@/services/api/leadService';
import { dealService } from '@/services/api/dealService';
import { format } from 'date-fns';

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" }
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" }
];

const USER_FILTER_OPTIONS = [
  { value: "", label: "All Users" },
  { value: "1", label: "John Smith" },
  { value: "2", label: "Sarah Johnson" },
  { value: "3", label: "Michael Brown" },
  { value: "4", label: "Emily Davis" }
];

const PRIORITIES = [
  { value: "", label: "Select Priority" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" }
];

const STATUSES = [
  { value: "", label: "Select Status" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" }
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

const REMINDER_OPTIONS = [
  { value: "5", label: "5 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "120", label: "2 hours" },
  { value: "1440", label: "1 day" }
];

function Activities() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('scheduledDate');
  const [sortDirection, setSortDirection] = useState('asc');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activityTypeId: '',
    scheduledDate: '',
    duration: '30',
    location: '',
    notes: '',
    priority: 'Medium',
    status: 'Scheduled',
    assignedUserId: '',
    relatedRecordType: '',
    relatedRecordId: '',
    reminderEnabled: false,
    reminderMinutes: 15
  });
  const [formErrors, setFormErrors] = useState({});
  const [relatedRecords, setRelatedRecords] = useState([]);
  const [loadingRelatedRecords, setLoadingRelatedRecords] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedUser: '',
    activityType: ''
  });

  useEffect(() => {
    loadActivities();
    loadRelatedData();
    loadActivityTypes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, filters, searchTerm]);

  useEffect(() => {
    if (formData.relatedRecordType) {
      loadRelatedRecords(formData.relatedRecordType);
    } else {
      setRelatedRecords([]);
      setFormData(prev => ({ ...prev, relatedRecordId: '' }));
    }
  }, [formData.relatedRecordType]);

  async function loadActivities() {
    try {
      setLoading(true);
      setError(null);
      const activitiesData = await activityService.getAll();
      setActivities(activitiesData);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadActivityTypes() {
    try {
      const types = await activityTypeService.getActive();
      setActivityTypes(types);
    } catch (error) {
      console.error('Error loading activity types:', error);
    }
  }

  async function loadRelatedData() {
    try {
      const [contactsData, companiesData, leadsData, dealsData] = await Promise.all([
        contactService.getAll().catch(() => []),
        companyService.getAll().catch(() => []),
        leadService.getAll().catch(() => []),
        dealService.getAll().catch(() => [])
      ]);
      
      setContacts(contactsData);
      setCompanies(companiesData);
      setLeads(leadsData);
      setDeals(dealsData);
    } catch (err) {
      console.error('Error loading related data:', err);
    }
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

  function applyFilters() {
    let filtered = [...activities];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchLower) ||
        activity.description.toLowerCase().includes(searchLower) ||
        activity.notes.toLowerCase().includes(searchLower) ||
        getRelatedRecordName(activity).toLowerCase().includes(searchLower) ||
        getUserName(activity.assignedUserId).toLowerCase().includes(searchLower)
      );
    }

    // Apply other filters
    if (filters.status) {
      filtered = filtered.filter(activity => activity.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(activity => activity.priority === filters.priority);
    }
    if (filters.assignedUser) {
      filtered = filtered.filter(activity => activity.assignedUserId === parseInt(filters.assignedUser));
    }
    if (filters.activityType) {
      filtered = filtered.filter(activity => activity.activityTypeId === parseInt(filters.activityType));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'scheduledDate') {
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

    setFilteredActivities(filtered);
  }

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

  function getRelatedRecordName(activity) {
    if (!activity.relatedRecordType || !activity.relatedRecordId) return '-';
    
    let record;
    switch (activity.relatedRecordType) {
      case 'Contact':
        record = contacts.find(c => c.Id === activity.relatedRecordId);
        return record ? `${record.firstName} ${record.lastName}` : '-';
      case 'Company':
        record = companies.find(c => c.Id === activity.relatedRecordId);
        return record ? record.name : '-';
      case 'Lead':
        record = leads.find(l => l.Id === activity.relatedRecordId);
        return record ? `${record.firstName} ${record.lastName}` : '-';
      case 'Deal':
        record = deals.find(d => d.Id === activity.relatedRecordId);
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

  function getActivityTypeName(activityTypeId) {
    const type = activityTypes.find(t => t.Id === activityTypeId);
    return type ? type.name : '-';
  }

  function getActivityTypeIcon(activityTypeId) {
    const type = activityTypes.find(t => t.Id === activityTypeId);
    return type ? type.icon : 'Calendar';
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
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
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

  function isOverdue(activity) {
    if (!activity.scheduledDate || activity.status === 'Completed' || activity.status === 'Cancelled') return false;
    return new Date(activity.scheduledDate) < new Date();
  }

  function resetForm() {
    if (selectedActivity) {
      setFormData({
        title: selectedActivity.title || '',
        description: selectedActivity.description || '',
        activityTypeId: selectedActivity.activityTypeId ? selectedActivity.activityTypeId.toString() : '',
        scheduledDate: selectedActivity.scheduledDate ? new Date(selectedActivity.scheduledDate).toISOString().slice(0, 16) : '',
        duration: selectedActivity.duration ? selectedActivity.duration.toString() : '30',
        location: selectedActivity.location || '',
        notes: selectedActivity.notes || '',
        priority: selectedActivity.priority || 'Medium',
        status: selectedActivity.status || 'Scheduled',
        assignedUserId: selectedActivity.assignedUserId ? selectedActivity.assignedUserId.toString() : '',
        relatedRecordType: selectedActivity.relatedRecordType || '',
        relatedRecordId: selectedActivity.relatedRecordId ? selectedActivity.relatedRecordId.toString() : '',
        reminderEnabled: selectedActivity.reminderEnabled || false,
        reminderMinutes: selectedActivity.reminderMinutes || 15
      });
    } else {
      setFormData({
        title: '',
        description: '',
        activityTypeId: '',
        scheduledDate: '',
        duration: '30',
        location: '',
        notes: '',
        priority: 'Medium',
        status: 'Scheduled',
        assignedUserId: '',
        relatedRecordType: '',
        relatedRecordId: '',
        reminderEnabled: false,
        reminderMinutes: 15
      });
    }
    setFormErrors({});
  }

  function validateForm() {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.activityTypeId) {
      errors.activityTypeId = 'Activity type is required';
    }
    if (!formData.priority) {
      errors.priority = 'Priority is required';
    }
    if (!formData.status) {
      errors.status = 'Status is required';
    }
    if (formData.relatedRecordType && !formData.relatedRecordId) {
      errors.relatedRecordId = 'Please select a related record';
    }
    if (!formData.relatedRecordType && formData.relatedRecordId) {
      errors.relatedRecordType = 'Please select a record type';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleAddActivity() {
    setSelectedActivity(null);
    resetForm();
    setIsActivityFormOpen(true);
  }

  function handleEditActivity(activity) {
    setSelectedActivity(activity);
    resetForm();
    setIsActivityFormOpen(true);
  }

  function handleDeleteActivity(activity) {
    setSelectedActivity(activity);
    setIsDeleteModalOpen(true);
  }

  async function handleStatusChange(activity, newStatus) {
    try {
      const updatedActivity = await activityService.update(activity.Id, { status: newStatus });
      setActivities(prev => prev.map(a => a.Id === activity.Id ? updatedActivity : a));
      toast.success(`Activity status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating activity status:', error);
      toast.error('Failed to update activity status');
    }
  }

  async function confirmDelete() {
    if (!selectedActivity) return;

    try {
      setIsDeleting(true);
      await activityService.delete(selectedActivity.Id);
      setActivities(prev => prev.filter(a => a.Id !== selectedActivity.Id));
      toast.success('Activity deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error(error.message || 'Failed to delete activity');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmitActivity(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const activityData = {
        ...formData,
        activityTypeId: parseInt(formData.activityTypeId),
        assignedUserId: formData.assignedUserId ? parseInt(formData.assignedUserId) : null,
        relatedRecordId: formData.relatedRecordId ? parseInt(formData.relatedRecordId) : null,
        relatedRecordType: formData.relatedRecordType || null,
        duration: parseInt(formData.duration),
        reminderMinutes: formData.reminderEnabled ? parseInt(formData.reminderMinutes) : 15,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : null
      };

      let result;
      if (selectedActivity) {
        result = await activityService.update(selectedActivity.Id, activityData);
        setActivities(prev => prev.map(a => a.Id === selectedActivity.Id ? result : a));
        toast.success('Activity updated successfully');
      } else {
        result = await activityService.create(activityData);
        setActivities(prev => [result, ...prev]);
        toast.success('Activity created successfully');
      }

      setIsActivityFormOpen(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error('Error submitting activity:', error);
      toast.error(error.message || 'Failed to save activity');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFormChange(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }

  function handleFilterChange(filterName, value) {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }

  function clearFilters() {
    setFilters({
      status: '',
      priority: '',
      assignedUser: '',
      activityType: ''
    });
    setSearchTerm('');
  }

  function getActivityStats() {
    const total = activities.length;
    const scheduled = activities.filter(a => a.status === 'Scheduled').length;
    const inProgress = activities.filter(a => a.status === 'In Progress').length;
    const completed = activities.filter(a => a.status === 'Completed').length;
    const overdue = activities.filter(a => isOverdue(a)).length;
    
    return { total, scheduled, inProgress, completed, overdue };
  }

  function getNextStatus(currentStatus) {
    switch (currentStatus) {
      case 'Scheduled':
        return 'In Progress';
      case 'In Progress':
        return 'Completed';
      case 'Completed':
        return 'Scheduled';
      case 'Cancelled':
        return 'Scheduled';
      default:
        return 'In Progress';
    }
  }

  const hasActiveFilters = Object.values(filters).some(value => value) || searchTerm;
  const stats = getActivityStats();
  const activityTypeFilterOptions = [
    { value: "", label: "All Activity Types" },
    ...activityTypes.map(type => ({
      value: type.Id.toString(),
      label: type.name
    }))
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadActivities}
      />
    );
  }

  if (activities.length === 0 && !hasActiveFilters) {
    return (
      <div className="p-6">
        <Header
          title="Activities"
          onAddClick={handleAddActivity}
          addButtonLabel="Create Activity"
        />
        <Empty
          icon="Calendar"
          title="No activities yet"
          description="Start tracking your business activities like calls, meetings, and follow-ups."
          actionLabel="Create Activity"
          onAction={handleAddActivity}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Header
        title="Activities"
        onAddClick={handleAddActivity}
        addButtonLabel="Create Activity"
      />

      {/* Activity Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Calendar" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Clock" size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Play" size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckCircle" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="AlertCircle" size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search activities..."
            className="flex-1"
          />
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                options={STATUS_FILTER_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                options={PRIORITY_FILTER_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned User
              </label>
              <Select
                value={filters.assignedUser}
                onChange={(e) => handleFilterChange('assignedUser', e.target.value)}
                options={USER_FILTER_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Type
              </label>
              <Select
                value={filters.activityType}
                onChange={(e) => handleFilterChange('activityType', e.target.value)}
                options={activityTypeFilterOptions}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="lg:self-end"
            >
              <ApperIcon name="X" size={16} className="mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ApperIcon name="Calendar" size={16} />
            {filteredActivities.length} activit{filteredActivities.length !== 1 ? 'ies' : 'y'}
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
                    Activity
                    {getSortIcon('title')}
                  </button>
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
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
                    onClick={() => handleSort('scheduledDate')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Scheduled Date
                    {getSortIcon('scheduledDate')}
                  </button>
                </th>
                <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <tr 
                  key={activity.Id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    isOverdue(activity) ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </h3>
                          {isOverdue(activity) && (
                            <ApperIcon name="AlertCircle" size={16} className="text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        {activity.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <ApperIcon name={getActivityTypeIcon(activity.activityTypeId)} size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-900">
                        {getActivityTypeName(activity.activityTypeId)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge 
                      variant="secondary" 
                      className={getPriorityColor(activity.priority)}
                    >
                      {activity.priority}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleStatusChange(activity, getNextStatus(activity.status))}
                      className="inline-flex"
                    >
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(activity.status)} hover:opacity-80 cursor-pointer transition-opacity`}
                      >
                        {activity.status}
                      </Badge>
                    </button>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {getUserName(activity.assignedUserId)}
                  </td>
                  <td className="py-4 px-6">
                    {activity.relatedRecordType ? (
                      <div className="text-sm">
                        <span className="text-gray-500">{activity.relatedRecordType}:</span>
                        <span className="text-gray-900 ml-1">
                          {getRelatedRecordName(activity)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    <div className={isOverdue(activity) ? 'text-red-600 font-medium' : ''}>
                      {formatDate(activity.scheduledDate)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditActivity(activity)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <ApperIcon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteActivity(activity)}
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

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <ApperIcon name="Calendar" size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-500">
              {hasActiveFilters ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first activity.'}
            </p>
          </div>
        )}
      </div>

      {/* Activity Form Modal */}
      <Modal 
        isOpen={isActivityFormOpen} 
        onClose={() => {
          setIsActivityFormOpen(false);
          setSelectedActivity(null);
        }} 
        title={selectedActivity ? 'Edit Activity' : 'Create New Activity'}
        size="lg"
      >
        <form onSubmit={handleSubmitActivity} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Enter activity title"
                error={formErrors.title}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Enter activity description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Type *
              </label>
              <Select
                value={formData.activityTypeId}
                onChange={(e) => handleFormChange('activityTypeId', e.target.value)}
                options={[
                  { value: "", label: "Select Activity Type" },
                  ...activityTypes.map(type => ({
                    value: type.Id.toString(),
                    label: type.name
                  }))
                ]}
                error={formErrors.activityTypeId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date
              </label>
              <Input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => handleFormChange('scheduledDate', e.target.value)}
                error={formErrors.scheduledDate}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <Select
                value={formData.priority}
                onChange={(e) => handleFormChange('priority', e.target.value)}
                options={PRIORITIES}
                error={formErrors.priority}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <Select
                value={formData.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                options={STATUSES}
                error={formErrors.status}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => handleFormChange('duration', e.target.value)}
                placeholder="e.g., 60"
                min="5"
                max="480"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned User
              </label>
              <Select
                value={formData.assignedUserId}
                onChange={(e) => handleFormChange('assignedUserId', e.target.value)}
                options={ASSIGNED_USERS}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                placeholder="Meeting location, address, or virtual meeting link"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Record Type
              </label>
              <Select
                value={formData.relatedRecordType}
                onChange={(e) => handleFormChange('relatedRecordType', e.target.value)}
                options={RELATED_RECORD_TYPES}
                error={formErrors.relatedRecordType}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Record
              </label>
              <Select
                value={formData.relatedRecordId}
                onChange={(e) => handleFormChange('relatedRecordId', e.target.value)}
                options={[
                  { value: "", label: loadingRelatedRecords ? "Loading..." : "Select Record" },
                  ...relatedRecords
                ]}
                disabled={!formData.relatedRecordType || loadingRelatedRecords}
                error={formErrors.relatedRecordId}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="reminderEnabled"
                  checked={formData.reminderEnabled}
                  onChange={(e) => handleFormChange('reminderEnabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="reminderEnabled" className="text-sm font-medium text-gray-700">
                  Enable reminder notification
                </label>
              </div>
              
              {formData.reminderEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder time
                  </label>
                  <Select
                    value={formData.reminderMinutes.toString()}
                    onChange={(e) => handleFormChange('reminderMinutes', parseInt(e.target.value))}
                    options={REMINDER_OPTIONS}
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Additional notes or comments"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsActivityFormOpen(false);
                setSelectedActivity(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              {selectedActivity ? 'Update Activity' : 'Create Activity'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedActivity(null);
        }}
        title="Delete Activity"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete "<strong>{selectedActivity?.title}</strong>"? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedActivity(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={confirmDelete}
              isLoading={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 border-red-600"
            >
              Delete Activity
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Activities;