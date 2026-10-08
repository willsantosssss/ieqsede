import { Stack, Redirect } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';
import { trpc } from '@/lib/trpc';
export default function LiderLayout() {
 const me=trpc.auth.me.useQuery();
 const leader=trpc.lideres.getByUserId.useQuery(me.data?.id ?? 0,{enabled:!!me.data,staleTime:0});
 if(me.isLoading || (me.data && leader.isLoading)) return <ActivityIndicator />;
 if(!me.data) return <Redirect href="/login" />;
 if(!leader.data || leader.data.ativo!==1) return <Text>Sua conta ainda não está vinculada a uma liderança ativa.</Text>;
 return <Stack screenOptions={{headerShown:false}} />;
}
