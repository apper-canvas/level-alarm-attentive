import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Modal from '@/components/molecules/Modal';

const INDUSTRIES = [
  { value: '', label: 'Select Industry' },
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
  { value: '', label: 'Select Company Size' },
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
  { value: '1000+', label: '1000+ employees' }
];

const ACCOUNT_OWNERS = [
  'John Smith',
  'Sarah Johnson',
  'Michael Brown',
  'Emily Davis',
  'David Wilson',
  'Lisa Anderson'
];

export default function CompanyForm({ isOpen, onClose, onSubmit, company = null }) {
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    annualRevenue: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA'
    },
    description: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: ''
    },
    tags: '',
    assignedTo: 'John Smith'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (company) {
        setFormData({
          ...company,
          tags: company.tags ? company.tags.join(', ') : '',
          annualRevenue: company.annualRevenue ? company.annualRevenue.toString() : ''
        });
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, company]);

  function resetForm() {
    setFormData({
      companyName: '',
      website: '',
      industry: '',
      companySize: '',
      annualRevenue: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'USA'
      },
      description: '',
      socialLinks: {
        linkedin: '',
        twitter: '',
        facebook: ''
      },
      tags: '',
      assignedTo: 'John Smith'
    });
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

if (formData.website && formData.website.trim()) {
      const urlPattern = /^https?:\/\/([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(formData.website)) {
        newErrors.website = 'Please enter a valid URL (include http:// or https://)';
      }
    }

    if (formData.email && formData.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (formData.annualRevenue && formData.annualRevenue.trim()) {
      const revenue = parseFloat(formData.annualRevenue);
      if (isNaN(revenue) || revenue < 0) {
        newErrors.annualRevenue = 'Please enter a valid revenue amount';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : 0,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(field, value) {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={company ? 'Edit Company' : 'Add Company'}
      className="max-w-4xl max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              error={errors.companyName}
              placeholder="Enter company name"
            />
            {errors.companyName && (
              <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              error={errors.website}
              placeholder="https://company.com"
            />
            {errors.website && (
              <p className="text-red-500 text-xs mt-1">{errors.website}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <Select
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
            >
              {INDUSTRIES.map(industry => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Size
            </label>
            <Select
              value={formData.companySize}
              onChange={(e) => handleChange('companySize', e.target.value)}
            >
              {COMPANY_SIZES.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Revenue ($)
            </label>
            <Input
              type="number"
              value={formData.annualRevenue}
              onChange={(e) => handleChange('annualRevenue', e.target.value)}
              error={errors.annualRevenue}
              placeholder="5000000"
            />
            {errors.annualRevenue && (
              <p className="text-red-500 text-xs mt-1">{errors.annualRevenue}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <Select
              value={formData.assignedTo}
              onChange={(e) => handleChange('assignedTo', e.target.value)}
            >
              {ACCOUNT_OWNERS.map(owner => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                placeholder="contact@company.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <Input
                value={formData.address.street}
                onChange={(e) => handleChange('address.street', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  value={formData.address.city}
                  onChange={(e) => handleChange('address.city', e.target.value)}
                  placeholder="San Francisco"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <Input
                  value={formData.address.state}
                  onChange={(e) => handleChange('address.state', e.target.value)}
                  placeholder="CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <Input
                  value={formData.address.zip}
                  onChange={(e) => handleChange('address.zip', e.target.value)}
                  placeholder="94105"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <Input
                value={formData.address.country}
                onChange={(e) => handleChange('address.country', e.target.value)}
                placeholder="USA"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Brief description of the company..."
          />
        </div>

        {/* Social Links */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <Input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleChange('socialLinks.linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter
                </label>
                <Input
                  type="url"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleChange('socialLinks.twitter', e.target.value)}
                  placeholder="https://twitter.com/company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <Input
                  type="url"
                  value={formData.socialLinks.facebook}
                  onChange={(e) => handleChange('socialLinks.facebook', e.target.value)}
                  placeholder="https://facebook.com/company"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <Input
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="Enterprise, Software, Cloud (comma-separated)"
          />
          <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="flex-1"
          >
            {company ? 'Update Company' : 'Create Company'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}