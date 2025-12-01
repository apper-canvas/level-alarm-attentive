import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { companyService } from "@/services/api/companyService";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import DealForm from "@/components/organisms/DealForm";
import Header from "@/components/organisms/Header";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
const DEAL_STAGES = [
  { 
value: 'Lead', 
    label: 'Lead', 
    color: 'bg-gray-100 text-gray-800',
    headerColor: 'bg-gray-500'
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
    color: 'bg-yellow-100 text-yellow-800',
    headerColor: 'bg-yellow-500'
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
    color: 'bg-green-100 text-green-800',
    headerColor: 'bg-green-500'
  },
  { 
    value: 'Closed Lost', 
    label: 'Closed Lost', 
    color: 'bg-red-100 text-red-800',
    headerColor: 'bg-red-500'
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
      const dealsData = await dealService.getAll();
      setDeals(dealsData);
    } catch (err) {
      setError('Failed to load deals');
      toast.error('Failed to load deals');
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

  function getDealsForStage(stage) {
    return filteredDeals.filter(deal => deal.stage === stage);
  }

  function getStageStats(stage) {
    const stageDeals = getDealsForStage(stage);
    const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const weightedValue = stageDeals.reduce((sum, deal) => sum + ((deal.amount || 0) * (deal.probability || 0) / 100), 0);
    
    return {
      count: stageDeals.length,
      totalValue,
      weightedValue
    };
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
      setIsDeleteModalOpen(false);
      setDealToDelete(null);
      await loadDeals();
    } catch (err) {
      toast.error('Failed to delete deal');
    }
  }

  async function handleSubmitDeal(formData) {
    try {
if (selectedDeal && selectedDeal.Id) {
        await dealService.update(selectedDeal.Id, formData);
        toast.success('Deal updated successfully');
        setIsEditModalOpen(false);
      } else {
        await dealService.create(formData);
        toast.success('Deal created successfully');
        setIsAddModalOpen(false);
      }
      setSelectedDeal(null);
      await loadDeals();
    } catch (err) {
      toast.error(selectedDeal?.Id ? 'Failed to update deal' : 'Failed to create deal');
    }
  }

  // Drag and Drop Functions
  function handleDragStart(e, deal) {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  async function handleDrop(e, targetStage) {
    e.preventDefault();
    
    if (!draggedDeal || draggedDeal.stage === targetStage) {
      setDraggedDeal(null);
      return;
    }

    try {
      await dealService.update(draggedDeal.Id, { stage: targetStage });
      toast.success(`Deal moved to ${targetStage}`);
      await loadDeals();
    } catch (err) {
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
      weightedValue
    };
  }

  function clearFilters() {
    setSearchTerm('');
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
      minimumFractionDigits: 0
    }).format(amount);
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

function getDaysInStage(deal) {
    if (!deal.modifiedDate) return 0;
    const daysSinceModified = Math.floor((new Date() - new Date(deal.modifiedDate)) / (1000 * 60 * 60 * 24));
    return daysSinceModified;
  }


  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDeals} />;

