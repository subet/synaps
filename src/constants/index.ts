export * from './colors';
export * from './typography';

export const FREE_DECK_LIMIT = 5;
export const FREE_CARDS_PER_DECK_LIMIT = 50;
export const FREE_DOWNLOAD_LIMIT = 3;

export const REVENUECAT_API_KEY_IOS = 'appl_LtCrIghFRoqFJGYDcmMNKNSsJad';
export const REVENUECAT_API_KEY_ANDROID = 'goog_XZBCPCDcBYRtZREcoUHsWDoqdLd';

export const PRODUCTS = {
  WEEKLY: 'synaps_pro_weekly',
  MONTHLY: 'synaps_pro_monthly',
  ANNUAL: 'synaps_pro_annual',
  LIFETIME: 'synaps_pro_lifetime',
};

export const ENTITLEMENTS = {
  PRO: 'pro_access',
};

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
