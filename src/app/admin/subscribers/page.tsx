'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/AdminLayout';
import { FiSend, FiEdit, FiImage, FiTag, FiPercent, FiGift, FiClock, FiMail, FiUsers, FiPlus, FiTrash2, FiSettings, FiAlignLeft, FiAlignCenter, FiAlignRight } from 'react-icons/fi';

interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
}

interface EmailTemplate {
  subject: string;
  heading: string;
  content: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
}

interface EmailButton {
  text: string;
  link: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [activeSubscribers, setActiveSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailPreview, setEmailPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [recipientType, setRecipientType] = useState<'subscribers' | 'custom'>('subscribers');
  const [customRecipients, setCustomRecipients] = useState<string>('');
  const [scheduleEmail, setScheduleEmail] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showTemplateCustomizer, setShowTemplateCustomizer] = useState(false);
  const [emailButtons, setEmailButtons] = useState<EmailButton[]>([
    { text: 'Shop Now', link: 'https://avitoluxury.in' }
  ]);
  const [templateStyles, setTemplateStyles] = useState({
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#c19b6c',
    headingAlignment: 'center',
    logoAlignment: 'center',
    contentAlignment: 'left'
  });
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email template state
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>({
    subject: '',
    heading: '',
    content: '',
    imageUrl: '',
    buttonText: 'Shop Now',
    buttonLink: 'https://avitoluxury.in',
  });

