'use client';
import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiMail } from 'react-icons/fi';

interface Subscriber {
  id: number;
  email: string;
  createdAt: string;
}

export default function CustomerManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [priceData, setPriceData] = useState<{ price: number; timestamp: string } | null>(null);

  useEffect(() => {
    fetchSubscribers();
    fetchPrice();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribers');
      const data = await response.json();
      setSubscribers(data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrice = async () => {
    try {
      const response = await fetch('/api/price');
      const data = await response.json();
      setPriceData(data);
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const handleEdit = (subscriber: Subscriber) => {
    setEditingId(subscriber.id);
    setEditEmail(subscriber.email);
  };

  const handleUpdate = async (id: number) => {
    try {
      const response = await fetch(`/api/subscribers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: editEmail }),
      });

      if (response.ok) {
        setEditingId(null);
        fetchSubscribers();
      }
    } catch (error) {
      console.error('Error updating subscriber:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      const response = await fetch(`/api/subscribers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSubscribers();
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
    }
  };

  const handleSendEmail = async (email: string) => {
    if (!priceData) return;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          price: priceData.price,
          timestamp: priceData.timestamp
        }),
      });

      if (response.ok) {
        alert('Email sent successfully!');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Customer Management</h1>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.map((subscriber, index) => (
                <tr key={subscriber.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === subscriber.id ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{subscriber.email}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      {editingId === subscriber.id ? (
                        <button
                          onClick={() => handleUpdate(subscriber.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(subscriber)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(subscriber.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleSendEmail(subscriber.email)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <FiMail className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
