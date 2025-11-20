import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { companyService } from "@/services/api/companyService";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Contacts from "@/components/pages/Contacts";
import Companies from "@/components/pages/Companies";
import CompanyForm from "@/components/organisms/CompanyForm";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

useEffect(() => {
    loadCompany();
  }, [id]);

async function loadCompany() {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getById(id);
      
      if (!data) {
        setError('Company not found');
        return;
      }
      
      setCompany(data);
    } catch (err) {
      setError('Failed to load company details. Please try again.');
      console.error('Error loading company:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateCompany(formData) {
    try {
      const updated = await companyService.update(company.Id, formData);
      setCompany(updated);
      setShowEditForm(false);
      toast.success('Company updated successfully');
    } catch (err) {
      toast.error('Failed to update company');
      console.error('Error updating company:', err);
    }
  }

  async function handleDeleteCompany() {
    try {
      await companyService.delete(company.Id);
      toast.success('Company deleted successfully');
      navigate('/companies');
    } catch (err) {
      toast.error('Failed to delete company');
      console.error('Error deleting company:', err);
    }
  }

  function getInitials(name) {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function formatRevenue(revenue) {
    if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M`;
    }
    if (revenue >= 1000) {
      return `$${(revenue / 1000).toFixed(0)}K`;
    }
    return `$${revenue}`;
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Error 
          message={error} 
          onRetry={loadCompany}
          action={
            <Button onClick={() => navigate('/companies')} variant="outline">
              Back to Companies
            </Button>
          }
        />
      </div>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/companies')}
            icon="ArrowLeft"
          >
            Back to Companies
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-start gap-6">
            {/* Company Logo */}
            <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {getInitials(company.companyName)}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {company.companyName}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="font-medium">{company.industry}</span>
                    <span>•</span>
                    <span>{company.companySize}</span>
                    {company.annualRevenue > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-green-600">
                          {formatRevenue(company.annualRevenue)} annual revenue
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditForm(true)}
                    icon="Edit2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteModal(true)}
                    icon="Trash2"
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Website */}
              {company.website && (
                <div className="mb-4">
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <ApperIcon name="ExternalLink" size={16} />
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              {/* Tags */}
              {company.tags && company.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {company.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          {company.description && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{company.description}</p>
            </div>
          )}

          {/* Address */}
          {(company.address.street || company.address.city) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
              <div className="flex items-start gap-3">
                <ApperIcon name="MapPin" size={20} className="text-gray-400 mt-1 flex-shrink-0" />
                <div className="text-gray-700">
                  {company.address.street && <div>{company.address.street}</div>}
                  <div>
                    {[company.address.city, company.address.state, company.address.zip]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                  {company.address.country && <div>{company.address.country}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Social Links */}
          {(company.socialLinks.linkedin || company.socialLinks.twitter || company.socialLinks.facebook) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media</h2>
              <div className="space-y-3">
                {company.socialLinks.linkedin && (
                  <a
                    href={company.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <ApperIcon name="Linkedin" size={20} />
                    <span>LinkedIn</span>
                    <ApperIcon name="ExternalLink" size={14} className="ml-auto text-gray-400" />
                  </a>
                )}
                {company.socialLinks.twitter && (
                  <a
                    href={company.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <ApperIcon name="Twitter" size={20} />
                    <span>Twitter</span>
                    <ApperIcon name="ExternalLink" size={14} className="ml-auto text-gray-400" />
                  </a>
                )}
                {company.socialLinks.facebook && (
                  <a
                    href={company.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <ApperIcon name="Facebook" size={20} />
                    <span>Facebook</span>
                    <ApperIcon name="ExternalLink" size={14} className="ml-auto text-gray-400" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              {company.phone && (
                <div className="flex items-center gap-3">
                  <ApperIcon name="Phone" size={18} className="text-gray-400" />
                  <span className="text-gray-700">{company.phone}</span>
                </div>
              )}
              {company.email && (
                <div className="flex items-center gap-3">
                  <ApperIcon name="Mail" size={18} className="text-gray-400" />
                  <a
                    href={`mailto:${company.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {company.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Contacts</span>
                <span className="font-semibold text-gray-900">{company.contactCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Deals</span>
                <span className="font-semibold text-gray-900">{company.dealCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Deal Value</span>
                <span className="font-semibold text-green-600">
                  {formatRevenue(company.totalDealValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Account Owner */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Owner</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                {getInitials(company.assignedTo)}
              </div>
              <div>
                <div className="font-medium text-gray-900">{company.assignedTo}</div>
                <div className="text-sm text-gray-500">Account Manager</div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900">
                  {format(new Date(company.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-gray-900">
                  {format(new Date(company.updatedAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>
</div>
      {/* Edit Form Modal */}
      <CompanyForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleUpdateCompany}
        company={company}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteModal(false)}
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
                <p className="text-gray-600">Are you sure you want to delete "{company.companyName}"?</p>
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
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteCompany}
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