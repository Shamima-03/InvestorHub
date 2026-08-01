import { useState, useEffect } from 'react';
import API from '../../services/api';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    if (statusFilter) params.set('status', statusFilter);
    API.get(`/admin/users?${params}`)
      .then(res => setUsers(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateStatus = async (id, status) => {
    await API.put(`/admin/users/${id}/status`, { status });
    fetchUsers();
  };

  const deleteUser = async id => {
    if (!confirm('Delete this user?')) return;
    await API.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="border rounded-lg px-4 py-2"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">All Roles</option>
          <option value="investor">Investor</option>
          <option value="businessman">Businessman</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="blocked">Blocked</option>
        </select>
        <button
          onClick={fetchUsers}
          className="bg-green-400 text-white px-4 py-2 rounded-lg"
        >
          Search
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-t">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-gray-500">{u.email}</td>
                  <td className="p-3">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        u.status === 'active'
                          ? 'bg-green-50 text-green-500'
                          : u.status === 'suspended'
                            ? 'bg-yellow-100 text-yellow-700'
                            : u.status === 'blocked'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {u.status !== 'active' && (
                        <button
                          onClick={() => updateStatus(u._id, 'active')}
                          className="text-green-400 hover:underline text-xs"
                        >
                          Activate
                        </button>
                      )}
                      {u.status !== 'suspended' && (
                        <button
                          onClick={() => updateStatus(u._id, 'suspended')}
                          className="text-yellow-600 hover:underline text-xs"
                        >
                          Suspend
                        </button>
                      )}
                      {u.status !== 'blocked' && (
                        <button
                          onClick={() => updateStatus(u._id, 'blocked')}
                          className="text-red-600 hover:underline text-xs"
                        >
                          Block
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="text-red-800 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
