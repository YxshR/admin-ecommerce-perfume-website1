'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/AdminLayout';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { use } from 'react';

interface EmailTemplate {
  subject: string;
  heading: string;
  content: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  buttons?: Array<{ text: string; link: string }>;
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    headingAlignment?: 'left' | 'center' | 'right';
    logoAlignment?: 'left' | 'center' | 'right';
    contentAlignment?: 'left' | 'center' | 'right';
  };
}

interface ScheduledEmail {
  _id: string;
  template: EmailTemplate;
  recipients: string[];
  scheduledTime: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  createdAt: string;
}

export default function EditEmailPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const emailId = unwrappedParams.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduledEmail, setScheduledEmail] = useState<ScheduledEmail | null>(null);
  const [template, setTemplate] = useState<EmailTemplate>({
    subject: '',
    heading: '',
    content: '',
    imageUrl: '',
    buttonText: '',
    buttonLink: '',
    buttons: [],
    styles: {
      backgroundColor: '#ffffff',
      textColor: '#333333',
      accentColor: '#c19b6c',
      headingAlignment: 'center',
      logoAlignment: 'center',
      contentAlignment: 'left'
    }
  });
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchScheduledEmail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/scheduled-emails/${emailId}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/admin/login');
            return;
          }
          if (response.status === 404) {
            setError('Scheduled email not found');
            return;
          }
          throw new Error('Failed to fetch scheduled email');
        }
        
        const data = await response.json();
        setScheduledEmail(data.scheduledEmail);
        
        // Set template data
        if (data.scheduledEmail.template) {
          setTemplate({
            ...data.scheduledEmail.template,
            // Ensure buttons is an array
            buttons: data.scheduledEmail.template.buttons || [],
            // Ensure styles object exists
            styles: data.scheduledEmail.template.styles || {
              backgroundColor: '#ffffff',
              textColor: '#333333',
              accentColor: '#c19b6c',
              headingAlignment: 'center',
              logoAlignment: 'center',
              contentAlignment: 'left'
            }
          });
        }
        
        // Set scheduled time in local datetime format
        const date = new Date(data.scheduledEmail.scheduledTime);
        setScheduledTime(date.toISOString().slice(0, 16));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledEmail();
  }, [emailId, router]);

  const handleSaveChanges = async () => {
    if (!template.subject || !template.heading || !template.content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch(`/api/admin/scheduled-emails/${emailId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template,
          scheduledTime: new Date(scheduledTime).toISOString()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update scheduled email');
      }
      
      alert('Email updated successfully');
      router.push('/admin/subscribers/scheduled-emails');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email');
      alert('Error updating email');
    } finally {
      setSaving(false);
    }
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplate({ ...template, subject: e.target.value });
  };

  const handleHeadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplate({ ...template, heading: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate({ ...template, content: e.target.value });
  };

  const handleButtonTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplate({ ...template, buttonText: e.target.value });
  };

  const handleButtonLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplate({ ...template, buttonLink: e.target.value });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Scheduled Email</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/admin/subscribers/scheduled-emails')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
            >
              <FiArrowLeft className="mr-2" /> Back to Scheduled Emails
            </button>
            <button
              onClick={handleSaveChanges}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              disabled={saving || loading}
            >
              <FiSave className="mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : scheduledEmail ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Email Content</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Subject *
                    </label>
                    <input
                      type="text"
                      value={template.subject}
                      onChange={handleSubjectChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email subject"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heading *
                    </label>
                    <input
                      type="text"
                      value={template.heading}
                      onChange={handleHeadingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email heading"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={template.content}
                      onChange={handleContentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                      placeholder="Enter email content"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={template.imageUrl}
                      onChange={(e) => setTemplate({...template, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter image URL"
                    />
                    {template.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={template.imageUrl}
                          alt="Email image preview"
                          className="h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={template.buttonText || ''}
                        onChange={handleButtonTextChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter button text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Link
                      </label>
                      <input
                        type="url"
                        value={template.buttonLink || ''}
                        onChange={handleButtonLinkChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://avitoluxury.in"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4">Schedule & Recipients</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipients
                    </label>
                    <div className="p-3 bg-gray-100 rounded-md">
                      <p className="text-sm">{scheduledEmail.recipients.length} recipients</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      scheduledEmail.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : scheduledEmail.status === 'sent'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {scheduledEmail.status.charAt(0).toUpperCase() + scheduledEmail.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Scheduled email not found
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 