return (
<div className="space-y-6">
<Header 
        title="Sales Pipeline"
        onAddClick={() => handleAddDeal()}
        addButtonLabel="New Deal"
      />

{/* Controls */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
<div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full sm:w-auto"
            >
              {VIEW_MODES.map(mode => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <ApperIcon name="Filter" size={16} />
              Filter
            </Button>
            <Button
              onClick={() => handleAddDeal()}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              New Deal
            </Button>
          </div>
        </div>
        <div className="text-sm text-secondary-600">
          {filteredDeals.length} deals • Total Pipeline: {formatCurrency(filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0))}
        </div>
      </div>

{/* Pipeline Board */}
{viewMode === 'board' && (
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
            {DEAL_STAGES.map((stage) => {
              const stageDeals = getDealsForStage(stage.value);
              const stats = getStageStats(stage.value);
              
              return (
                <div
                  key={stage.value}
                  className="flex flex-col min-h-[600px] bg-secondary-50 rounded-lg"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.value)}
                >
                  {/* Stage Header */}
                  <div className={`${stage.headerColor} text-white px-4 py-3 rounded-t-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{stage.label}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddDeal(stage.value)}
                        className="p-1 hover:bg-white/20 text-white"
                      >
                        <ApperIcon name="Plus" size={14} />
                      </Button>
                    </div>
                    <div className="text-xs text-white/90">
                      <div>{stats.count} deals • {formatCurrency(stats.totalValue)}</div>
                      <div>Weighted: {formatCurrency(stats.weightedValue)}</div>
                    </div>
                  </div>

                  {/* Deal Cards */}
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                    {stageDeals.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-secondary-400 text-sm">
                        No deals in this stage
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <div
                          key={deal.Id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal)}
                          className="bg-white rounded-lg border border-secondary-200 p-4 cursor-move hover:shadow-md transition-shadow duration-200 group"
                          onClick={() => handleEditDeal(deal)}
                        >
                          {/* Deal Header */}
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-secondary-900 text-sm leading-5 flex-1">
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
                                className="p-1 text-secondary-400 hover:text-secondary-600"
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
                                className="p-1 text-secondary-400 hover:text-red-600"
                              >
                                <ApperIcon name="Trash2" size={12} />
                              </Button>
                            </div>
                          </div>

                          {/* Company & Contact */}
                          <div className="text-xs text-secondary-600 mb-2">
                            <div className="truncate">{getCompanyName(deal.companyId)}</div>
                            <div className="truncate">{getContactName(deal.contactId)}</div>
                          </div>

                          {/* Deal Value */}
                          <div className="text-lg font-bold text-secondary-900 mb-2">
                            {formatCurrency(deal.amount)}
                          </div>

                          {/* Expected Close Date */}
                          <div className="text-xs text-secondary-600 mb-2">
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Calendar" size={12} />
                              <span>Close: {formatDate(deal.closeDate)}</span>
                            </div>
                          </div>

                          {/* Days in Stage */}
                          <div className="text-xs text-secondary-600 mb-2">
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Clock" size={12} />
                              <span>{getDaysInStage(deal)} days in stage</span>
                            </div>
                          </div>

                          {/* Win Probability & Priority */}
                          <div className="flex items-center justify-between">
                            {deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost' && (
                              <div className="text-xs">
                                <Badge variant="secondary" className="text-xs">
                                  {deal.probability}% win
                                </Badge>
                              </div>
                            )}
                            {deal.priority && (
                              <Badge className={getPriorityColor(deal.priority)} size="sm">
                                {deal.priority}
                              </Badge>
                            )}
                          </div>

                          {/* Assigned To Avatar */}
                          {deal.assignedTo && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {deal.assignedTo.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs text-secondary-600 truncate">
                                {deal.assignedTo}
                              </span>
                            </div>
                          )}
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
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {filteredDeals.map((deal) => (
                    <tr key={deal.Id} className="hover:bg-secondary-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-secondary-900">{deal.dealName}</div>
                          <div className="text-sm text-secondary-500">{deal.source}</div>
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditDeal(deal)}
                            className="p-2"
                          >
                            <ApperIcon name="Edit" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDeal(deal)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
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
            <h3 className="text-lg font-semibold text-secondary-900">Pipeline Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEAL_STAGES.map((stage) => {
                const stats = getStageStats(stage.value);
                
                return (
                  <div key={stage.value} className="bg-secondary-50 rounded-lg p-4">
                    <h4 className="font-medium text-secondary-900 mb-3">{stage.label}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Deals:</span>
                        <span className="font-medium">{stats.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Total Value:</span>
                        <span className="font-medium">{formatCurrency(stats.totalValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Weighted Value:</span>
                        <span className="font-medium text-primary-600">{formatCurrency(stats.weightedValue)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Total Pipeline Summary */}
            <div className="border-t border-secondary-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-900">
                    {filteredDeals.length}
                  </div>
                  <div className="text-sm text-secondary-600">Total Deals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-900">
                    {formatCurrency(filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0))}
                  </div>
                  <div className="text-sm text-secondary-600">Pipeline Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {formatCurrency(filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0) * (deal.probability || 0) / 100, 0))}
                  </div>
                  <div className="text-sm text-secondary-600">Weighted Value</div>
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
          <p className="text-secondary-600">
            Are you sure you want to delete "{dealToDelete?.dealName}"? This action cannot be undone.
          </p>
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
            >
              Delete Deal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
);
}

export default Deals;