import { ScrollView, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { trpc } from '@/lib/trpc';
export default function LiderScreen() {
 const me=trpc.auth.me.useQuery();
 const leader=trpc.lideres.getByUserId.useQuery(me.data?.id ?? 0,{enabled:!!me.data});
 const sections=[['Enviar relatório','relatorio'],['Histórico','historico'],['Membros','membros-view'],['Agenda','eventos-view'],['Anexos','anexos'],['Lembrete','lembrete']];
 return <ScreenContainer><ScrollView contentContainerStyle={{padding:24,gap:14}}>
 <Text className="text-3xl font-bold text-foreground">Minha liderança</Text>
 <Text className="text-muted">{leader.data?.celula || 'Sua célula'}</Text>
 {sections.map(([label,route])=><Pressable key={route} accessibilityRole="button" className="bg-surface border border-border rounded-2xl p-5" onPress={()=>router.push(('/lider/'+route) as any)}><Text className="text-foreground text-lg">{label}</Text></Pressable>)}
 </ScrollView></ScreenContainer>;
}
