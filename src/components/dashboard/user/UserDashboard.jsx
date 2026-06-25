'use client';

import { useAuthStore } from '@/store/authStore';
import { useEffect, useState, useCallback } from 'react';
import { useTheme } from '@/hooks/useTheme';
import api from '@/lib/api';
import Loader from '@/shared/Loader';
import WelcomeHeader from './WelcomeHeader';
import CategorySelector from './CategorySelector';
import RecentQuotes from './RecentQuotes';
import StreakCard from './StreakCard';
import StatsCards from './StatsCards';

export default function UserDashboard() {
  const { user, isInitialized } = useAuthStore();
  const { theme } = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('random');
  const [dailyQuote, setDailyQuote] = useState(null);
  const [weeklyQuotes, setWeeklyQuotes] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalFavorites: 0,
    totalScans: 0,
    subscriptionType: 'free',
  });
  const [greeting, setGreeting] = useState('Good Afternoon');

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Fetch functions
  const fetchDailyQuote = useCallback(async () => {
    try {
      const response = await api.get('/quotes/random');
      const quoteData = response.data?.data || response.data;
      setDailyQuote(quoteData);
    } catch (error) {
      setDailyQuote({
        text: 'Stay positive, work hard, make it happen.',
        category: 'motivation',
        author: 'InspireTag',
      });
    }
  }, []);

  const fetchWeeklyQuotes = useCallback(async () => {
    try {
      const response = await api.get('/scan/history?limit=7');
      const scans = response.data?.data || response.data || [];
      const quotes = scans.map((scan) => ({
        text: scan.quote?.text || scan.text || 'No quote available...',
        category: scan.category || 'general',
        date: scan.createdAt || scan.date,
      }));

      if (quotes.length === 0) {
        setWeeklyQuotes([
          { text: 'Faith test quote Ochoa...', category: 'faith', date: '2026-06-01' },
          { text: 'Holden...', category: 'motivation', date: '2026-05-27' },
          { text: 'No quote available...', category: 'motivation', date: '2026-05-19' },
          { text: "You know you're in love when...", category: 'love', date: '2026-05-02' },
          { text: "If you want to know what a man's like...", category: 'motivation', date: '2026-05-02' },
        ]);
      } else {
        setWeeklyQuotes(quotes);
      }
    } catch (error) {
      setWeeklyQuotes([]);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [ordersRes, favoritesRes, scansRes] = await Promise.all([
        api.get('/orders').catch(() => ({ data: { data: [] } })),
        api.get('/favorites').catch(() => ({ data: { data: [] } })),
        api.get('/scan/history').catch(() => ({ data: { data: [] } })),
      ]);

      const orders = ordersRes.data?.data || ordersRes.data || [];
      const favorites = favoritesRes.data?.data || favoritesRes.data || [];
      const scans = scansRes.data?.data || scansRes.data || [];

      setStats({
        totalOrders: Array.isArray(orders) ? orders.length : 24,
        totalFavorites: Array.isArray(favorites) ? favorites.length : 8,
        totalScans: Array.isArray(scans) ? scans.length : 15,
        subscriptionType: user?.subscriptionType || 'free',
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user]);

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchDailyQuote(), fetchWeeklyQuotes(), fetchStats()]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchDailyQuote, fetchWeeklyQuotes, fetchStats]);

  // Initial load
  useEffect(() => {
    if (!isInitialized) return;
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, isInitialized, loadData]);

  // Handle category change
  const handleCategorySelect = useCallback(async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      const response = await api.post('/scan/unlock/demo', { category: categoryId });
      const result = response.data?.data || response.data;
      
      toast.success(`New quote from ${categoryId} category!`, {
        style: { background: '#1e1e2d', color: '#fff' },
      });

      if (result?.quote) {
        setDailyQuote(result.quote);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get quote', {
        style: { background: '#1e1e2d', color: '#fff' },
      });
    }
  }, []);

  if (loading) {
    return <Loader text="Qkey..." size={50} fullScreen />;
  }

  return (
    <div 
      className="flex-1 w-full min-h-screen p-4 lg:p-6 overflow-hidden"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.foreground,
      }}
    >
      <WelcomeHeader 
        greeting={greeting} 
        userName={user?.name?.split(' ')[0] || 'Dd'} 
        dailyQuote={dailyQuote} 
      />
      
      <CategorySelector 
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentQuotes quotes={weeklyQuotes} />
        </div>
        <StreakCard />
      </div>
      
      <StatsCards stats={stats} />
    </div>
  );
}