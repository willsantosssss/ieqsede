import { Stack, Redirect } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';
import { trpc } from '@/lib/trpc';
export default function AdminLayout() {
 const me=trpc.auth.me.useQuery(undefined,{staleTime:0});
 if(me.isLoading) return <ActivityIndicator />;
 if(!me.data) return <Redirect href="/login" />;
 if(me.data.role!=='admin') return <Text>Acesso restrito à administração.</Text>;
 return <Stack screenOptions={{headerShown:false}} />;
}
