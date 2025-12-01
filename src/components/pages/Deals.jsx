import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { companyService } from "@/services/api/companyService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Header from "@/components/organisms/Header";
import DealForm from "@/components/organisms/DealForm";
import Modal from "@/components/molecules/Modal";
const DEAL_STAGES = [
  { 
    value: 'Lead', 
    label: 'Lead', 
    color: 'bg-slate-100 text-slate-800',
    headerColor: 'bg-slate-500'
  },
  { 
    value: 'Qualified', 
    label: 'Qualified', 
    color: 'bg-blue-100 text-blue-800',
    headerColor: 'bg-blue-500'
  },
  { 
    value: 'Proposal', 
    label: 'Proposal', 
    color: 'bg-amber-100 text-amber-800',
    headerColor: 'bg-amber-500'
  },
  { 
    value: 'Negotiation', 
    label: 'Negotiation', 
    color: 'bg-orange-100 text-orange-800',
    headerColor: 'bg-orange-500'
  },
  { 
    value: 'Closed Won', 
    label: 'Closed Won', 
    color: 'bg-emerald-100 text-emerald-800',
    headerColor: 'bg-emerald-500'
  },
  { 
    value: 'Closed Lost', 
    label: 'Closed Lost', 
    color: 'bg-rose-100 text-rose-800',
    headerColor: 'bg-rose-500'
  }
];

const VIEW_MODES = [
  { value: 'board', label: 'Board View' },
  { value: 'list', label: 'List View' },
  { value: 'forecast', label: 'Forecast' }
];

