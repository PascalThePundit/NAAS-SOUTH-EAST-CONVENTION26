import { supabase } from './supabaseClient';

const STORAGE_KEY = 'naas_convention_visited_session';

/**
 * Increments the page view counter if the user hasn't visited in this session.
 */
export const trackPageView = async () => {
  try {
    // Check if we've already counted this user in the current session
    const hasVisited = sessionStorage.getItem(STORAGE_KEY);

    if (!hasVisited) {
      // Call the Supabase RPC function to increment
      const { error } = await supabase.rpc('increment_page_view');

      if (error) {
        console.error('Error tracking page view:', error);
      } else {
        // Mark as visited for this session
        sessionStorage.setItem(STORAGE_KEY, 'true');
        console.log('Page view tracked.');
      }
    }
  } catch (err) {
    console.error('Analytics error:', err);
  }
};

/**
 * Fetches the current visitor count.
 * @returns {Promise<number|null>} The count or null if error.
 */
export const getVisitorCount = async () => {
  try {
    const { data, error } = await supabase
      .from('site_analytics')
      .select('count')
      .eq('name', 'page_views')
      .single();

    if (error) {
      console.error('Error fetching visitor count:', error);
      return null;
    }

    return data?.count || 0;
  } catch (err) {
    console.error('Analytics fetch error:', err);
    return null;
  }
};