  // Predefined templates
  const templates = {
    custom: {
      name: 'Custom Email',
      template: {
        subject: '',
        heading: '',
        content: '',
        imageUrl: '',
        buttonText: 'Shop Now',
        buttonLink: 'https://avitoluxury.in',
      }
    },
    coupon: {
      name: 'Coupon Code',
      template: {
        subject: 'Exclusive Coupon Code Just For You!',
        heading: 'Special Offer Inside!',
        content: 'Use code AVITO20 for 20% off your next purchase. Valid for the next 7 days only.',
        imageUrl: 'https://res.cloudinary.com/dzzxpyqif/image/upload/v1752956166/avito3-16_fst8wm.png',
        buttonText: 'Redeem Now',
        buttonLink: 'https://avitoluxury.in/collections',
      }
    },
    sale: {
      name: 'Sale Announcement',
      template: {
        subject: 'SALE ALERT: Up to 50% Off Premium Fragrances',
        heading: 'Our Biggest Sale of the Year!',
        content: 'Enjoy incredible discounts on our premium collection. Limited time offer - don\'t miss out!',
        imageUrl: 'https://res.cloudinary.com/dzzxpyqif/image/upload/v1752956166/avito3-16_fst8wm.png',
        buttonText: 'Shop the Sale',
        buttonLink: 'https://avitoluxury.in/sale',
      }
    },
    exclusive: {
      name: 'Exclusive Product',
      template: {
        subject: 'Introducing: Limited Edition Fragrance',
        heading: 'Exclusive Release for Our Subscribers',
        content: 'We\'ve created a limited edition fragrance available exclusively to our subscribers. Only 100 bottles available!',
        imageUrl: 'https://res.cloudinary.com/dzzxpyqif/image/upload/v1752956166/avito3-16_fst8wm.png',
        buttonText: 'View Exclusive Product',
        buttonLink: 'https://avitoluxury.in/exclusive',
      }
    }
  };

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/subscribers');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/admin/login');
            return;
          }
          throw new Error('Failed to fetch subscribers');
        }
        
        const data = await response.json();
        setSubscribers(data.subscribers);
        setActiveSubscribers(data.subscribers.filter((sub: Subscriber) => sub.isActive));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, [router]);

  const handleSendTestNotification = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notify-subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Product',
          type: 'Perfume',
          subCategory: 'Unisex',
          volume: '100ml',
          image: 'https://res.cloudinary.com/dzzxpyqif/image/upload/v1752956166/avito3-16_fst8wm.png',
          slug: 'test-product'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      const result = await response.json();
      alert(`Test notification sent: ${result.message}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test notification');
      alert('Error sending test notification');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    if (templateKey !== 'custom') {
      setEmailTemplate(templates[templateKey as keyof typeof templates].template);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError(null);
      
      // Use the API route for signed uploads instead of direct Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Send to our own API endpoint that will handle the signed upload
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      const data = await response.json();
      setEmailTemplate({...emailTemplate, imageUrl: data.url});
    } catch (error) {
      console.error('Image upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
      alert('Failed to upload image. Please try again or use a different image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleStyleChange = (property: string, value: string) => {
    setTemplateStyles(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const addEmailButton = () => {
    setEmailButtons([...emailButtons, { text: '', link: '' }]);
  };

  const removeEmailButton = (index: number) => {
    const updatedButtons = [...emailButtons];
    updatedButtons.splice(index, 1);
    setEmailButtons(updatedButtons);
  };

  const updateEmailButton = (index: number, field: 'text' | 'link', value: string) => {
    const updatedButtons = [...emailButtons];
    updatedButtons[index][field] = value;
    setEmailButtons(updatedButtons);
  };

  const handleSendCustomEmail = async () => {
    // Validate template fields
    if (!emailTemplate.subject || !emailTemplate.heading || !emailTemplate.content) {
      alert('Please fill in all required template fields (subject, heading, content)');
      return;
    }

    // Validate recipients
    if (recipientType === 'subscribers' && !sendToAll && selectedSubscribers.length === 0) {
      alert('Please select at least one subscriber or choose "Send to all active subscribers"');
      return;
    } else if (recipientType === 'custom') {
      if (!customRecipients.trim()) {
        alert('Please enter at least one email address');
        return;
      }
      
      // Simple validation of email format
      const emails = customRecipients.split(',').map(email => email.trim());
      const invalidEmails = emails.filter(email => !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
      
      if (invalidEmails.length > 0) {
        alert(`Invalid email format: ${invalidEmails.join(', ')}`);
        return;
      }
    }

    // Validate scheduled time if scheduling is enabled
    if (scheduleEmail && !scheduledTime) {
      alert('Please select a scheduled time for the email');
      return;
    }

    try {
      setSendingEmail(true);
      setError(null);
      
      // Prepare recipients based on selection type
      let recipients: string[] = [];
      if (recipientType === 'subscribers') {
        if (sendToAll) {
          recipients = activeSubscribers.map(sub => sub.email);
        } else {
          recipients = selectedSubscribers;
        }
      } else if (recipientType === 'custom') {
        // Parse custom recipients from comma-separated string
        recipients = customRecipients.split(',').map(email => email.trim());
      }
      
      console.log('Recipients prepared:', recipients);
      console.log('Recipient type:', recipientType);
      
      // Send the custom email with buttons
      const requestData = {
        template: {
          ...emailTemplate,
          buttons: emailButtons.filter(btn => btn.text && btn.link), // Only include buttons with both text and link
          styles: templateStyles // Include template styling
        },
        recipientCount: recipients.length,
        sendToAll: recipientType === 'subscribers' && sendToAll,
        selectedSubscribers: recipientType === 'subscribers' ? selectedSubscribers : [],
        customRecipients: recipientType === 'custom' ? recipients : [],
        scheduleEmail: scheduleEmail,
        scheduledTime: scheduleEmail ? new Date(scheduledTime).toISOString() : null
      };
      
      console.log('Sending request data:', requestData);
      
      const response = await fetch('/api/admin/send-custom-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 500 && errorData.message.includes('MongoDB')) {
          throw new Error('Database connection error. Please check your MongoDB connection settings.');
        } else {
          throw new Error(errorData.message || 'Failed to send custom email');
        }
      }

      const result = await response.json();
      
      if (scheduleEmail) {
        alert(`Email campaign scheduled: ${result.message}`);
      } else {
        alert(`Email campaign sent: ${result.message}`);
      }
      
      setShowEmailComposer(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send custom email';
      setError(errorMessage);
      
      // Check if it's a MongoDB connection error
      if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('MongoDB') || errorMessage.includes('Database connection')) {
        alert('Error: Database connection failed. Please check your MongoDB connection settings in .env.local file.');
      } else {
        alert('Error sending email campaign: ' + errorMessage);
      }
      
      console.error('Send email error:', err);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSubscriberSelection = (email: string) => {
    setSelectedSubscribers(prev => {
      if (prev.includes(email)) {
        return prev.filter(e => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Email Subscribers</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/admin/subscribers/scheduled-emails')}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
            >
              <FiClock className="mr-2" /> Scheduled Emails
            </button>
            <button
              onClick={() => setShowEmailComposer(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              disabled={loading || activeSubscribers.length === 0}
            >
              <FiSend className="mr-2" /> Send Custom Email
            </button>
            <button
              onClick={handleSendTestNotification}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
              disabled={loading}
            >
              <FiGift className="mr-2" /> Send Test Notification
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Email Composer Modal */}
        {showEmailComposer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Create Email Campaign</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowTemplateCustomizer(!showTemplateCustomizer)}
                      className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                      title="Template Settings"
                    >
                      <FiSettings />
                    </button>
                  <button 
                    onClick={() => setShowEmailComposer(false)}
                      className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                  >
                    &times;
                  </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Template
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {Object.entries(templates).map(([key, value]) => (
                      <div 
                        key={key}
                        className={`border p-3 rounded cursor-pointer ${selectedTemplate === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => handleTemplateChange(key)}
                      >
                        {key === 'custom' && <FiEdit className="mb-2 text-gray-600" />}
                        {key === 'coupon' && <FiTag className="mb-2 text-gray-600" />}
                        {key === 'sale' && <FiPercent className="mb-2 text-gray-600" />}
                        {key === 'exclusive' && <FiGift className="mb-2 text-gray-600" />}
                        <span className="text-sm font-medium">{value.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Template Customizer */}
                {showTemplateCustomizer && (
                  <div className="mb-6 p-4 border rounded-md bg-gray-50">
                    <h3 className="text-lg font-medium mb-3">Template Customization</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Background Color
                          </label>
                          <input
                            type="color"
                            value={templateStyles.backgroundColor}
                            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                            className="h-8 w-8 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Text Color
                          </label>
                          <input
                            type="color"
                            value={templateStyles.textColor}
                            onChange={(e) => handleStyleChange('textColor', e.target.value)}
                            className="h-8 w-8 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Accent Color
                          </label>
                          <input
                            type="color"
                            value={templateStyles.accentColor}
                            onChange={(e) => handleStyleChange('accentColor', e.target.value)}
                            className="h-8 w-8 cursor-pointer"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Logo Alignment
                          </label>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleStyleChange('logoAlignment', 'left')}
                              className={`p-2 ${templateStyles.logoAlignment === 'left' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded`}
                            >
                              <FiAlignLeft />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStyleChange('logoAlignment', 'center')}
                              className={`p-2 ${templateStyles.logoAlignment === 'center' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded`}
                            >
                              <FiAlignCenter />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStyleChange('logoAlignment', 'right')}
                              className={`p-2 ${templateStyles.logoAlignment === 'right' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded`}
                            >
                              <FiAlignRight />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Heading Alignment
                          </label>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleStyleChange('headingAlignment', 'left')}
                              className={`p-2 ${templateStyles.headingAlignment === 'left' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded`}
                            >
                              <FiAlignLeft />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStyleChange('headingAlignment', 'center')}
                              className={`p-2 ${templateStyles.headingAlignment === 'center' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded`}
                            >
                              <FiAlignCenter />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStyleChange('headingAlignment', 'right')}
                              className={`p-2 ${templateStyles.headingAlignment === 'right' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded`}
                            >
                              <FiAlignRight />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content Alignment
                          </label>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleStyleChange('contentAlignment', 'left')}
                              className={`p-2 ${templateStyles.contentAlignment === 'left' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded`}
                            >
                              <FiAlignLeft />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStyleChange('contentAlignment', 'center')}
                              className={`p-2 ${templateStyles.contentAlignment === 'center' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded`}
                            >
                              <FiAlignCenter />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStyleChange('contentAlignment', 'right')}
                              className={`p-2 ${templateStyles.contentAlignment === 'right' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded`}
                            >
                              <FiAlignRight />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Subject *
                    </label>
                    <input
                      type="text"
                      value={emailTemplate.subject}
                      onChange={(e) => setEmailTemplate({...emailTemplate, subject: e.target.value})}
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
                      value={emailTemplate.heading}
                      onChange={(e) => setEmailTemplate({...emailTemplate, heading: e.target.value})}
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
                      value={emailTemplate.content}
                      onChange={(e) => setEmailTemplate({...emailTemplate, content: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      placeholder="Enter email content"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                        disabled={uploadingImage}
                      >
                        <FiImage className="mr-2" /> {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      {emailTemplate.imageUrl && (
                        <div className="relative">
                          <img
                            src={emailTemplate.imageUrl}
                            alt="Email image"
                            className="h-16 w-16 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => setEmailTemplate({...emailTemplate, imageUrl: ''})}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                    </div>
                    {error && error.includes('upload') && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>

                  {/* Multiple Buttons Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Buttons
                      </label>
                      <button
                        type="button"
                        onClick={addEmailButton}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <FiPlus className="mr-1" /> Add Button
                      </button>
                    </div>
                    
                    {emailButtons.map((button, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={button.text}
                            onChange={(e) => updateEmailButton(index, 'text', e.target.value)}
                            placeholder="Button Text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="url"
                            value={button.link}
                            onChange={(e) => updateEmailButton(index, 'link', e.target.value)}
                            placeholder="Button Link"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEmailButton(index)}
                          className="text-red-500 hover:text-red-700"
                          disabled={emailButtons.length === 1}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recipient Selection */}
                <div className="mt-6 border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Recipients
                  </label>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div 
                      className={`border p-3 rounded cursor-pointer ${recipientType === 'subscribers' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setRecipientType('subscribers')}
                    >
                      <FiUsers className="mb-2 text-gray-600" />
                      <span className="text-sm font-medium">Subscribers</span>
                    </div>
                    <div 
                      className={`border p-3 rounded cursor-pointer ${recipientType === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setRecipientType('custom')}
                    >
                      <FiMail className="mb-2 text-gray-600" />
                      <span className="text-sm font-medium">Custom Recipients</span>
                    </div>
                  </div>

                  {recipientType === 'subscribers' ? (
                    <>
                      <div className="flex items-center space-x-2 mb-4">
                        <input
                          type="checkbox"
                          id="sendToAll"
                          checked={sendToAll}
                          onChange={() => setSendToAll(!sendToAll)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sendToAll" className="text-sm text-gray-700">
                          Send to all active subscribers ({activeSubscribers.length})
                        </label>
                      </div>

                      {!sendToAll && (
                        <div className="border rounded-md max-h-60 overflow-y-auto p-2">
                          {activeSubscribers.length === 0 ? (
                            <p className="text-gray-500 text-sm p-2">No active subscribers found</p>
                          ) : (
                            <>
                              <div className="flex justify-between items-center mb-2 px-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Selected: {selectedSubscribers.length} of {activeSubscribers.length}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (selectedSubscribers.length === activeSubscribers.length) {
                                      setSelectedSubscribers([]);
                                    } else {
                                      setSelectedSubscribers(activeSubscribers.map(s => s.email));
                                    }
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  {selectedSubscribers.length === activeSubscribers.length ? 'Deselect All' : 'Select All'}
                                </button>
                              </div>
                              {activeSubscribers.map((subscriber) => (
                                <div key={subscriber._id} className="flex items-center p-2 hover:bg-gray-50">
                                  <input
                                    type="checkbox"
                                    id={`subscriber-${subscriber._id}`}
                                    checked={selectedSubscribers.includes(subscriber.email)}
                                    onChange={() => handleSubscriberSelection(subscriber.email)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                  />
                                  <label htmlFor={`subscriber-${subscriber._id}`} className="text-sm">
                                    {subscriber.email}
                                  </label>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Enter email addresses (comma separated)
                      </label>
                      <textarea
                        value={customRecipients}
                        onChange={(e) => setCustomRecipients(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                        placeholder="email1@example.com, email2@example.com"
                      />
                    </div>
                  )}
                </div>

                {/* Email Scheduling */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="scheduleEmail"
                      checked={scheduleEmail}
                      onChange={() => setScheduleEmail(!scheduleEmail)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="scheduleEmail" className="text-sm font-medium text-gray-700 flex items-center">
                      <FiClock className="mr-1" /> Schedule for later
                    </label>
                  </div>
                  
                  {scheduleEmail && (
                    <div className="ml-6 mt-2">
                      <label className="block text-sm text-gray-700 mb-1">
                        Select date and time
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setEmailPreview(!emailPreview)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {emailPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowEmailComposer(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendCustomEmail}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                      disabled={sendingEmail || 
                        (recipientType === 'subscribers' && 
                          (sendToAll ? activeSubscribers.length === 0 : selectedSubscribers.length === 0)) ||
                        (recipientType === 'custom' && !customRecipients.trim())
                      }
                    >
                      {sendingEmail ? 'Processing...' : scheduleEmail ? 'Schedule Email' : 'Send Email'}
                    </button>
                  </div>
                </div>

                {/* Email Preview */}
                {emailPreview && (
                  <div className="mt-6 border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-2">Email Preview</h3>
                    <div className="border rounded-md p-4 bg-gray-50">
                      <div className="bg-black text-center p-6 rounded-t-md" style={{ textAlign: templateStyles.logoAlignment as "left" | "center" | "right" }}>
                        <img 
                          src="https://res.cloudinary.com/dzzxpyqif/image/upload/v1752956166/avito3-16_fst8wm.png" 
                          alt="AvitoLuxury Logo" 
                          className="max-w-[180px] h-auto mx-auto"
                          style={{ 
                            margin: templateStyles.logoAlignment === 'center' ? 'auto' : 
                                   templateStyles.logoAlignment === 'right' ? '0 0 0 auto' : '0 auto 0 0' 
                          }}
                        />
                      </div>
                      <div className="p-6 bg-white rounded-b-md" style={{ backgroundColor: templateStyles.backgroundColor, color: templateStyles.textColor }}>
                        <h2 
                          className="text-xl font-bold mb-4" 
                          style={{ 
                            color: templateStyles.accentColor,
                            textAlign: templateStyles.headingAlignment as "left" | "center" | "right"
                          }}
                        >
                          {emailTemplate.heading || 'Email Heading'}
                        </h2>
                        <p className="mb-4">Hey there,</p>
                        <p 
                          className="mb-4"
                          style={{ textAlign: templateStyles.contentAlignment as "left" | "center" | "right" }}
                        >
                          {emailTemplate.content || 'Email content will appear here.'}
                        </p>
                        
                        {emailTemplate.imageUrl && (
                          <img 
                            src={emailTemplate.imageUrl} 
                            alt="Email content" 
                            className="w-full max-h-[200px] object-cover rounded-md mb-4"
                          />
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-4" style={{ 
                          justifyContent: templateStyles.contentAlignment === 'center' ? 'center' : 
                                        templateStyles.contentAlignment === 'right' ? 'flex-end' : 'flex-start' 
                        }}>
                          {emailButtons.map((button, index) => (
                            button.text && button.link ? (
                              <a 
                                key={index}
                                href="#" 
                                className="inline-block text-white px-6 py-3 rounded-md font-bold"
                                style={{ backgroundColor: templateStyles.accentColor }}
                              >
                                {button.text}
                              </a>
                            ) : null
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
                        You are receiving this email because you subscribed to AvitoLuxury notifications.<br />
                        <a href="#" className="text-[#c19b6c]" style={{ color: templateStyles.accentColor }}>Unsubscribe</a> if you no longer wish to receive these updates.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && !showEmailComposer ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium">Subscriber List</h2>
                  <p className="text-sm text-gray-500">
                    {activeSubscribers.length} active subscribers out of {subscribers.length} total
                  </p>
                </div>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unsubscribed At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  subscribers.map((subscriber) => (
                    <tr key={subscriber._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{subscriber.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            subscriber.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {subscriber.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(subscriber.subscribedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscriber.unsubscribedAt
                          ? new Date(subscriber.unsubscribedAt).toLocaleString()
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 