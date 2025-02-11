import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import * as statutoryService from '../../services/statutory';
import { Activity } from '../../services/statutory';

interface RegistryCardData {
  count: number;
  lastUpdated?: string;
  hasUpdates?: boolean;
}

interface RegistryCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  count?: number;
  hasUpdates?: boolean;
  lastUpdated?: string;
}

interface DashboardStats {
  totalRecords: number;
  updatedToday: number;
  pendingUpdates: number;
  upToDateScore: number;
  activityScore: number;
  completenessScore: number;
}

interface ApiResponse<T> {
  items?: T[];
  total?: number;
  count?: number;
  directors?: T[];
  shareholders?: T[];
  shares?: T[];
  beneficialOwners?: T[];
  charges?: T[];
  allotments?: T[];
  meetings?: T[];
  boardMinutes?: T[];
  activities?: T[];
  [key: string]: any;
}

interface ApiListResponse<T> {
  count: number;
  items: T[];
}

interface EntityResponse<T> {
  [key: string]: {
    items: T[];
    count: number;
  };
}

interface BaseEntity {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Director extends BaseEntity {
  name: string;
  companyId: string;
}

interface Shareholder extends BaseEntity {
  name: string;
  companyId: string;
}

interface Share extends BaseEntity {
  number: string;
  companyId: string;
}

interface BeneficialOwner extends BaseEntity {
  name: string;
  companyId: string;
}

interface Charge extends BaseEntity {
  description: string;
  companyId: string;
}

interface Allotment extends BaseEntity {
  number: string;
  companyId: string;
}

interface Meeting extends BaseEntity {
  title: string;
  companyId: string;
}

interface BoardMinute extends BaseEntity {
  title: string;
  companyId: string;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRecords: 0,
    updatedToday: 0,
    pendingUpdates: 0,
    upToDateScore: 80,
    activityScore: 75,
    completenessScore: 90
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  const [registryCards, setRegistryCards] = useState<RegistryCard[]>([
    {
      id: 'directors',
      title: 'Directors & Secretaries',
      description: 'Manage and maintain records of company directors and secretaries',
      icon: 'bi bi-person-badge',
      link: '/statutory/directors'
    },
    {
      id: 'shareholders',
      title: 'Members Register',
      description: 'Track company shareholders and their holdings',
      icon: 'bi bi-people',
      link: '/statutory/shareholders'
    },
    {
      id: 'shares',
      title: 'Share Register',
      description: 'Monitor share allocations and transfers',
      icon: 'bi bi-journal-bookmark',
      link: '/statutory/shares'
    },
    {
      id: 'beneficial-owners',
      title: 'Beneficial Owners',
      description: 'Record and maintain beneficial ownership information',
      icon: 'bi bi-person-check',
      link: '/statutory/beneficial-owners'
    },
    {
      id: 'charges',
      title: 'Charges Register',
      description: 'Track company charges and mortgages',
      icon: 'bi bi-bank',
      link: '/statutory/charges'
    },
    {
      id: 'allotments',
      title: 'Share Allotments',
      description: 'Manage share allotments and transfers',
      icon: 'bi bi-plus-circle',
      link: '/statutory/allotments'
    },
    {
      id: 'meetings',
      title: 'General Meetings',
      description: 'Record and store minutes of general meetings',
      icon: 'bi bi-calendar-event',
      link: '/statutory/meetings'
    },
    {
      id: 'board-minutes',
      title: 'Board Minutes',
      description: 'Maintain records of board meetings and resolutions',
      icon: 'bi bi-file-text',
      link: '/statutory/board-minutes'
    }
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getItemsFromResponse = <T extends BaseEntity>(response: ApiResponse<T> | ApiListResponse<T> | T[]): T[] => {
    if (Array.isArray(response)) {
      return response;
    }
    
    // Handle paginated response
    if ('items' in response && Array.isArray(response.items)) {
      return response.items;
    }
    
    // Handle specific entity responses
    if ('directors' in response && Array.isArray(response.directors)) {
      return response.directors;
    }
    if ('shareholders' in response && Array.isArray(response.shareholders)) {
      return response.shareholders;
    }
    if ('shares' in response && Array.isArray(response.shares)) {
      return response.shares;
    }
    if ('beneficialOwners' in response && Array.isArray(response.beneficialOwners)) {
      return response.beneficialOwners;
    }
    if ('charges' in response && Array.isArray(response.charges)) {
      return response.charges;
    }
    if ('allotments' in response && Array.isArray(response.allotments)) {
      return response.allotments;
    }
    if ('meetings' in response && Array.isArray(response.meetings)) {
      return response.meetings;
    }
    if ('boardMinutes' in response && Array.isArray(response.boardMinutes)) {
      return response.boardMinutes;
    }
    if ('activities' in response && Array.isArray(response.activities)) {
      return response.activities;
    }
    
    return [];
  };

  const getCountFromResponse = <T extends BaseEntity>(response: ApiResponse<T> | ApiListResponse<T> | T[]): number => {
    if (Array.isArray(response)) {
      return response.length;
    }
    
    // Handle paginated response
    if ('count' in response && typeof response.count === 'number') {
      return response.count;
    }
    
    // Handle total field
    if ('total' in response && typeof response.total === 'number') {
      return response.total;
    }
    
    // Fallback to items length
    return getItemsFromResponse(response).length;
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load activities and stats
      const [activities, activityStats] = await Promise.all([
        statutoryService.getActivities({ limit: 5 }),
        statutoryService.getActivityStatistics()
      ]);

      // Load all registry data
      const [
        directors,
        shareholders,
        shares,
        beneficialOwners,
        charges,
        allotments,
        meetings,
        boardMinutes
      ] = await Promise.all([
        statutoryService.getDirectors('Active'),
        statutoryService.getShareholders('Active'),
        statutoryService.getShares('Active'),
        statutoryService.getBeneficialOwners('Active'),
        statutoryService.getCharges('Active'),
        statutoryService.getAllotments('Active'),
        statutoryService.getMeetings('Final'),
        statutoryService.getBoardMinutes('Final')
      ]);

      type RegistryData = {
        [key: string]: {
          count: number;
          lastUpdated: string;
          hasUpdates: boolean;
        };
      };

      // Update registry cards with counts and updates
      const registryData: RegistryData = {
        directors: { 
          count: getCountFromResponse(directors),
          lastUpdated: getLastUpdated(directors),
          hasUpdates: checkForUpdates(directors)
        },
        shareholders: {
          count: getCountFromResponse(shareholders),
          lastUpdated: getLastUpdated(shareholders),
          hasUpdates: checkForUpdates(shareholders)
        },
        shares: {
          count: getCountFromResponse(shares),
          lastUpdated: getLastUpdated(shares),
          hasUpdates: checkForUpdates(shares)
        },
        'beneficial-owners': {
          count: getCountFromResponse(beneficialOwners),
          lastUpdated: getLastUpdated(beneficialOwners),
          hasUpdates: checkForUpdates(beneficialOwners)
        },
        charges: {
          count: getCountFromResponse(charges),
          lastUpdated: getLastUpdated(charges),
          hasUpdates: checkForUpdates(charges)
        },
        allotments: {
          count: getCountFromResponse(allotments),
          lastUpdated: getLastUpdated(allotments),
          hasUpdates: checkForUpdates(allotments)
        },
        meetings: {
          count: getCountFromResponse(meetings),
          lastUpdated: getLastUpdated(meetings),
          hasUpdates: checkForUpdates(meetings)
        },
        'board-minutes': {
          count: getCountFromResponse(boardMinutes),
          lastUpdated: getLastUpdated(boardMinutes),
          hasUpdates: checkForUpdates(boardMinutes)
        }
      };

      // Update cards with data
      setRegistryCards(prevCards => 
        prevCards.map(card => ({
          ...card,
          count: registryData[card.id as keyof RegistryData]?.count || 0,
          lastUpdated: registryData[card.id as keyof RegistryData]?.lastUpdated,
          hasUpdates: registryData[card.id as keyof RegistryData]?.hasUpdates
        }))
      );

      // Calculate dashboard stats
      const totalRecords = Object.values(registryData).reduce((sum, data) => sum + (data.count || 0), 0);
      const updatedToday = Object.values(registryData).filter(data => data.lastUpdated === 'Today').length;
      const pendingUpdates = Object.values(registryData).filter(data => data.hasUpdates).length;

      const totalCards = Object.keys(registryData).length;
      const upToDateScore = Math.round(((totalCards - pendingUpdates) / totalCards) * 100);
      
      const recentlyUpdatedCards = Object.values(registryData).filter(data => {
        const lastUpdated = data.lastUpdated?.toLowerCase();
        return lastUpdated?.includes('day') || 
               lastUpdated?.includes('week') ||
               lastUpdated === 'today' ||
               lastUpdated === 'yesterday';
      }).length;
      
      const activityScore = Math.round((recentlyUpdatedCards / totalCards) * 100);
      const completenessScore = Math.round(Object.values(registryData)
        .filter(data => data.count > 0).length / totalCards * 100);

      setStats({
        totalRecords,
        updatedToday,
        pendingUpdates,
        upToDateScore,
        activityScore,
        completenessScore
      });

      setRecentActivity(activities.activities || []);
      
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getLastUpdated = <T extends BaseEntity>(response: ApiResponse<T> | T[]): string => {
    const items = getItemsFromResponse(response);
    if (!items?.length) return '';

    const dates = items
      .map(item => item.updatedAt || item.createdAt)
      .filter((date): date is string => !!date)
      .map(date => new Date(date).getTime());

    if (!dates.length) return '';

    const latestDate = new Date(Math.max(...dates));
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const checkForUpdates = <T extends BaseEntity>(response: ApiResponse<T> | T[]): boolean => {
    const items = getItemsFromResponse(response);
    if (!items?.length) return false;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    return items.some((item) => {
      const date = item.updatedAt || item.createdAt;
      if (!date) return false;
      const updateDate = new Date(date);
      return updateDate > thirtyDaysAgo && item.status === 'pending';
    });
  };

  const handleDownloadSummary = async () => {
    try {
      const blob = await statutoryService.downloadSummary();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'statutory_summary.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error downloading summary:', err);
      setError('Failed to download summary. Please try again.');
    }
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'appointment':
        return 'bi-person-plus';
      case 'resignation':
        return 'bi-person-dash';
      case 'update':
        return 'bi-pencil';
      case 'removal':
        return 'bi-trash';
      case 'added':
        return 'bi-plus-circle';
      case 'updated':
        return 'bi-pencil';
      case 'removed':
        return 'bi-trash';
      case 'status_changed':
        return 'bi-arrow-repeat';
      default:
        return 'bi-info-circle';
    }
  };

  const getActivityIconClass = (type: string): string => {
    switch (type) {
      case 'appointment':
      case 'added':
        return 'success';
      case 'resignation':
      case 'removal':
      case 'removed':
        return 'danger';
      case 'update':
      case 'updated':
        return 'primary';
      case 'status_changed':
        return 'warning';
      default:
        return 'info';
    }
  };

  const formatActivityTime = (time: string): string => {
    const date = new Date(time);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {error && (
        <div className="alert alert-danger mb-4">
          {error}
          <button className="btn btn-link text-danger" onClick={loadDashboardData}>Try Again</button>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-2">Statutory Dashboard</h1>
          <p className="text-muted mb-0">Overview of company statutory records and registers</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
            onClick={handleDownloadSummary}
          >
            <i className="bi bi-download"></i>
            <span>Download Summary</span>
          </button>
          <button className="btn btn-primary d-inline-flex align-items-center gap-2">
            <i className="bi bi-plus-lg"></i>
            <span>New Record</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Total Records</span>
                <i className="bi bi-journals fs-4 text-primary"></i>
              </div>
              <h3 className="mb-0">{stats.totalRecords}</h3>
              <small className="text-muted">Across all registers</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Updated Today</span>
                <i className="bi bi-clock-history fs-4 text-primary"></i>
              </div>
              <h3 className="mb-0">{stats.updatedToday}</h3>
              <small className="text-muted">Recent changes</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Pending Updates</span>
                <i className="bi bi-exclamation-circle fs-4 text-warning"></i>
              </div>
              <h3 className="mb-0">{stats.pendingUpdates}</h3>
              <small className="text-muted">Require attention</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Compliance Score</span>
                <i className="bi bi-shield-check fs-4 text-success"></i>
              </div>
              <h3 className="mb-0">{Math.round((stats.upToDateScore * 0.4) + (stats.activityScore * 0.3) + (stats.completenessScore * 0.3))}%</h3>
              <small className="text-success d-flex align-items-center gap-1">
                <i className="bi bi-arrow-up"></i>
                <span>2% this month</span>
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row g-4">
        {/* Registry Cards */}
        <div className="col-lg-8">
          <div className="row g-3">
            {registryCards.map((card) => (
              <div key={card.id} className="col-md-6">
                <Link to={card.link} className={`card h-100 text-decoration-none text-dark ${styles.hoverShadow}`}>
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="bg-light rounded p-3 position-relative">
                        <i className={`${card.icon} fs-4 text-primary`}></i>
                        {card.hasUpdates && (
                          <div className="position-absolute top-0 end-0 translate-middle">
                            <span className="badge rounded-pill bg-danger">&nbsp;</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="card-title mb-1">{card.title}</h5>
                        <p className="card-text text-muted small mb-0">{card.description}</p>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      {card.count !== undefined && (
                        <span className="badge bg-light text-dark">
                          {card.count} Record{card.count !== 1 ? 's' : ''}
                        </span>
                      )}
                      {card.lastUpdated && (
                        <small className="text-muted">
                          Updated {card.lastUpdated}
                        </small>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Compliance Progress */}
          <div className="card mb-4">
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted">Compliance Progress</h6>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small">Records Up to Date</span>
                  <span className="small">{stats.upToDateScore}%</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-success" role="progressbar" 
                       style={{ width: `${stats.upToDateScore}%` }}></div>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small">Recent Activity</span>
                  <span className="small">{stats.activityScore}%</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-info" role="progressbar" 
                       style={{ width: `${stats.activityScore}%` }}></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small">Completeness</span>
                  <span className="small">{stats.completenessScore}%</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-primary" role="progressbar" 
                       style={{ width: `${stats.completenessScore}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted">Recent Activity</h6>
              
              {recentActivity.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="list-group-item px-0">
                      <div className="d-flex align-items-start gap-3">
                        <div className={`bg-${getActivityIconClass(activity.type)} bg-opacity-10 rounded p-2`}>
                          <i className={`bi ${getActivityIcon(activity.type)} text-${getActivityIconClass(activity.type)}`}></i>
                        </div>
                        <div>
                          <p className="mb-1">{activity.description}</p>
                          <div className="d-flex align-items-center gap-2 small">
                            <span className="text-muted">{activity.entity}</span>
                            <span className="text-muted">•</span>
                            <span className="text-muted">{formatActivityTime(activity.time)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-clock fs-2 mb-2 d-block"></i>
                  <p>No recent activity</p>
                </div>
              )}

              <button className="btn btn-link text-decoration-none w-100 mt-3">
                View All Activity
                <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