const DEAL_SOURCES = [
  { value: '', label: 'All Sources' },
  { value: 'Inbound', label: 'Inbound' },
  { value: 'Outbound', label: 'Outbound' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Partner', label: 'Partner' },
  { value: 'Other', label: 'Other' }
];

function Deals() {
const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('board');
  const [stageFilter, setStageFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  useEffect(() => {
    loadDeals();
    loadContacts();
    loadCompanies();
  }, []);

useEffect(() => {
    applyFilters();
}, [deals, searchTerm, stageFilter, sourceFilter]);

  async function loadDeals() {
    try {
      setLoading(true);
setError(null);
      const [dealsData, contactsData, companiesData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
        companyService.getAll()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
      setCompanies(companiesData);
    } catch (err) {
      setError('Failed to load pipeline data');
      toast.error('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  }

  async function loadContacts() {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  }

  async function loadCompanies() {
    try {
      const companiesData = await companyService.getAll();
      setCompanies(companiesData);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  }

function applyFilters() {
let filtered = deals;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(deal =>
        deal.dealName.toLowerCase().includes(search) ||
        deal.description?.toLowerCase().includes(search) ||
        deal.nextStep?.toLowerCase().includes(search) ||
        getContactName(deal.contactId).toLowerCase().includes(search) ||
        getCompanyName(deal.companyId).toLowerCase().includes(search)
      );
    }

    if (stageFilter) {
      filtered = filtered.filter(deal => deal.stage === stageFilter);
    }

    if (sourceFilter) {
      filtered = filtered.filter(deal => deal.source === sourceFilter);
    }

    setFilteredDeals(filtered);
  }

function handleAddDeal(stage = 'Lead') {
    setSelectedDeal({ stage });
    setIsAddModalOpen(true);
  }

  function handleEditDeal(deal) {
    setSelectedDeal(deal);
    setIsEditModalOpen(true);
  }

  function handleDeleteDeal(deal) {
    setDealToDelete(deal);
    setIsDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!dealToDelete) return;
    
    try {
      await dealService.delete(dealToDelete.Id);
      toast.success('Deal deleted successfully');
      await loadDeals();
      setIsDeleteModalOpen(false);
      setDealToDelete(null);
    } catch (err) {
      toast.error('Failed to delete deal');
    }
  }

  async function handleSubmitDeal(dealData) {
    try {
      if (selectedDeal?.Id) {
        await dealService.update(selectedDeal.Id, dealData);
        toast.success('Deal updated successfully');
      } else {
        await dealService.create(dealData);
        toast.success('Deal created successfully');
      }
      await loadDeals();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedDeal(null);
    } catch (err) {
      toast.error(selectedDeal?.Id ? 'Failed to update deal' : 'Failed to create deal');
    }
  }


// Drag and Drop Functions
  function handleDragStart(e, deal) {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  }

  function handleDragEnd(e) {
    e.target.style.opacity = '1';
    setDraggedDeal(null);
    setDragOverStage(null);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e, stage) {
    e.preventDefault();
    setDragOverStage(stage);
  }

  function handleDragLeave(e) {
    // Only clear if we're leaving the stage column completely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverStage(null);
    }
  }

  async function handleDrop(e, targetStage) {
    e.preventDefault();
    setDragOverStage(null);
    
    if (!draggedDeal || draggedDeal.stage === targetStage) {
      setDraggedDeal(null);
      return;
    }

    const previousStage = draggedDeal.stage;

    try {
      // Optimistic update
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.Id === draggedDeal.Id 
            ? { ...deal, stage: targetStage, modifiedDate: new Date().toISOString() }
            : deal
        )
      );

      await dealService.update(draggedDeal.Id, { stage: targetStage });
      toast.success(`Deal "${draggedDeal.dealName}" moved to ${targetStage}`, {
        autoClose: 2000
      });
      
      // Reload to ensure data consistency
      await loadDeals();
    } catch (err) {
      // Revert optimistic update on error
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.Id === draggedDeal.Id 
            ? { ...deal, stage: previousStage }
            : deal
        )
      );
      toast.error('Failed to move deal');
    }
    
    setDraggedDeal(null);
  }

function getDealsForStage(stage) {
    return filteredDeals.filter(deal => deal.stage === stage);
  }

  function getStageStats(stage) {
    const stageDeals = getDealsForStage(stage);
    const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const weightedValue = stageDeals.reduce((sum, deal) => sum + (deal.amount || 0) * (deal.probability || 0) / 100, 0);
    
    return {
      count: stageDeals.length,
      totalValue,
};
  }

  function clearFilters() {
    setSearchTerm('');
    setStageFilter('');
    setStageFilter('');
    setSourceFilter('');
  }

function getContactName(contactId) {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? contact.name : 'Unknown Contact';
  }

  function getCompanyName(companyId) {
    const company = companies.find(c => c.Id === companyId);
    return company ? company.name : 'Unknown Company';
  }

  function getStageColor(stage) {
    const stageObj = DEAL_STAGES.find(s => s.value === stage);
    return stageObj ? stageObj.color : 'bg-gray-100 text-gray-800';
  }

  function getPriorityColor(priority) {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  function formatDate(dateString) {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getDaysInStage(deal) {
    if (!deal.modifiedDate) return 0;
    const daysSinceModified = Math.floor((new Date() - new Date(deal.modifiedDate)) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysSinceModified);
  }

  function getInitials(name) {
    return name
      ?.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  }

if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDeals} />;

return (
    <div className="space-y-6">
      <Header 
        title="Sales Pipeline"
        onAddClick={() => handleAddDeal()}
        addButtonLabel="New Deal"
        controls={
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="w-36"
          >
            {VIEW_MODES.map(mode => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </Select>
        }
      />

{/* Controls */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="Search deals, companies, contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80"
            />
            <Select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full sm:w-40"
            >
              <option value="">All Stages</option>
              {DEAL_STAGES.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </Select>
            <Select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full sm:w-40"
            >
              {DEAL_SOURCES.map(source => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-secondary-600">
            {filteredDeals.length} deals • Total Pipeline: {formatCurrency(filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0))}
          </div>
          <div className="text-sm text-secondary-600">
            Weighted Value: {formatCurrency(filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0) * (deal.probability || 0) / 100, 0))}
          </div>
        </div>
      </div>

{/* Pipeline Board */}
      {viewMode === 'board' && (
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
            {DEAL_STAGES.map((stage) => {
              const stageDeals = getDealsForStage(stage.value);
              const stats = getStageStats(stage.value);
              const isDragOver = dragOverStage === stage.value;
              
              return (
                <div
                  key={stage.value}
                  className={`flex flex-col min-h-[650px] rounded-lg transition-all duration-200 ${
                    isDragOver ? 'ring-2 ring-primary-500 ring-opacity-50 bg-primary-50/50' : 'bg-secondary-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, stage.value)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.value)}
                >
                  {/* Stage Header */}
                  <div className={`${stage.headerColor} text-white px-4 py-3 rounded-t-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm uppercase tracking-wide">{stage.label}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddDeal(stage.value)}
                        className="p-1 hover:bg-white/20 text-white border-white/20"
                        title={`Add deal to ${stage.label}`}
                      >
                        <ApperIcon name="Plus" size={14} />
                      </Button>
                    </div>
                    <div className="text-xs text-white/90 space-y-1">
                      <div className="flex justify-between">
                        <span>Deals:</span>
                        <span className="font-medium">{stats.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">{formatCurrency(stats.totalValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weighted:</span>
                        <span className="font-medium">{formatCurrency(stats.weightedValue)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deal Cards */}
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                    {stageDeals.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-secondary-400 text-sm">
                        <ApperIcon name="Package" size={32} className="mb-2 opacity-50" />
                        <span>No deals in this stage</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddDeal(stage.value)}
                          className="mt-2 text-secondary-500 hover:text-secondary-700"
                        >
                          <ApperIcon name="Plus" size={16} className="mr-1" />
                          Add Deal
                        </Button>
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <div
                          key={deal.Id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal)}
                          onDragEnd={handleDragEnd}
                          className={`bg-white rounded-lg border border-secondary-200 p-4 cursor-move hover:shadow-lg transition-all duration-200 group ${
                            draggedDeal?.Id === deal.Id ? 'opacity-50 scale-95' : ''
                          }`}
                          onClick={() => {
                            // Could open deal detail sidebar here
                            handleEditDeal(deal);
                          }}
                        >
                          {/* Deal Header with Actions */}
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-secondary-900 text-sm leading-5 flex-1 pr-2">
                              {deal.dealName}
                            </h4>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDeal(deal);
                                }}
                                className="p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100"
                                title="Edit deal"
                              >
                                <ApperIcon name="Edit" size={12} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDeal(deal);
                                }}
                                className="p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50"
                                title="Delete deal"
                              >
                                <ApperIcon name="Trash2" size={12} />
                              </Button>
                            </div>
                          </div>

                          {/* Company & Contact */}
                          <div className="text-xs text-secondary-600 mb-3 space-y-1">
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Building2" size={11} className="text-secondary-400" />
                              <span className="truncate">{getCompanyName(deal.companyId)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ApperIcon name="User" size={11} className="text-secondary-400" />
                              <span className="truncate">{getContactName(deal.contactId)}</span>
                            </div>
                          </div>

                          {/* Deal Value - Prominent */}
                          <div className="text-xl font-bold text-secondary-900 mb-3 text-center py-2 bg-secondary-50 rounded-lg">
                            {formatCurrency(deal.amount)}
                          </div>

                          {/* Key Metrics */}
                          <div className="space-y-2 mb-3">
                            {/* Expected Close Date */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-secondary-500 flex items-center gap-1">
                                <ApperIcon name="Calendar" size={11} />
                                Close Date:
                              </span>
                              <span className="text-secondary-700 font-medium">{formatDate(deal.closeDate)}</span>
                            </div>

                            {/* Days in Stage */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-secondary-500 flex items-center gap-1">
                                <ApperIcon name="Clock" size={11} />
                                In Stage:
                              </span>
                              <span className="text-secondary-700 font-medium">{getDaysInStage(deal)} days</span>
                            </div>

                            {/* Win Probability */}
                            {deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost' && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-secondary-500 flex items-center gap-1">
                                  <ApperIcon name="Percent" size={11} />
                                  Probability:
                                </span>
                                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                  {deal.probability}%
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Priority & Assignment */}
                          <div className="flex items-center justify-between">
                            {deal.priority && (
                              <Badge className={`${getPriorityColor(deal.priority)} text-xs px-2 py-0.5`}>
                                {deal.priority}
                              </Badge>
                            )}
                            {deal.assignedTo && (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                  {getInitials(deal.assignedTo)}
                                </div>
                                <span className="text-xs text-secondary-600 truncate max-w-16" title={deal.assignedTo}>
                                  {deal.assignedTo.split(' ')[0]}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View (Existing Table) */}
{/* List View */}
      {viewMode === 'list' && (
        filteredDeals.length === 0 ? (
          <Empty 
            title="No deals found"
            description="Create your first deal or adjust your filters"
          />
        ) : (
          <div className="bg-white rounded-lg border border-secondary-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Deal Name</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Contact</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Company</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Close Date</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Stage</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Priority</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Probability</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Days in Stage</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {filteredDeals.map((deal) => (
                    <tr key={deal.Id} className="hover:bg-secondary-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-secondary-900">{deal.dealName}</div>
                          <div className="text-sm text-secondary-500">{deal.source} • {deal.assignedTo}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        {getContactName(deal.contactId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        {getCompanyName(deal.companyId)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-secondary-900">
                          {formatCurrency(deal.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        {formatDate(deal.closeDate)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStageColor(deal.stage)}>
                          {deal.stage}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getPriorityColor(deal.priority)}>
                          {deal.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        {deal.probability}%
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        {getDaysInStage(deal)} days
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditDeal(deal)}
                            className="p-2 hover:bg-secondary-100"
                            title="Edit deal"
                          >
                            <ApperIcon name="Edit" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDeal(deal)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete deal"
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
          </div>
        )
      )}

{/* Forecast View */}
      {viewMode === 'forecast' && (
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-900">Pipeline Forecast</h3>
              <Badge className="bg-primary-100 text-primary-800 px-3 py-1">
                Weighted Analysis
              </Badge>
            </div>

            {/* Stage Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEAL_STAGES.map((stage) => {
                const stats = getStageStats(stage.value);
                const conversionRate = stats.count > 0 ? (stats.weightedValue / stats.totalValue * 100) : 0;
                
                return (
                  <div key={stage.value} className="bg-secondary-50 rounded-lg p-6 border-l-4" style={{ borderLeftColor: stage.headerColor.replace('bg-', '#') }}>
                    <h4 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.headerColor}`}></div>
                      {stage.label}
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-secondary-600">Deals Count:</span>
                        <span className="font-semibold text-lg text-secondary-900">{stats.count}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-secondary-600">Total Value:</span>
                        <span className="font-medium text-secondary-900">{formatCurrency(stats.totalValue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-secondary-600">Weighted Value:</span>
                        <span className="font-medium text-primary-600">{formatCurrency(stats.weightedValue)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-secondary-200">
                        <span className="text-secondary-600">Avg. Probability:</span>
                        <span className="font-medium text-secondary-900">{conversionRate.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Total Pipeline Summary */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-secondary-900 mb-4">Pipeline Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-900 mb-1">
                    {filteredDeals.length}
                  </div>
                  <div className="text-sm text-secondary-600">Total Deals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-900 mb-1">
                    {formatCurrency(filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0))}
                  </div>
                  <div className="text-sm text-secondary-600">Pipeline Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {formatCurrency(filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0) * (deal.probability || 0) / 100, 0))}
                  </div>
                  <div className="text-sm text-secondary-600">Weighted Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">
                    {formatCurrency(getStageStats('Closed Won').totalValue)}
                  </div>
                  <div className="text-sm text-secondary-600">Closed Won</div>
                </div>
              </div>
            </div>

            {/* Pipeline Health Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-secondary-200 rounded-lg p-4">
                <h5 className="font-medium text-secondary-900 mb-3">Top Deals by Value</h5>
                <div className="space-y-2">
                  {filteredDeals
                    .filter(deal => deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost')
                    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
                    .slice(0, 5)
                    .map(deal => (
                      <div key={deal.Id} className="flex justify-between items-center text-sm">
                        <span className="truncate text-secondary-600">{deal.dealName}</span>
                        <span className="font-medium text-secondary-900">{formatCurrency(deal.amount)}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white border border-secondary-200 rounded-lg p-4">
                <h5 className="font-medium text-secondary-900 mb-3">Deals Closing Soon</h5>
                <div className="space-y-2">
                  {filteredDeals
                    .filter(deal => deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost' && deal.closeDate)
                    .sort((a, b) => new Date(a.closeDate) - new Date(b.closeDate))
                    .slice(0, 5)
                    .map(deal => (
                      <div key={deal.Id} className="flex justify-between items-center text-sm">
                        <span className="truncate text-secondary-600">{deal.dealName}</span>
                        <span className="font-medium text-secondary-900">{formatDate(deal.closeDate)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

{/* Add Deal Modal */}
      {isAddModalOpen && (
        <DealForm
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleSubmitDeal}
          contacts={contacts}
          companies={companies}
          deal={selectedDeal}
        />
      )}

      {/* Edit Deal Modal */}
      {isEditModalOpen && (
        <DealForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleSubmitDeal}
          contacts={contacts}
          companies={companies}
          deal={selectedDeal}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Deal"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <ApperIcon name="AlertTriangle" size={20} className="text-red-600" />
            <div>
              <p className="font-medium text-red-900">
                Delete "{dealToDelete?.dealName}"?
              </p>
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone. All deal history will be permanently removed.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Deal
            </Button>
          </div>
        </div>
      </Modal>
</Modal>
    </div>
  );
}

export default Deals;