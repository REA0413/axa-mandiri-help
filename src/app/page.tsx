'use client';
import { useState, useEffect } from "react";

export default function Home() {
  const [priceData, setPriceData] = useState<{ price: number; timestamp: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/price');
        const data = await response.json();
        setPriceData(data);
      } catch (error) {
        console.error('Error fetching price:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Yesterday's Sell Price */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Yesterday's Sell Price</h2>
          {loading ? (
            <div>Loading...</div>
          ) : priceData ? (
            <>
              <div className="text-3xl font-bold text-blue-600">
                IDR {priceData.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Last updated: {new Date(priceData.timestamp).toLocaleString()}
              </div>
            </>
          ) : (
            <div>Failed to load price</div>
          )}
        </div>
        {/* Rest of your components... */}
      </div>
    </div>
  );
}
