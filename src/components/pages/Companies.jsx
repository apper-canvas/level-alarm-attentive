import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { companyService } from "@/services/api/companyService";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import CompanyForm from "@/components/organisms/CompanyForm";
import CompanyCard from "@/components/organisms/CompanyCard";
import Header from "@/components/organisms/Header";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const VIEW_OPTIONS = [
  { value: 'cards', label: 'Cards', icon: 'Grid3X3' },
  { value: 'table', label: 'Table', icon: 'Table' },
  { value: 'list', label: 'List', icon: 'List' }
];
const INDUSTRIES = [
  { value: '', label: 'All Industries' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Education', label: 'Education' },
  { value: 'Other', label: 'Other' }
];

const COMPANY_SIZES = [
  { value: '', label: 'All Sizes' },
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
  { value: '1000+', label: '1000+ employees' }
];


export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deleteCompany, setDeleteCompany] = useState(null);
  const [view, setView] = useState('cards');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [revenueMin, setRevenueMin] = useState('');
  const [revenueMax, setRevenueMax] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [companies, searchTerm, industryFilter, sizeFilter, assignedToFilter, revenueMin, revenueMax]);

  async function loadCompanies() {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getAll();
      setCompanies(data);
    } catch (err) {
      setError('Failed to load companies. Please try again.');
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
}

  function applyFilters() {
    let filtered = [...companies];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by industry
    if (industryFilter) {
      filtered = filtered.filter(company => company.industry === industryFilter);
    }

    // Filter by company size
    if (sizeFilter) {
      filtered = filtered.filter(company => company.companySize === sizeFilter);
    }

    // Filter by assigned to
    if (assignedToFilter) {
      filtered = filtered.filter(company =>
        company.assignedTo.toLowerCase().includes(assignedToFilter.toLowerCase())
      );
    }

    // Filter by revenue range
    const minRevenue = revenueMin ? parseInt(revenueMin) : 0;
    const maxRevenue = revenueMax ? parseInt(revenueMax) : Infinity;
    
    if (revenueMin || revenueMax) {
      filtered = filtered.filter(company => 
        company.annualRevenue >= minRevenue && company.annualRevenue <= maxRevenue
      );
    }

    setFilteredCompanies(filtered);
  }

  function handleAddCompany() {
    setEditingCompany(null);
    setShowForm(true);
  }

  function handleEditCompany(company) {
    setEditingCompany(company);
    setShowForm(true);
  }

  function handleDeleteCompany(company) {
    setDeleteCompany(company);
  }

  async function confirmDelete() {
    if (!deleteCompany) return;

    try {
      await companyService.delete(deleteCompany.Id);
      setCompanies(prev => prev.filter(c => c.Id !== deleteCompany.Id));
      toast.success('Company deleted successfully');
    } catch (err) {
      toast.error('Failed to delete company');
      console.error('Error deleting company:', err);
    } finally {
      setDeleteCompany(null);
    }
  }

  async function handleSubmitCompany(formData) {
    try {
      if (editingCompany) {
        const updated = await companyService.update(editingCompany.Id, formData);
        setCompanies(prev => prev.map(c => c.Id === updated.Id ? updated : c));
        toast.success('Company updated successfully');
      } else {
        const newCompany = await companyService.create(formData);
        setCompanies(prev => [...prev, newCompany]);
        toast.success('Company created successfully');
      }
      setShowForm(false);
      setEditingCompany(null);
    } catch (err) {
      toast.error('Failed to save company');
      console.error('Error saving company:', err);
    }
  }

  function clearFilters() {
    setSearchTerm('');
    setIndustryFilter('');
    setSizeFilter('');
    setAssignedToFilter('');
    setRevenueMin('');
    setRevenueMax('');
  }

  const uniqueAssignees = [...new Set(companies.map(c => c.assignedTo))];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadCompanies} />;
  }

  return (
    <div className="p-6 space-y-6">
      <Header
        title="Companies"
        onAddClick={handleAddCompany}
        addButtonLabel="Add Company"
        className="pb-4"
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>
          
          <Select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="min-w-40"
          >
            {INDUSTRIES.map(industry => (
              <option key={industry.value} value={industry.value}>
                {industry.label}
              </option>
            ))}
          </Select>

          <Select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="min-w-40"
          >
            {COMPANY_SIZES.map(size => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </Select>

          <Input
            placeholder="Assigned to..."
            value={assignedToFilter}
            onChange={(e) => setAssignedToFilter(e.target.value)}
            className="min-w-40"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Revenue:</span>
            <Input
              type="number"
              placeholder="Min"
              value={revenueMin}
              onChange={(e) => setRevenueMin(e.target.value)}
              className="w-24"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={revenueMax}
              onChange={(e) => setRevenueMax(e.target.value)}
              className="w-24"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            icon="X"
          >
            Clear Filters
          </Button>

          <div className="ml-auto flex gap-1">
            {VIEW_OPTIONS.map(option => (
              <Button
                key={option.value}
                variant={view === option.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView(option.value)}
                icon={option.icon}
                className="px-3"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCompanies.length} of {companies.length} companies
        </div>
      </div>

      {/* Companies Display */}
      {filteredCompanies.length === 0 ? (
        <Empty
          icon="Building2"
          title="No companies found"
          description={companies.length === 0 
            ? "Get started by adding your first company" 
            : "Try adjusting your search criteria"}
          action={companies.length === 0 && (
            <Button onClick={handleAddCompany} icon="Plus">
              Add Company
            </Button>
          )}
        />
      ) : (
        <div className={`
          ${view === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}
          ${view === 'table' ? 'bg-white rounded-xl border border-gray-200 overflow-hidden' : ''}
          ${view === 'list' ? 'space-y-2' : ''}
        `}>
          {view === 'cards' && filteredCompanies.map(company => (
            <CompanyCard
              key={company.Id}
              company={company}
              onEdit={() => handleEditCompany(company)}
              onDelete={() => handleDeleteCompany(company)}
            />
          ))}
          
          {view === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deals</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompanies.map(company => (
                    <tr key={company.Id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {company.companyName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{company.companyName}</div>
                            {company.website && (
                              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800">
                                {company.website}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.industry}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.companySize}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(company.annualRevenue / 1000000).toFixed(1)}M
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.contactCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {company.dealCount} (${(company.totalDealValue / 1000).toFixed(0)}K)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.assignedTo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCompany(company)}
                            icon="Edit2"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCompany(company)}
                            icon="Trash2"
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'list' && filteredCompanies.map(company => (
            <div key={company.Id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {company.companyName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-gray-900">{company.companyName}</h3>
                  <span className="text-sm text-gray-500">{company.industry}</span>
                  <span className="text-sm text-gray-500">{company.companySize}</span>
                  <span className="text-sm text-gray-500">{company.contactCount} contacts</span>
                  <span className="text-sm text-gray-500">{company.dealCount} deals</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {company.phone} • {company.email} • Assigned to {company.assignedTo}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCompany(company)}
                  icon="Edit2"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCompany(company)}
                  icon="Trash2"
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Company Form Modal */}
      <CompanyForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCompany(null);
        }}
        onSubmit={handleSubmitCompany}
        company={editingCompany}
      />

      {/* Delete Confirmation Modal */}
      {deleteCompany && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteCompany(null)}
          title="Delete Company"
          className="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <ApperIcon name="AlertTriangle" size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Company</h3>
                <p className="text-gray-600">Are you sure you want to delete "{deleteCompany.companyName}"?</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                This action cannot be undone. All associated data will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteCompany(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete Company
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
);
}