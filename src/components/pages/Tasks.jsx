import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '@/components/organisms/Header';
import TaskTable from '@/components/organisms/TaskTable';
import TaskForm from '@/components/organisms/TaskForm';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Modal from '@/components/molecules/Modal';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import { taskService } from '@/services/api/taskService';
import { contactService } from '@/services/api/contactService';
import { companyService } from '@/services/api/companyService';
import { leadService } from '@/services/api/leadService';
import { dealService } from '@/services/api/dealService';

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "Not Started", label: "Not Started" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" }
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

const RELATED_RECORD_FILTER_OPTIONS = [
  { value: "", label: "All Record Types" },
  { value: "Contact", label: "Contacts" },
  { value: "Company", label: "Companies" },
  { value: "Lead", label: "Leads" },
  { value: "Deal", label: "Deals" }
];

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedUser: '',
    relatedRecordType: ''
  });

  useEffect(() => {
    loadTasks();
    loadRelatedData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskService.getAll();
      setTasks(tasksData);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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

  function applyFilters() {
    let filtered = [...tasks];

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.assignedUser) {
      filtered = filtered.filter(task => task.assignedUserId === parseInt(filters.assignedUser));
    }

    if (filters.relatedRecordType) {
      filtered = filtered.filter(task => task.relatedRecordType === filters.relatedRecordType);
    }

    setFilteredTasks(filtered);
  }

  function handleAddTask() {
    setSelectedTask(null);
    setIsTaskFormOpen(true);
  }

  function handleEditTask(task) {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  }

  function handleDeleteTask(task) {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  }

  async function handleStatusChange(task, newStatus) {
    try {
      const updatedTask = await taskService.update(task.Id, { status: newStatus });
      setTasks(prev => prev.map(t => t.Id === task.Id ? updatedTask : t));
      toast.success(`Task status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  }

  async function confirmDelete() {
    if (!selectedTask) return;

    try {
      setIsDeleting(true);
      await taskService.delete(selectedTask.Id);
      setTasks(prev => prev.filter(t => t.Id !== selectedTask.Id));
      toast.success('Task deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmitTask(taskData) {
    try {
      setIsSubmitting(true);
      let result;

      if (selectedTask) {
        result = await taskService.update(selectedTask.Id, taskData);
        setTasks(prev => prev.map(t => t.Id === selectedTask.Id ? result : t));
        toast.success('Task updated successfully');
      } else {
        result = await taskService.create(taskData);
        setTasks(prev => [result, ...prev]);
        toast.success('Task created successfully');
      }

      setIsTaskFormOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error(error.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
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
      relatedRecordType: ''
    });
  }

  function getTaskStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;
    
    return { total, completed, inProgress, overdue };
  }

  const hasActiveFilters = Object.values(filters).some(value => value);
  const stats = getTaskStats();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadTasks}
      />
    );
  }

  if (tasks.length === 0 && !hasActiveFilters) {
    return (
      <div className="p-6">
        <Header
          title="Tasks"
          onAddClick={handleAddTask}
          addButtonLabel="Create Task"
        />
        <Empty
          icon="CheckSquare"
          title="No tasks yet"
          description="Get organized by creating your first task to track your activities and deadlines."
          actionLabel="Create Task"
          onAction={handleAddTask}
        />
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onSubmit={handleSubmitTask}
          task={selectedTask}
          isLoading={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Header
        title="Tasks"
        onAddClick={handleAddTask}
        addButtonLabel="Create Task"
      />

      {/* Task Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckSquare" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Clock" size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
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

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
                Related Record
              </label>
              <Select
                value={filters.relatedRecordType}
                onChange={(e) => handleFilterChange('relatedRecordType', e.target.value)}
                options={RELATED_RECORD_FILTER_OPTIONS}
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

      {/* Tasks Table */}
      <TaskTable
        tasks={filteredTasks}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
        contacts={contacts}
        companies={companies}
        leads={leads}
        deals={deals}
      />

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleSubmitTask}
        task={selectedTask}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTask(null);
        }}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete "<strong>{selectedTask?.title}</strong>"? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedTask(null);
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
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Tasks;