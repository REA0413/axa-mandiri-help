'use client';
import { useState, useEffect } from "react";
import { FiMail } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import Image from 'next/image';
import { translations } from '@/config/languages';

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [priceData, setPriceData] = useState<{ price: number; timestamp: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");

  const t = (key: keyof typeof translations.en) => translations[language][key];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const calculateReturnAmount = () => {
    if (!investmentAmount || !buyingPrice) return { units: 0, returnAmount: 0, profitLoss: 0 };
    
    const cleanInvestmentAmount = investmentAmount.replace(/,/g, '');
    const units = parseFloat(cleanInvestmentAmount) / parseFloat(buyingPrice);
    const currentPrice = priceData?.price || 0;
    const returnAmount = units * currentPrice;
    const profitLoss = returnAmount - parseFloat(cleanInvestmentAmount);
    
    return { units, returnAmount, profitLoss };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Language Switcher */}
        <div className="flex justify-end">
          <button
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            className="bg-white px-4 py-2 rounded-md shadow text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {language === 'en' ? '🇮🇩 Bahasa' : '🇬🇧 English'}
          </button>
        </div>

        {/* Header Section with Image */}
        <div className="bg-white rounded-lg shadow p-6 mt-2">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            <div className="w-full md:w-1/3">
              <Image
                src="/decision-making.png"
                alt="Decision Making"
                width={300}
                height={300}
                className="w-full h-auto"
                priority
              />
            </div>
            <div className="w-full md:w-2/3">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('welcome')}</h1>
              <p className="text-gray-600 mb-4">
                {t('intro1').prefix}
                <strong>{t('intro1').highlight}</strong>
                {t('intro1').suffix}
              </p>
              <p className="text-gray-600 mb-4">{t('intro2')}</p>
              <p className="text-gray-600">{t('intro3')}</p>
            </div>
          </div>
        </div>

        {/* Yesterday's Sell Price */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('yesterdayPrice')}</h2>
          <p className="text-gray-600 mb-2">
            {t('priceExplanation')}
          </p>
          {loading ? (
            <div>Loading...</div>
          ) : priceData ? (
            <>
              <div className="text-3xl font-bold text-blue-600">
                IDR {priceData.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {t('lastUpdated')}: {formatDate(priceData.timestamp)}
              </div>
            </>
          ) : (
            <div>Failed to load price</div>
          )}
        </div>

        {/* Investment Calculator */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('calculator')}</h2>
          <p className="text-gray-600 text-sm mb-4">
            <em>{t('calculatorNote')}</em>
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="investment" className="block font-medium text-gray-700">
                {t('investmentAmount')}
              </label>
              <input
                type="text"
                id="investment"
                value={investmentAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  setInvestmentAmount(value.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="1,000,000"
              />
            </div>
            <div>
              <label htmlFor="buyingPrice" className="block font-medium text-gray-700">
                {t('buyingPrice')}
              </label>
              <input
                type="number"
                id="buyingPrice"
                value={buyingPrice}
                onChange={(e) => setBuyingPrice(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="100"
              />
            </div>
          </div>
        </div>

        {/* Potential Return */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('summary')}</h2>
          {investmentAmount && buyingPrice ? (
            <>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">{t('unitsOwned')}: </span>
                  <span className="font-semibold">{calculateReturnAmount().units.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('potentialReturn')}: </span>
                  <span className="font-bold text-blue-600">
                    IDR {calculateReturnAmount().returnAmount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('profitLoss')}: </span>
                  <span className={`font-bold ${calculateReturnAmount().profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    IDR {calculateReturnAmount().profitLoss.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                <em>{t('summaryNote')}</em>
              </div>
            </>
          ) : (
            <div className="text-gray-500">
              {t('enterDetails')}
            </div>
          )}
        </div>

        {/* Email Subscription Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('subscribe')}</h2>
          <p className="text-gray-600 mb-4">
            {t('subscribeNote')}
          </p>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('emailAddress')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t('subscribeButton')}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center space-y-4">
        <div className="flex justify-center gap-4">
          <a
            href="mailto:cctozfnt@gmail.com"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Email"
          >
            <FiMail size={24} />
          </a>
          <a
            href="https://twitter.com/andong_ff"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Twitter"
          >
            <FaXTwitter size={22} />
          </a>
        </div>
        
        <div className="space-y-1">
          <a
            href="http://www.onlinewebfonts.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 block"
          >
            Web Fonts Author Credit
          </a>
        </div>
      </div>
        
      </div>
    </div>
  );
}
