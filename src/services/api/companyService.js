import companiesData from '@/services/mockData/companies.json';

const STORAGE_KEY = 'crm-companies';

// Initialize storage with sample data
function initializeStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companiesData));
  }
}

// Get companies from localStorage
function getStoredCompanies() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : companiesData;
}

// Save companies to localStorage
function saveCompanies(companies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
}

// Simulate API delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Company service API
export const companyService = {
  async getAll() {
    await delay(300);
    initializeStorage();
    const companies = getStoredCompanies();
    return [...companies]; // Return copy to prevent mutations
  },

  async getById(id) {
    await delay(200);
    const companies = getStoredCompanies();
    const company = companies.find(c => c.Id === parseInt(id));
    return company ? { ...company } : null;
  },

  async create(companyData) {
    await delay(400);
    const companies = getStoredCompanies();
    
    const newCompany = {
      ...companyData,
      Id: Math.max(...companies.map(c => c.Id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contactCount: 0,
      dealCount: 0,
      totalDealValue: 0
    };

    companies.push(newCompany);
    saveCompanies(companies);
    return { ...newCompany };
  },

  async update(id, companyData) {
    await delay(400);
    const companies = getStoredCompanies();
    const index = companies.findIndex(c => c.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Company not found');
    }

    companies[index] = {
      ...companies[index],
      ...companyData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };

    saveCompanies(companies);
    return { ...companies[index] };
  },

  async delete(id) {
    await delay(300);
    const companies = getStoredCompanies();
    const filteredCompanies = companies.filter(c => c.Id !== parseInt(id));
    
    if (filteredCompanies.length === companies.length) {
      throw new Error('Company not found');
    }

    saveCompanies(filteredCompanies);
    return true;
  }
};