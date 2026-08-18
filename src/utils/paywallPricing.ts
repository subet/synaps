import { Platform } from 'react-native';
import Purchases, {
  INTRO_ELIGIBILITY_STATUS,
  PERIOD_UNIT,
  PurchasesPackage,
} from 'react-native-purchases';

/**
 * Converts a store billing period to whole days.
 * Trials in this app are day-based (P3D / P7D), but week units are handled too.
 * Month/year trial periods are not expected — returns null so no wording is shown.
 */
function periodToDays(unit: PERIOD_UNIT | string, value: number): number | null {
  switch (unit) {
    case PERIOD_UNIT.DAY:
      return value;
    case PERIOD_UNIT.WEEK:
      return value * 7;
    default:
      return null;
  }
}

/**
 * Returns the free-trial length in days for a package, or null when no trial applies.
 *
 * Android: derived from `product.defaultOption.freePhase`. Play omits the free-trial
 * option entirely for ineligible users, so eligibility is handled implicitly.
 *
 * iOS: derived from `product.introPrice` when its price is 0. Eligibility must be
 * checked separately via {@link getTrialEligibilityIOS} — pass the result here.
 */
export function getTrialDays(pkg: PurchasesPackage): number | null {
  const product = pkg.product;

  if (Platform.OS === 'android') {
    const freePhase = product.defaultOption?.freePhase;
    if (!freePhase?.billingPeriod) return null;
    return periodToDays(freePhase.billingPeriod.unit, freePhase.billingPeriod.value);
  }

  const intro = product.introPrice;
  if (!intro || intro.price !== 0) return null;
  return periodToDays(intro.periodUnit, intro.periodNumberOfUnits);
}

/**
 * iOS only: returns the set of product identifiers that are ELIGIBLE for an
 * intro offer / free trial. Ineligible and UNKNOWN statuses are excluded —
 * on unknown, the safe course is to show non-trial pricing.
 * On Android returns null (eligibility is implicit in subscriptionOptions).
 */
export async function getTrialEligibilityIOS(
  productIdentifiers: string[]
): Promise<Set<string> | null> {
  if (Platform.OS !== 'ios') return null;
  try {
    const result = await Purchases.checkTrialOrIntroductoryPriceEligibility(productIdentifiers);
    const eligible = new Set<string>();
    for (const [productId, eligibility] of Object.entries(result)) {
      if (eligibility.status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE) {
        eligible.add(productId);
      }
    }
    return eligible;
  } catch {
    // On failure, treat everyone as ineligible — never promise a trial we can't verify.
    return new Set<string>();
  }
}

/**
 * Computes the annual-vs-monthly savings percentage from real store prices,
 * rounded to the nearest 5%. Returns null when the numbers are missing or
 * unreliable (then the badge is simply hidden).
 */
export function computeAnnualSavingsPercent(
  annualPkg: PurchasesPackage | undefined,
  monthlyPkg: PurchasesPackage | undefined
): number | null {
  const annual = annualPkg?.product.price;
  const monthly = monthlyPkg?.product.price;
  if (!annual || !monthly || monthly <= 0 || annual <= 0) return null;
  const raw = (1 - annual / (monthly * 12)) * 100;
  const rounded = Math.round(raw / 5) * 5;
  if (rounded < 5 || rounded >= 100) return null;
  return rounded;
}
