import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Modal from "@/components/molecules/Modal";
import { contactService } from "@/services/api/contactService";
const ContactForm = ({ isOpen, onClose, onSubmit, contact = null }) => {
const [formData, setFormData] = useState({
    firstName: contact?.firstName || "",
    lastName: contact?.lastName || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    jobTitle: contact?.jobTitle || "",
    companyId: contact?.companyId || "",
    companyName: contact?.companyName || "",
    source: contact?.source || "",
    status: contact?.status || "active",
    address: {
      street: contact?.address?.street || "",
      city: contact?.address?.city || "",
      state: contact?.address?.state || "",
      zip: contact?.address?.zip || "",
      country: contact?.address?.country || ""
    },
    socialLinks: {
      linkedin: contact?.socialLinks?.linkedin || "",
      twitter: contact?.socialLinks?.twitter || "",
      facebook: contact?.socialLinks?.facebook || ""
    },
    tags: contact?.tags || [],
    assignedTo: contact?.assignedTo || "current-user",
    notes: contact?.notes || ""
  });
  
const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState("");
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);

const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const checkDuplicateEmail = async (email) => {
    if (!email.trim() || contact?.email === email) return;
    
    try {
      const contacts = await contactService.getAll();
      const existingContact = contacts.find(c => c.email.toLowerCase() === email.toLowerCase());
      
      if (existingContact) {
        setDuplicateWarning(`Contact with this email already exists. View existing contact?`);
      } else {
        setDuplicateWarning("");
      }
    } catch (error) {
      console.error("Error checking duplicate:", error);
    }
  };

  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (duplicateWarning && !contact) {
      return;
    }
    
    setLoading(true);
    setSaveAndAddAnother(addAnother);
    
try {
      // Save to window.storage for persistence
      window.localStorage.setItem('contactFormData', JSON.stringify(formData));
      await onSubmit(formData);
      // Clear storage on successful submit
      window.localStorage.removeItem('contactFormData');
      
      if (!addAnother) {
        resetForm();
        onClose();
      } else {
        resetForm();
        toast.success("Contact created successfully! Add another contact.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
      setSaveAndAddAnother(false);
    }
  };

const resetForm = () => {
    const initialData = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      companyId: "",
      companyName: "",
      source: "",
      status: "active",
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
        country: ""
      },
      socialLinks: {
        linkedin: "",
        twitter: "",
        facebook: ""
      },
      tags: [],
      assignedTo: "current-user",
      notes: ""
    };
    
    setFormData(initialData);
    setErrors({});
    setDuplicateWarning("");
    // Clear any saved form data
    window.localStorage.removeItem('contactFormData');
  };

const handleChange = (field, value) => {
    let updatedData;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedData = {
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      };
    } else {
      updatedData = { ...formData, [field]: value };
    }
    
    setFormData(updatedData);
    
    // Save to window.storage for real-time persistence
    window.localStorage.setItem('contactFormData', JSON.stringify(updatedData));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    if (field === 'email') {
      checkDuplicateEmail(value);
    }
  };

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        phone: contact.phone || "",
        jobTitle: contact.jobTitle || "",
        companyId: contact.companyId || "",
        companyName: contact.companyName || "",
        source: contact.source || "",
        status: contact.status || "active",
        address: {
          street: contact.address?.street || "",
          city: contact.address?.city || "",
          state: contact.address?.state || "",
          zip: contact.address?.zip || "",
          country: contact.address?.country || ""
        },
        socialLinks: {
          linkedin: contact.socialLinks?.linkedin || "",
          twitter: contact.socialLinks?.twitter || "",
          facebook: contact.socialLinks?.facebook || ""
        },
        tags: contact.tags || [],
        assignedTo: contact.assignedTo || "current-user",
        notes: contact.notes || ""
      });
    }
  }, [contact]);

return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={contact ? "Edit Contact" : "New Contact"}
      className="max-w-4xl"
    >
<div className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                error={errors.firstName}
                placeholder="Enter first name"
              />
              
              <Input
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                error={errors.lastName}
                placeholder="Enter last name"
              />
              
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email || duplicateWarning}
                placeholder="Enter email address"
                className={duplicateWarning ? "border-warning" : ""}
              />
              
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
              
              <Input
                label="Job Title"
                value={formData.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                placeholder="Enter job title"
              />
              
              <Input
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Contact Source"
                value={formData.source}
                onChange={(e) => handleChange("source", e.target.value)}
              >
                <option value="">Select source</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social-media">Social Media</option>
                <option value="email-campaign">Email Campaign</option>
                <option value="trade-show">Trade Show</option>
                <option value="cold-call">Cold Call</option>
                <option value="other">Other</option>
              </Select>
              
              <Select
                label="Contact Status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
                <option value="lead">Lead</option>
              </Select>
              
              <Select
                label="Assigned To"
                value={formData.assignedTo}
                onChange={(e) => handleChange("assignedTo", e.target.value)}
              >
                <option value="current-user">Current User</option>
                <option value="sales-team">Sales Team</option>
                <option value="marketing-team">Marketing Team</option>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Street Address"
                value={formData.address.street}
                onChange={(e) => handleChange("address.street", e.target.value)}
                placeholder="Enter street address"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={formData.address.city}
                  onChange={(e) => handleChange("address.city", e.target.value)}
                  placeholder="Enter city"
                />
                
                <Input
                  label="State"
                  value={formData.address.state}
                  onChange={(e) => handleChange("address.state", e.target.value)}
                  placeholder="Enter state"
                />
                
                <Input
                  label="ZIP Code"
                  value={formData.address.zip}
                  onChange={(e) => handleChange("address.zip", e.target.value)}
                  placeholder="Enter ZIP code"
                />
              </div>
              
              <Input
                label="Country"
                value={formData.address.country}
                onChange={(e) => handleChange("address.country", e.target.value)}
                placeholder="Enter country"
              />
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="LinkedIn"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleChange("socialLinks.linkedin", e.target.value)}
                placeholder="LinkedIn profile URL"
              />
              
              <Input
                label="Twitter"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleChange("socialLinks.twitter", e.target.value)}
                placeholder="Twitter profile URL"
              />
              
              <Input
                label="Facebook"
                value={formData.socialLinks.facebook}
                onChange={(e) => handleChange("socialLinks.facebook", e.target.value)}
                placeholder="Facebook profile URL"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Notes</h3>
            <textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Add any additional notes..."
              rows={4}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-secondary-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1 sm:flex-none sm:w-32"
            >
              Cancel
            </Button>
            
            {!contact && (
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, true)}
                loading={loading && saveAndAddAnother}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Save & Add Another
              </Button>
            )}
            
            <Button
              type="submit"
              loading={loading && !saveAndAddAnother}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {contact ? "Update Contact" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ContactForm;