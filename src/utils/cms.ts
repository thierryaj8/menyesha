import { Alert } from 'react-native';

export async function runCmsMutation(action: string, mutation: () => Promise<unknown>): Promise<boolean> {
  try {
    await mutation();
    return true;
  } catch (error) {
    Alert.alert(
      `${action} failed`,
      error instanceof Error ? error.message : 'Please try again.',
    );
    return false;
  }
}
