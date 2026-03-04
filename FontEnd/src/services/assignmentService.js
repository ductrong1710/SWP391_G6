import api from './api';

const parseList = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.reports)) return data.reports;
  return [];
};

const looksLikeCollector = (u) => {
  const roles = u.roles ?? u.roleNames ?? u.role ?? u.roleName ?? u.roleIds ?? null;
  if (typeof roles === 'string' && roles.toLowerCase().includes('collector')) return true;
  if (Array.isArray(roles) && roles.some(r => String(r).toLowerCase().includes('collector'))) return true;
  const possible = `${u.title ?? ''} ${u.position ?? ''} ${u.fullName ?? u.username ?? ''}`.toLowerCase();
  if (possible.includes('collector')) return true;
  return false;
};

const tryFetch = async (url, config) => {
  try {
    const resp = await api.get(url, config);
    return parseList(resp.data);
  } catch (err) {
    return null;
  }
};

const assignmentService = {
  assignCollector: async (data) => {
    const response = await api.post('/assignments', {
      requestId: parseInt(data.requestId),
      collectorId: parseInt(data.collectorId)
    });
    return response.data;
  },

  getCollectionRequests: async () => {
    try {
      const response = await api.get('/collection-requests');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.$values || data?.data || []);
    } catch (err) {
      console.warn('⚠️ Get collection-requests failed:', err?.response?.status || err.message);
      return [];
    }
  },

  getAssignmentHistory: async () => {
    try {
      const response = await api.get('/assignments');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.$values || data?.data || []);
    } catch (err) {
      console.warn('⚠️ Get assignments failed:', err?.response?.status || err.message);
      return [];
    }
  },

  cancelAssignment: async (assignmentId) => {
    const response = await api.put(`/assignments/${assignmentId}/cancel`);
    return response.data;
  },

  // Try endpoints in order that match backend routes
  getCollectors: async () => {
    const endpoints = [
      '/users/collectors',        // likely: /api/users/collectors
      '/users?role=Collector',
      '/users?role=collector',
      '/users',                   // fallback: fetch all users then filter
      '/collectors'               // last-resort (may 404)
    ];

    for (const ep of endpoints) {
      const result = await tryFetch(ep);
      if (result === null) continue; // request failed -> try next
      if (Array.isArray(result) && result.length > 0) {
        // if it's from /users endpoint, prefer filtering to collectors only
        if (ep.startsWith('/users')) {
          const filtered = result.filter(u => looksLikeCollector(u));
          if (filtered.length) return filtered;
          // if no explicit collectors detected but this is full users list, return it as fallback
          if (ep === '/users') return result;
        } else {
          return result;
        }
      } else {
        // empty array returned: if endpoint was explicit collectors, return empty; otherwise continue
        if (ep === '/users/collectors' || ep === '/collectors') return [];
        if (ep === '/users') return []; // nothing to use
        continue;
      }
    }

    console.warn('⚠️ Get collectors failed: no endpoint returned collectors.');
    return [];
  }
};

export default assignmentService;