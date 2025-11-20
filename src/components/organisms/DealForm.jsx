import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Modal from '@/components/molecules/Modal';
import ApperIcon from '@/components/ApperIcon';

const DEAL_STAGES = [
  { value: 'Lead', label: 'Lead', probability: 10 },
  { value: 'Qualified', label: 'Qualified', probability: 25 },
  { value: 'Proposal', label: 'Proposal', probability: 50 },
  { value: 'Negotiation', label: 'Negotiation', probability: 75 },
  { value: 'Closed Won', label: 'Closed Won', probability: 100 },
  { value: 'Closed Lost', label: 'Closed Lost', probability: 0 }
];

const DEAL_SOURCES = [
  { value: 'Inbound', label: 'Inbound' },
  { value: 'Outbound', label: 'Outbound' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Partner', label: 'Partner' },
  { value: 'Other', label: 'Other' }
];

const PRIORITIES = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

const DEAL_OWNERS = [
  'John Smith',
  'Sarah Johnson',
  'Michael Brown',
  'Emily Davis',
  'David Wilson',
  'Lisa Anderson'
];

function DealForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  contacts = [], 
  companies = [], 
  deal = null 
}) {
  const [formData, setFormData] = useState({
    dealName: '',
    contactId: '',
    companyId: '',
    amount: '',
    closeDate: '',
    stage: 'Lead',
    probability: 10,
    source: 'Inbound',
    priority: 'Medium',
    assignedTo: 'John Smith',
    products: [],
    description: '',
    nextStep: '',
    competitors: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addAnotherAfterSave, setAddAnotherAfterSave] = useState(false);

  useEffect(() => {
    if (deal) {
      setFormData({
        dealName: deal.dealName || '',
        contactId: deal.contactId || '',
        companyId: deal.companyId || '',
        amount: deal.amount || '',
        closeDate: deal.closeDate || '',
        stage: deal.stage || 'Lead',
        probability: deal.probability || 10,
        source: deal.source || 'Inbound',
        priority: deal.priority || 'Medium',
        assignedTo: deal.assignedTo || 'John Smith',
        products: deal.products || [],
        description: deal.description || '',
        nextStep: deal.nextStep || '',
        competitors: deal.competitors || ''
      });
    } else {
      resetForm();
    }
  }, [deal, isOpen]);

  function resetForm() {
    setFormData({
      dealName: '',
      contactId: '',
      companyId: '',
      amount: '',
      closeDate: '',
      stage: 'Lead',
      probability: 10,
      source: 'Inbound',
      priority: 'Medium',
      assignedTo: 'John Smith',
      products: [],
      description: '',
      nextStep: '',
      competitors: ''
    });
    setErrors({});
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.dealName.trim()) {
      newErrors.dealName = 'Deal name is required';
    }

    if (!formData.contactId) {
      newErrors.contactId = 'Contact is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.closeDate) {
      newErrors.closeDate = 'Close date is required';
    } else {
      const closeDate = new Date(formData.closeDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (closeDate < today) {
        newErrors.closeDate = 'Close date cannot be in the past';
      }
    }

    // Validate products
    formData.products.forEach((product, index) => {
      if (!product.name.trim()) {
        newErrors[`product_name_${index}`] = 'Product name is required';
      }
      if (!product.quantity || parseFloat(product.quantity) <= 0) {
        newErrors[`product_quantity_${index}`] = 'Quantity must be greater than 0';
      }
      if (!product.unitPrice || parseFloat(product.unitPrice) <= 0) {
        newErrors[`product_price_${index}`] = 'Unit price must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e, saveAndAdd = false) {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Calculate total from products if available
      const productsTotal = formData.products.reduce((sum, product) => {
        return sum + (parseFloat(product.quantity) * parseFloat(product.unitPrice));
      }, 0);

      // Use products total if available, otherwise use entered amount
      const finalAmount = formData.products.length > 0 ? productsTotal : parseFloat(formData.amount);

      // Auto-fill company from contact if not set
      let companyId = formData.companyId;
      if (!companyId && formData.contactId) {
        const selectedContact = contacts.find(c => c.Id === parseInt(formData.contactId));
        if (selectedContact && selectedContact.company) {
          const matchingCompany = companies.find(comp => comp.name === selectedContact.company);
          if (matchingCompany) {
            companyId = matchingCompany.Id;
          }
        }
      }

      const submitData = {
        ...formData,
        contactId: parseInt(formData.contactId),
        companyId: companyId ? parseInt(companyId) : null,
        amount: finalAmount,
        probability: parseInt(formData.probability)
      };

      await onSubmit(submitData);
      
      if (saveAndAdd) {
        resetForm();
        setAddAnotherAfterSave(false);
        toast.success('Deal saved! Add another deal.');
      } else {
        onClose();
      }
    } catch (err) {
      toast.error('Failed to save deal');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-update probability based on stage
    if (field === 'stage') {
      const stage = DEAL_STAGES.find(s => s.value === value);
      if (stage) {
        setFormData(prev => ({ ...prev, probability: stage.probability }));
      }
    }

    // Auto-fill company from contact
    if (field === 'contactId') {
      const selectedContact = contacts.find(c => c.Id === parseInt(value));
      if (selectedContact && selectedContact.company) {
        const matchingCompany = companies.find(comp => comp.name === selectedContact.company);
        if (matchingCompany) {
          setFormData(prev => ({ ...prev, companyId: matchingCompany.Id.toString() }));
        }
      }
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  function addProduct() {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { name: '', quantity: 1, unitPrice: 0, total: 0 }
      ]
    }));
  }

  function removeProduct(index) {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  }

  function updateProduct(index, field, value) {
    setFormData(prev => {
      const newProducts = [...prev.products];
      newProducts[index] = { ...newProducts[index], [field]: value };
      
      // Calculate total for this product
      if (field === 'quantity' || field === 'unitPrice') {
        const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(newProducts[index].quantity) || 0;
        const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(newProducts[index].unitPrice) || 0;
        newProducts[index].total = quantity * unitPrice;
      }
      
      return { ...prev, products: newProducts };
    });

    // Clear related errors
    if (errors[`product_${field}_${index}`]) {
      setErrors(prev => ({ ...prev, [`product_${field}_${index}`]: '' }));
    }
  }

  function calculateSubtotal() {
    return formData.products.reduce((sum, product) => sum + product.total, 0);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  const subtotal = calculateSubtotal();
  const discount = 0; // Could be made configurable
  const tax = 0; // Could be made configurable
  const totalValue = subtotal - discount + tax;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deal ? 'Edit Deal' : 'New Deal'}
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Deal Name *"
            placeholder="e.g., ABC Corp - Website Redesign"
            value={formData.dealName}
            onChange={(e) => handleChange('dealName', e.target.value)}
            error={errors.dealName}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-600">
              Associated Contact *
            </label>
            <Select
              value={formData.contactId}
              onChange={(e) => handleChange('contactId', e.target.value)}
              className={errors.contactId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            >
              <option value="">Select Contact</option>
              {contacts.map(contact => (
                <option key={contact.Id} value={contact.Id}>
                  {contact.name} - {contact.company}
                </option>
              ))}
            </Select>
            {errors.contactId && (
              <p className="text-sm text-red-600">{errors.contactId}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-600">
              Associated Company
            </label>
            <Select
              value={formData.companyId}
              onChange={(e) => handleChange('companyId', e.target.value)}
            >
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.Id} value={company.Id}>
                  {company.name}
                </option>
              ))}
            </Select>
          </div>

          <Input
            type="number"
            step="0.01"
            min="0"
            label="Deal Value/Amount *"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={errors.amount}
          />

          <Input
            type="date"
            label="Expected Close Date *"
            value={formData.closeDate}
            onChange={(e) => handleChange('closeDate', e.target.value)}
            error={errors.closeDate}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-600">
              Deal Stage
            </label>
            <Select
              value={formData.stage}
              onChange={(e) => handleChange('stage', e.target.value)}
            >
              {DEAL_STAGES.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </Select>
          </div>

          <Input
            type="number"
            min="0"
            max="100"
            label="Win Probability (%)"
            value={formData.probability}
            onChange={(e) => handleChange('probability', e.target.value)}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-600">
              Deal Source
            </label>
            <Select
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
            >
              {DEAL_SOURCES.map(source => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-600">
              Priority
            </label>
            <Select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              {PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-600">
              Assigned To
            </label>
            <Select
              value={formData.assignedTo}
              onChange={(e) => handleChange('assignedTo', e.target.value)}
            >
              {DEAL_OWNERS.map(owner => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Products/Services Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-secondary-900">Products/Services</h4>
            <Button
              type="button"
              onClick={addProduct}
              size="sm"
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              Add Product
            </Button>
          </div>

          {formData.products.map((product, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-secondary-200 rounded-lg">
              <Input
                placeholder="Product name"
                value={product.name}
                onChange={(e) => updateProduct(index, 'name', e.target.value)}
                error={errors[`product_name_${index}`]}
              />
              <Input
                type="number"
                min="1"
                placeholder="Qty"
                value={product.quantity}
                onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                error={errors[`product_quantity_${index}`]}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Unit Price"
                value={product.unitPrice}
                onChange={(e) => updateProduct(index, 'unitPrice', e.target.value)}
                error={errors[`product_price_${index}`]}
              />
              <div className="flex items-center px-4 py-3 bg-secondary-50 rounded-lg text-secondary-900 font-medium">
                {formatCurrency(product.total)}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeProduct(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ApperIcon name="Trash2" size={16} />
              </Button>
            </div>
          ))}

          {formData.products.length > 0 && (
            <div className="border-t border-secondary-200 pt-4 space-y-2">
              <div className="flex justify-between text-secondary-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-secondary-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-secondary-600">
                  <span>Tax:</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold text-secondary-900 border-t border-secondary-200 pt-2">
                <span>Total Deal Value:</span>
                <span>{formatCurrency(totalValue)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-600">
              Description/Notes
            </label>
            <textarea
              rows="4"
              className="block w-full px-4 py-3 text-secondary-900 bg-white border border-secondary-300 rounded-lg placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              placeholder="Deal description and notes..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Input
              label="Next Step"
              placeholder="What needs to happen next?"
              value={formData.nextStep}
              onChange={(e) => handleChange('nextStep', e.target.value)}
            />
            
            <Input
              label="Competitors"
              placeholder="Known competitors (comma separated)"
              value={formData.competitors}
              onChange={(e) => handleChange('competitors', e.target.value)}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-secondary-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="order-2 sm:order-1"
          >
            Cancel
          </Button>
          
          <div className="flex gap-3 order-1 sm:order-2 sm:ml-auto">
            {!deal && (
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Plus" size={16} />
                Save & Add Another
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ApperIcon name="Save" size={16} />
                  {deal ? 'Update Deal' : 'Save Deal'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default DealForm;