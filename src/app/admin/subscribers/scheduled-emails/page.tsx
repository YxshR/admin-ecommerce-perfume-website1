'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/AdminLayout';
import { FiClock, FiCheck, FiX, FiTrash2, FiSend, FiEdit, FiCalendar, FiRefreshCw } from 'react-icons/fi';

interface ScheduledEmail {
  _id: string;
  template: {
    subject: string;
    heading: string;
    content: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    buttons?: Array<{ text: string; link: string }>;
    styles?: {
      backgroundColor?: string;
      textColor?: string;
      accentColor?: string;
      headingAlignment?: 'left' | 'center' | 'right';
      logoAlignment?: 'left' | 'center' | 'right';
      contentAlignment?: 'left' | 'center' | 'right';
    };
  };
  recipients: string[];
  scheduledTime: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  createdAt: string;
}

export default function ScheduledEmailsPage() {
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingEmail, setProcessingEmail] = useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [newScheduledTime, setNewScheduledTime] = useState<string>('');
  const [triggeringCron, setTriggeringCron] = useState(false);
  const [processingManually, setProcessingManually] = useState(false);
  const [timeRange, setTimeRange] = useState(5); // Default to 5 minutes
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);
  const [cronStatus, setCronStatus] = useState<any>(null);
  const [loadingCronStatus, setLoadingCronStatus] = useState(false);
  const router = useRouter();

  const handleDeleteScheduledEmail = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled email?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/scheduled-emails/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete scheduled email');
      }
      
      setScheduledEmails(prev => prev.filter(email => email._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      alert('Failed to delete scheduled email');
    }
  };

  const handleTriggerEmail = async (id: string) => {
    if (!confirm('Are you sure you want to send this email now?')) {
      return;
    }
    
    try {
      setProcessingEmail(id);
      const response = await fetch('/api/admin/trigger-scheduled-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailId: id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger scheduled email');
      }
      
      const result = await response.json();
      alert(`Email processed: ${result.message}`);
      
      // Refresh the list
      fetchScheduledEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      alert('Failed to trigger scheduled email');
    } finally {
      setProcessingEmail(null);
    }
  };

  const handleTriggerAllEmails = async () => {
    if (!confirm('Are you sure you want to send all pending emails now?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/trigger-scheduled-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger scheduled emails');
      }
      
      const result = await response.json();
      alert(`Emails processed: ${result.message}`);
      
      // Refresh the list
      fetchScheduledEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      alert('Failed to trigger scheduled emails');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerCronJob = async () => {
    if (!confirm('Are you sure you want to manually trigger the cron job to process scheduled emails?')) {
      return;
    }
    
    try {
      setTriggeringCron(true);
      const response = await fetch('/api/admin/test-cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger cron job');
      }
      
      const result = await response.json();
      alert(`Cron job triggered: ${result.message}`);
      
      // Refresh the list
      fetchScheduledEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      alert('Failed to trigger cron job');
    } finally {
      setTriggeringCron(false);
    }
  };

  const handleShowTimeRangeModal = () => {
    setShowTimeRangeModal(true);
  };

  const handleProcessEmailsNow = async () => {
    try {
      setProcessingManually(true);
      setShowTimeRangeModal(false);
      
      const response = await fetch('/api/admin/process-emails-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeRange }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process emails');
      }
      
      const result = await response.json();
      alert(`Processed emails: ${result.message}`);
      
      // Refresh the list
      fetchScheduledEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      alert('Failed to process emails');
    } finally {
      setProcessingManually(false);
    }
  };

  const handleOpenRescheduleModal = (id: string, currentScheduledTime: string) => {
    setSelectedEmailId(id);
    // Convert to local datetime-local format
    const date = new Date(currentScheduledTime);
    setNewScheduledTime(date.toISOString().slice(0, 16));
    setShowRescheduleModal(true);
  };

  const handleRescheduleEmail = async () => {
    if (!selectedEmailId || !newScheduledTime) {
      return;
    }
    
    try {
      setProcessingEmail(selectedEmailId);
      const response = await fetch(`/api/admin/scheduled-emails/${selectedEmailId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduledTime: new Date(newScheduledTime).toISOString() }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reschedule email');
      }
      
      alert('Email rescheduled successfully');
      setShowRescheduleModal(false);
      
      // Refresh the list
      fetchScheduledEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      alert('Failed to reschedule email');
    } finally {
      setProcessingEmail(null);
    }
  };

  const handleEditEmail = (id: string) => {
    // Navigate to edit page with the email ID
    router.push(`/admin/subscribers/edit-email/${id}`);
  };

  const fetchScheduledEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/scheduled-emails');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch scheduled emails');
      }
      
      const data = await response.json();
      setScheduledEmails(data.scheduledEmails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCronStatus = async () => {
    try {
      setLoadingCronStatus(true);
      const response = await fetch('/api/admin/cron-status');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch cron status');
      }
      
      const data = await response.json();
      setCronStatus(data);
    } catch (err) {
      console.error('Error fetching cron status:', err);
    } finally {
      setLoadingCronStatus(false);
    }
  };

  useEffect(() => {
    fetchScheduledEmails();
    fetchCronStatus();
    
    // Refresh cron status every minute
    const statusInterval = setInterval(fetchCronStatus, 60000);
    
    return () => {
      clearInterval(statusInterval);
    };
  }, [router]);

  // Add useEffect to periodically check for emails that need to be sent
  useEffect(() => {
    // Initial fetch
    fetchScheduledEmails();
    
    // Set up interval to check for emails every 30 seconds
    const checkInterval = setInterval(async () => {
      try {
        // Call the API endpoint to process scheduled emails
        const response = await fetch('/api/cron/process-scheduled-emails', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer development-secret`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.results && result.results.length > 0) {
            console.log('Processed emails:', result.message);
            // Refresh the list if emails were processed
            fetchScheduledEmails();
          }
        }
      } catch (err) {
        console.error('Error checking for scheduled emails:', err);
      }
    }, 30000); // Check every 30 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(checkInterval);
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Scheduled Emails</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleTriggerCronJob}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
              disabled={triggeringCron}
            >
              <FiClock className="mr-2" /> {triggeringCron ? 'Processing...' : 'Check Scheduled Emails'}
            </button>
            <button
              onClick={handleShowTimeRangeModal}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
              disabled={processingManually}
            >
              <FiSend className="mr-2" /> {processingManually ? 'Processing...' : 'Process Emails Now'}
            </button>
            <button
              onClick={handleTriggerAllEmails}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              disabled={loading || scheduledEmails.filter(email => email.status === 'pending').length === 0}
            >
              <FiSend className="mr-2" /> Send All Pending Emails
            </button>
            <button
              onClick={() => router.push('/admin/subscribers')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
            >
              Back to Subscribers
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Cron Status */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <span className="mr-2">Cron Job Status</span>
            <button 
              onClick={fetchCronStatus}
              className="text-blue-500 hover:text-blue-700"
              disabled={loadingCronStatus}
            >
              <FiRefreshCw className={`${loadingCronStatus ? 'animate-spin' : ''}`} />
            </button>
          </h2>
          
          {cronStatus ? (
            <div className="text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500">Server Time</div>
                  <div>{new Date(cronStatus.serverTime).toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500">Indian Time (IST)</div>
                  <div>{new Date(cronStatus.istTime).toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500">Active Cron Jobs</div>
                  <div>{cronStatus.cronJobs.length}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="flex items-center">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                    Running
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Name</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cronStatus.cronJobs.map((job: any) => (
                      <tr key={job.name}>
                        <td className="py-2 px-3 whitespace-nowrap">{job.name}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.running ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {job.running ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(job.lastRun).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                <p>Emails are automatically processed every 30 seconds by the node-cron service.</p>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              {loadingCronStatus ? 'Loading cron status...' : 'Cron status not available'}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium">Scheduled Email Campaigns</h2>
                  <p className="text-sm text-gray-500">
                    {scheduledEmails.filter(email => email.status === 'pending').length} pending, 
                    {scheduledEmails.filter(email => email.status === 'sent').length} sent, 
                    {scheduledEmails.filter(email => email.status === 'failed').length} failed
                  </p>
                </div>
              </div>
            </div>
            
            {scheduledEmails.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No scheduled emails found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipients
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scheduled For
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scheduledEmails.map((email) => (
                      <tr key={email._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{email.template.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{email.recipients.length}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(email.scheduledTime)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              email.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : email.status === 'sent'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {email.status === 'pending' && <FiClock className="mr-1" />}
                            {email.status === 'sent' && <FiCheck className="mr-1" />}
                            {email.status === 'failed' && <FiX className="mr-1" />}
                            {email.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(email.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {email.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleTriggerEmail(email._id)}
                                  className="text-green-600 hover:text-green-900"
                                  disabled={processingEmail === email._id}
                                  title="Send now"
                                >
                                  <FiSend />
                                </button>
                                <button
                                  onClick={() => handleOpenRescheduleModal(email._id, email.scheduledTime)}
                                  className="text-blue-600 hover:text-blue-900"
                                  disabled={processingEmail === email._id}
                                  title="Reschedule"
                                >
                                  <FiCalendar />
                                </button>
                                <button
                                  onClick={() => handleEditEmail(email._id)}
                                  className="text-purple-600 hover:text-purple-900"
                                  disabled={processingEmail === email._id}
                                  title="Edit email"
                                >
                                  <FiEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteScheduledEmail(email._id)}
                                  className="text-red-600 hover:text-red-900"
                                  disabled={processingEmail === email._id}
                                  title="Delete"
                                >
                                  <FiTrash2 />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Time Range Modal */}
      {showTimeRangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Process Emails</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range (minutes)
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Process emails scheduled within ±{timeRange} minutes from now
              </p>
              <input
                type="range"
                min="1"
                max="60"
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 min</span>
                <span>30 min</span>
                <span>60 min</span>
              </div>
              <div className="mt-2 text-center font-bold">
                {timeRange} minutes
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowTimeRangeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessEmailsNow}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={processingManually}
              >
                {processingManually ? 'Processing...' : 'Process Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Reschedule Email</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Schedule Time
              </label>
              <input
                type="datetime-local"
                value={newScheduledTime}
                onChange={(e) => setNewScheduledTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!newScheduledTime || processingEmail === selectedEmailId}
              >
                {processingEmail === selectedEmailId ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 