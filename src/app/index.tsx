import { Redirect } from 'expo-router';
import { useApp } from '@/store/AppProvider';

/** Root route: point signed-out users at the login screen, admins at the portal. */
export default function Index() {
  const { phase } = useApp();
  return <Redirect href={phase === 'signedIn' ? '/admin' : '/login'} />;
}
