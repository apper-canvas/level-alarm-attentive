import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '@/components/organisms/Header';
import DealForm from '@/components/organisms/DealForm';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Modal from '@/components/molecules/Modal';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { dealService } from '@/services/api/dealService';
import { contactService } from '@/services/api/contactService';
import { companyService } from '@/services/api/companyService';

const DEAL_STAGES = [
  { value: '', label: 'All Stages' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Proposal', label: 'Proposal' },
  { value: 'Negotiation', label: 'Negotiation' },
  { value: 'Closed Won', label: 'Closed Won' },
  { value: 'Closed Lost', label: 'Closed Lost' }
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
  const [stageFilter, setStageFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);

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
        deal.nextStep?.toLowerCase().includes(search)
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

  function handleAddDeal() {
    setSelectedDeal(null);
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
      setIsDeleteModalOpen(false);
      setDealToDelete(null);
      await loadDeals();
    } catch (err) {
      toast.error('Failed to delete deal');
    }
  }

  async function handleSubmitDeal(formData) {
    try {
      if (selectedDeal) {
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
      toast.error(selectedDeal ? 'Failed to update deal' : 'Failed to create deal');
    }
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
    const colors = {
      'Lead': 'bg-gray-100 text-gray-800',
      'Qualified': 'bg-blue-100 text-blue-800',
      'Proposal': 'bg-yellow-100 text-yellow-800',
      'Negotiation': 'bg-orange-100 text-orange-800',
      'Closed Won': 'bg-green-100 text-green-800',
      'Closed Lost': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
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

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDeals} />;

  return (
    <div className="space-y-6">
      <Header 
        title="Deals"
        onAddClick={handleAddDeal}
        addButtonLabel="Add Deal"
      />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input
            type="text"
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            {DEAL_STAGES.map(stage => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </Select>
          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            {DEAL_SOURCES.map(source => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <ApperIcon name="FilterX" size={16} />
            Clear Filters
          </Button>
        </div>
        <div className="text-sm text-secondary-600">
          {filteredDeals.length} of {deals.length} deals
        </div>
      </div>

      {/* Deals Table */}
      {filteredDeals.length === 0 ? (
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
      )}

      {/* Add Deal Modal */}
      {isAddModalOpen && (
        <DealForm
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleSubmitDeal}
          contacts={contacts}
          companies={companies}
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