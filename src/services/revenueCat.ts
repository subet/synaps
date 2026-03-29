import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { ENTITLEMENTS, REVENUECAT_API_KEY_ANDROID, REVENUECAT_API_KEY_IOS } from '../constants';

// Detect Expo Go — RevenueCat native billing is unavailable there
const isExpoGo = Constants.executionEnvironment === 'storeClient';

export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (isExpoGo) return; // Skip in Expo Go — requires a dev/production build

  try {
    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    if (Platform.OS === 'ios') {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS, appUserID: userId });
    } else {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID, appUserID: userId });
    }
  } catch {
    // Silent fail — subscriptions won't work but the rest of the app is fine
  }
}

export async function checkProStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== undefined;
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

export async function purchasePackage(packageToPurchase: any): Promise<{ isPro: boolean; customerInfo: CustomerInfo }> {
  const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
  const isPro = customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== undefined;
  return { isPro, customerInfo };
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== undefined;
  } catch {
    return false;
  }
}

export async function identifyUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch {
    // Silent fail — RevenueCat is not critical path
  }
}

export async function logOutUser(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch {
    // Silent fail
  }
}
