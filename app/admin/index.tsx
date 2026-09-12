import { ScrollView, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
const sections = [
['Membros','membros'],['Células','celulas'],['Líderes','lideres'],['Relatórios','relatorios'],
['Agenda','eventos'],['Inscrições','inscricoes-eventos'],['Orações','oracao'],['Notícias','noticias'],
['Aviso importante','aviso-importante'],['Recados','recados-importantes'],['Contribuições','contribuicao'],
['Escola de Crescimento','escola-crescimento'],['Anexos','anexos'],['Pagamentos de eventos','pagamentos-eventos'],
['Aniversariantes','aniversariantes-gerenciar'],
];
export default function AdminScreen() {
 return <ScreenContainer><ScrollView contentContainerStyle={{padding:24,gap:12,paddingBottom:60}}>
 <Text className="text-3xl font-bold text-foreground">Administração</Text>
 <Text className="text-muted mb-4">Cuide da programação e da comunidade.</Text>
 {sections.map(([label,route])=><Pressable key={route} accessibilityRole="button" className="bg-surface border border-border rounded-2xl p-5" onPress={()=>router.push(('/admin/'+route) as any)}>
 <Text className="text-foreground text-lg">{label}</Text></Pressable>)}
 </ScrollView></ScreenContainer>;
}
