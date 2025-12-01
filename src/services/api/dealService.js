import { contactService } from './contactService';
import { companyService } from './companyService';

// Initialize storage with default data
function initializeStorage() {
  if (!localStorage.getItem('crm-deals')) {
    const defaultDeals = [
      {
Id: 1,
        dealName: "TechCorp - Website Redesign",
        contactId: 1,
        companyId: 1,
        amount: 15000,
        closeDate: "2024-04-15",
        stage: "Qualified",
        probability: 25,
        source: "Inbound",
        priority: "High",
        assignedTo: "John Smith",
        products: [
          { name: "Website Design", quantity: 1, unitPrice: 8000, total: 8000 },
          { name: "SEO Optimization", quantity: 1, unitPrice: 3000, total: 3000 },
          { name: "Content Creation", quantity: 1, unitPrice: 4000, total: 4000 }
        ],
        description: "Complete website redesign with modern UI/UX and SEO optimization",
        nextStep: "Schedule design review meeting",
        competitors: "DesignPro, WebMasters",
        createdDate: "2024-02-01T10:00:00Z",
        modifiedDate: "2024-02-15T14:30:00Z",
        wonDate: null,
        lostDate: null,
        lostReason: null
      },
      {
Id: 2,
        dealName: "InnovateCorp - Mobile App Development",
        contactId: 2,
        companyId: 2,
        amount: 45000,
        closeDate: "2024-05-20",
        stage: "Proposal",
        probability: 50,
        source: "Referral",
        priority: "Medium",
        assignedTo: "Sarah Johnson",
        products: [
          { name: "Mobile App Development", quantity: 1, unitPrice: 35000, total: 35000 },
          { name: "App Store Submission", quantity: 1, unitPrice: 2000, total: 2000 },
          { name: "Maintenance (6 months)", quantity: 1, unitPrice: 8000, total: 8000 }
        ],
        description: "Native iOS and Android app for customer engagement",
        nextStep: "Present technical proposal to stakeholders",
        competitors: "AppCrafters, MobileTech",
        createdDate: "2024-02-10T09:15:00Z",
        modifiedDate: "2024-02-20T16:45:00Z",
        wonDate: null,
        lostDate: null,
        lostReason: null
      },
      {
Id: 3,
        dealName: "StartupXYZ - Brand Identity Package",
        contactId: 3,
        companyId: 3,
        amount: 8500,
        closeDate: "2024-04-30",
        stage: "Negotiation",
        probability: 75,
        source: "Outbound",
        priority: "High",
        assignedTo: "Michael Brown",
        products: [
          { name: "Logo Design", quantity: 1, unitPrice: 3000, total: 3000 },
          { name: "Brand Guidelines", quantity: 1, unitPrice: 2500, total: 2500 },
          { name: "Marketing Collateral", quantity: 1, unitPrice: 3000, total: 3000 }
        ],
        description: "Complete brand identity development for tech startup",
        nextStep: "Final contract review and approval",
        competitors: "BrandMasters",
        createdDate: "2024-01-25T11:30:00Z",
        modifiedDate: "2024-02-18T13:20:00Z",
        wonDate: null,
        lostDate: null,
        lostReason: null
      }
    ];
    localStorage.setItem('crm-deals', JSON.stringify(defaultDeals));
  }
}

function getStoredDeals() {
  const deals = localStorage.getItem('crm-deals');
  return deals ? JSON.parse(deals) : [];
}

function saveDeals(deals) {
  localStorage.setItem('crm-deals', JSON.stringify(deals));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const dealService = {
  async getAll() {
    await delay(300);
    initializeStorage();
    return [...getStoredDeals()];
  },

  async getById(id) {
    await delay(200);
    const deals = getStoredDeals();
    const deal = deals.find(d => d.Id === parseInt(id));
    return deal ? { ...deal } : null;
  },

  async create(dealData) {
    await delay(400);
    const deals = getStoredDeals();
const newId = Math.max(0, ...deals.map(d => d.Id)) + 1;
    
const newDeal = {
      ...dealData,
      Id: newId,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      wonDate: null,
      lostDate: null,
      lostReason: null,
      // Ensure all fields have default values if not provided
      products: dealData.products || [],
      competitors: dealData.competitors || '',
      nextStep: dealData.nextStep || ''
    };
    
    deals.push(newDeal);
    saveDeals(deals);
    return { ...newDeal };
  },

  async update(id, updates) {
    await delay(400);
    const deals = getStoredDeals();
    const index = deals.findIndex(d => d.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Deal not found');
    }
    
    const updatedDeal = {
...deals[index],
      ...updates,
      Id: parseInt(id),
      modifiedDate: new Date().toISOString()
    };
    
    // Handle stage-specific updates
    if (updates.stage === 'Closed Won' && !updatedDeal.wonDate) {
      updatedDeal.wonDate = new Date().toISOString();
      updatedDeal.lostDate = null;
      updatedDeal.lostReason = null;
    } else if (updates.stage === 'Closed Lost' && !updatedDeal.lostDate) {
      updatedDeal.lostDate = new Date().toISOString();
      updatedDeal.wonDate = null;
    }
    
    deals[index] = updatedDeal;
    saveDeals(deals);
    return { ...updatedDeal };
  },

  async delete(id) {
    await delay(300);
    const deals = getStoredDeals();
    const filteredDeals = deals.filter(d => d.Id !== parseInt(id));
    
    if (filteredDeals.length === deals.length) {
      throw new Error('Deal not found');
    }
    
    saveDeals(filteredDeals);
    return true;
  },

  async getByStage(stage) {
    await delay(200);
    const deals = await this.getAll();
    return deals.filter(deal => deal.stage === stage);
  },

  async getDealsByContact(contactId) {
    await delay(200);
    const deals = await this.getAll();
    return deals.filter(deal => deal.contactId === parseInt(contactId));
  },

  async getDealsByCompany(companyId) {
    await delay(200);
    const deals = await this.getAll();
    return deals.filter(deal => deal.companyId === parseInt(companyId));
  },

  // Calculate pipeline metrics
  async getPipelineMetrics() {
    await delay(200);
    const deals = await this.getAll();
    
    const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
    const openDeals = deals.filter(deal => !['Closed Won', 'Closed Lost'].includes(deal.stage));
    const wonDeals = deals.filter(deal => deal.stage === 'Closed Won');
    const lostDeals = deals.filter(deal => deal.stage === 'Closed Lost');
    
    const openValue = openDeals.reduce((sum, deal) => sum + deal.amount, 0);
    const wonValue = wonDeals.reduce((sum, deal) => sum + deal.amount, 0);
    const weightedValue = openDeals.reduce((sum, deal) => sum + (deal.amount * deal.probability / 100), 0);
    
    return {
      totalDeals: deals.length,
      totalValue,
      openDeals: openDeals.length,
      openValue,
      wonDeals: wonDeals.length,
      wonValue,
      lostDeals: lostDeals.length,
      weightedValue,
      averageDealSize: deals.length > 0 ? totalValue / deals.length : 0,
      winRate: (wonDeals.length + lostDeals.length) > 0 ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0
    };
  }
};