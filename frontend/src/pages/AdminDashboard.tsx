import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface UserRecord {
  id: number;
  email: string;
  role: 'student' | 'recruiter' | 'admin';
  fullName: string;
  createdAt?: string;
}

export const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add User Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newFullName, setNewFullName] = useState<string>('');
  const [newRole, setNewRole] = useState<'student' | 'recruiter' | 'admin'>('student');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.admin.getUsers();
      setUsers(res || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to retrieve users. Ensure you are logged in as an admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newEmail || !newPassword || !newFullName) {
      setFormError('All fields are required');
      return;
    }

    try {
      setSubmitting(true);
      await api.admin.createUser({
        email: newEmail,
        password: newPassword,
        role: newRole,
        fullName: newFullName
      });
      setFormSuccess('User added successfully!');
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      setNewRole('student');
      // Refresh list
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (currentUser && currentUser.id === userId) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user ${userEmail}?`)) {
      return;
    }

    try {
      await api.admin.deleteUser(userId);
      alert('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Error deleting user');
    }
  };

  return (
    <div className="container py-8 max-w-[1200px] mx-auto px-4">
      {/* Header section with live database indicator */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-slate-200/50 dark:border-white/5 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-['Outfit'] text-slate-800 dark:text-white flex items-center gap-3">
            Admin Management Portal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage system users, view registration metrics, register new personnel, or delete accounts.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setFormError(null);
            setFormSuccess(null);
          }}
          className="px-5 py-2.5 bg-[#4b61eb] hover:bg-[#3b51e6] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          {showAddForm ? 'Close Registration Form' : 'Register New User'}
        </button>
      </div>

      {/* Register User Form */}
      {showAddForm && (
        <div className="mb-8 bg-white dark:bg-[#121526] border border-[#4b61eb]/20 dark:border-[#1c223c] rounded-[24px] p-6 shadow-lg relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#4b61eb]" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Register Personnel Accounts</h2>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-500 rounded-xl text-xs mb-4">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 rounded-xl text-xs mb-4">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="Enter user's full name"
                className="w-full bg-[#fbf9f6] dark:bg-[#0b0c10] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#4b61eb] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="your.personal@gmail.com"
                className="w-full bg-[#fbf9f6] dark:bg-[#0b0c10] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#4b61eb] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#fbf9f6] dark:bg-[#0b0c10] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#4b61eb] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Account Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full bg-[#fbf9f6] dark:bg-[#0b0c10] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#4b61eb] transition-all"
              >
                <option value="student">Student / Candidate</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormError(null);
                  setFormSuccess(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-white/5 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-[#4b61eb] hover:bg-[#3b51e6] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                {submitting ? 'Creating User...' : 'Register User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#4b61eb] rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-medium mt-4">Loading system registry...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/25 text-red-500 rounded-[24px] text-center my-8">
          <h3 className="font-bold text-lg mb-2">Error Loading Registry</h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-white/5 text-xs text-slate-400 uppercase tracking-wider">
                <th className="px-8 py-5 font-semibold">User Details</th>
                <th className="px-8 py-5 font-semibold">Email</th>
                <th className="px-8 py-5 font-semibold text-center">System Role</th>
                <th className="px-8 py-5 font-semibold">Registered At</th>
                <th className="px-8 py-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-sm">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400">
                    No users registered in system database.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-4 font-semibold text-slate-800 dark:text-white flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[#4b61eb]/10 text-[#4b61eb] flex items-center justify-center text-xs">
                        {u.role === 'admin' ? '⚙️' : u.role === 'recruiter' ? '💼' : '🎓'}
                      </span>
                      <div>
                        <div className="font-bold">{u.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">ID: #{u.id}</div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-slate-500 dark:text-slate-400 font-medium">
                      {u.email}
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${u.role === 'admin'
                            ? 'bg-amber-500/10 text-amber-500'
                            : u.role === 'recruiter'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-indigo-500/10 text-[#4b61eb]'
                          }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                    </td>
                    <td className="px-8 py-4 text-right flex items-center justify-end gap-2.5">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => {
                            if (u.role === 'student') {
                              navigate(`/student-dashboard?impersonateUserId=${u.id}`);
                            } else if (u.role === 'recruiter') {
                              navigate(`/recruiter-dashboard?impersonateUserId=${u.id}`);
                            }
                          }}
                          className="px-3.5 py-1.5 bg-[#4b61eb]/15 hover:bg-[#4b61eb] text-[#4b61eb] hover:text-white text-xs font-bold rounded-xl transition-all duration-300"
                        >
                          View Dashboard
                        </button>
                      )}
                      {currentUser && currentUser.id === u.id ? (
                        <span className="text-xs text-slate-400 italic pr-2">Current Admin</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold rounded-xl transition-all duration-300"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
