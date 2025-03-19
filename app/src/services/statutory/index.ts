import api from '../api';
import {
  StatutoryService,
  QueryParams,
  PaginatedResponse,
  Director,
  Shareholder,
  Share,
  BeneficialOwner,
  Allotment,
  Charge,
  Meeting,
  BoardMinute,
  Activity,
  ActivityStats,
  ExportFormat,
  ImportResult
} from './types';

// Get the current user's company ID from localStorage
const getCurrentCompanyId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.companyId || 'cm70wz3b70003v9d6nlw8ts7u'; // Fallback to test company ID
  } catch {
    return 'cm70wz3b70003v9d6nlw8ts7u'; // Fallback to test company ID
  }
};

const statutoryService: StatutoryService = {
  // Directors
  async getDirectors(params?: QueryParams): Promise<PaginatedResponse<Director>> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/directors/${companyId}`, { params });
    return response.data;
  },

  async getDirector(id: string): Promise<Director> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/directors/${companyId}/${id}`);
    return response.data;
  },

  async createDirector(director: Omit<Director, 'id' | 'createdAt' | 'updatedAt'>): Promise<Director> {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/statutory/directors/${companyId}`, director);
    return response.data;
  },

  async updateDirector(id: string, director: Partial<Director>): Promise<Director> {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/statutory/directors/${companyId}/${id}`, director);
    return response.data;
  },

  async deleteDirector(id: string): Promise<void> {
    const companyId = getCurrentCompanyId();
    await api.delete(`/statutory/directors/${companyId}/${id}`);
  },

  async resignDirector(id: string, resignationDate: string): Promise<Director> {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/statutory/directors/${companyId}/${id}/resign`, { resignationDate });
    return response.data;
  },

  // Shareholders
  async getShareholders(params?: QueryParams): Promise<PaginatedResponse<Shareholder>> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/shareholders/${companyId}`, { params });
    return response.data;
  },

  async getShareholder(id: string): Promise<Shareholder> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/shareholders/${companyId}/${id}`);
    return response.data;
  },

  async createShareholder(shareholder: Omit<Shareholder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shareholder> {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/statutory/shareholders/${companyId}`, shareholder);
    return response.data;
  },

  async updateShareholder(id: string, shareholder: Partial<Shareholder>): Promise<Shareholder> {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/statutory/shareholders/${companyId}/${id}`, shareholder);
    return response.data;
  },

  async deleteShareholder(id: string): Promise<void> {
    const companyId = getCurrentCompanyId();
    await api.delete(`/statutory/shareholders/${companyId}/${id}`);
  },

  // Shares
  async getShares(params?: QueryParams): Promise<PaginatedResponse<Share>> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/shares/${companyId}`, { params });
    return response.data;
  },

  async getShare(id: string): Promise<Share> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/shares/${companyId}/${id}`);
    return response.data;
  },

  async createShare(share: Omit<Share, 'id' | 'createdAt' | 'updatedAt'>): Promise<Share> {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/statutory/shares/${companyId}`, share);
    return response.data;
  },

  async updateShare(id: string, share: Partial<Share>): Promise<Share> {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/statutory/shares/${companyId}/${id}`, share);
    return response.data;
  },

  async deleteShare(id: string): Promise<void> {
    const companyId = getCurrentCompanyId();
    await api.delete(`/statutory/shares/${companyId}/${id}`);
  },

  // Beneficial Owners
  async getBeneficialOwners(params?: QueryParams): Promise<PaginatedResponse<BeneficialOwner>> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/beneficial-owners/${companyId}`, { params });
    return response.data;
  },

  async getBeneficialOwner(id: string): Promise<BeneficialOwner> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/beneficial-owners/${companyId}/${id}`);
    return response.data;
  },

  async createBeneficialOwner(owner: Omit<BeneficialOwner, 'id' | 'createdAt' | 'updatedAt'>): Promise<BeneficialOwner> {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/statutory/beneficial-owners/${companyId}`, owner);
    return response.data;
  },

  async updateBeneficialOwner(id: string, owner: Partial<BeneficialOwner>): Promise<BeneficialOwner> {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/statutory/beneficial-owners/${companyId}/${id}`, owner);
    return response.data;
  },

  async deleteBeneficialOwner(id: string): Promise<void> {
    const companyId = getCurrentCompanyId();
    await api.delete(`/statutory/beneficial-owners/${companyId}/${id}`);
  },

  // Allotments
  async getAllotments(params?: QueryParams): Promise<PaginatedResponse<Allotment>> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/allotments/${companyId}`, { params });
    return response.data;
  },

  async getAllotment(id: string): Promise<Allotment> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/allotments/${companyId}/${id}`);
    return response.data;
  },

  async createAllotment(allotment: Omit<Allotment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Allotment> {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/statutory/allotments/${companyId}`, allotment);
    return response.data;
  },

  async updateAllotment(id: string, allotment: Partial<Allotment>): Promise<Allotment> {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/statutory/allotments/${companyId}/${id}`, allotment);
    return response.data;
  },

  async deleteAllotment(id: string): Promise<void> {
    const companyId = getCurrentCompanyId();
    await api.delete(`/statutory/allotments/${companyId}/${id}`);
  },

  // Charges
  async getCharges(params?: QueryParams): Promise<PaginatedResponse<Charge>> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/charges/${companyId}`, { params });
    return response.data;
  },

  async getCharge(id: string): Promise<Charge> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/charges/${companyId}/${id}`);
    return response.data;
  },

  async createCharge(charge: Omit<Charge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Charge> {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/statutory/charges/${companyId}`, charge);
    return response.data;
  },

  async updateCharge(id: string, charge: Partial<Charge>): Promise<Charge> {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/statutory/charges/${companyId}/${id}`, charge);
    return response.data;
  },

  async deleteCharge(id: string): Promise<void> {
    const companyId = getCurrentCompanyId();
    await api.delete(`/statutory/charges/${companyId}/${id}`);
  },

  // Meetings
  async getMeetings(params?: QueryParams): Promise<PaginatedResponse<Meeting>> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/meetings/${companyId}`, { params });
    return response.data;
  },

  async getMeeting(id: string): Promise<Meeting> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/meetings/${companyId}/${id}`);
    return response.data;
  },

  async createMeeting(meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/statutory/meetings/${companyId}`, meeting);
    return response.data;
  },

  async updateMeeting(id: string, meeting: Partial<Meeting>): Promise<Meeting> {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/statutory/meetings/${companyId}/${id}`, meeting);
    return response.data;
  },

  async deleteMeeting(id: string): Promise<void> {
    const companyId = getCurrentCompanyId();
    await api.delete(`/statutory/meetings/${companyId}/${id}`);
  },

  // Board Minutes
  async getBoardMinutes(params?: QueryParams): Promise<PaginatedResponse<BoardMinute>> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/board-minutes/${companyId}`, { params });
    return response.data;
  },

  async getBoardMinute(id: string): Promise<BoardMinute> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/board-minutes/${companyId}/${id}`);
    return response.data;
  },

  async createBoardMinute(minute: Omit<BoardMinute, 'id' | 'createdAt' | 'updatedAt'>): Promise<BoardMinute> {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/statutory/board-minutes/${companyId}`, minute);
    return response.data;
  },

  async updateBoardMinute(id: string, minute: Partial<BoardMinute>): Promise<BoardMinute> {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/statutory/board-minutes/${companyId}/${id}`, minute);
    return response.data;
  },

  async deleteBoardMinute(id: string): Promise<void> {
    const companyId = getCurrentCompanyId();
    await api.delete(`/statutory/board-minutes/${companyId}/${id}`);
  },

  // Activities
  async getActivities(params?: { entityType?: string; limit?: number }): Promise<Activity[]> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/activities/${companyId}`, { params });
    return response.data.activities;
  },

  async getActivityStatistics(): Promise<ActivityStats> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/activities/${companyId}/statistics`);
    return response.data;
  },

  // Export/Import
  async exportData(entityType: string, format: ExportFormat): Promise<Blob> {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/statutory/${entityType}/${companyId}/export/${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async importData(entityType: string, file: File): Promise<ImportResult> {
    const companyId = getCurrentCompanyId();
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/statutory/${entityType}/${companyId}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default statutoryService;
