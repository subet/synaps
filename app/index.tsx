import { Redirect } from 'expo-router';
import { useAppStore } from '../src/stores/useAppStore';

export default function Index() {
  const { hasSeenOnboarding } = useAppStore();

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
