import { ScrollView, Text, View, Pressable, RefreshControl } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';
import { church } from '@/config/church';
import { useDevocionaiProgressivo } from '@/hooks/use-devocional-progressivo';

export default function HomeScreen() {
 const colors=useColors();
 const [refreshing,setRefreshing]=useState(false);
 const me=trpc.auth.me.useQuery();
 const events=trpc.eventos.list.useQuery(undefined,{staleTime:300000});
 const notice=trpc.avisoImportante.get.useQuery(undefined,{staleTime:300000});
 const {capitulo,loading,carregarCapituloDoDia}=useDevocionaiProgressivo('NAA');
 const firstName=me.data?.name?.split(' ')[0];
 const initials=(me.data?.name || church.shortName).split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
 const today=new Date();today.setHours(0,0,0,0);
 const nextEvent=(events.data||[]).filter((e:any)=>new Date(e.data+'T23:59:59')>=today).sort((a:any,b:any)=>String(a.data).localeCompare(String(b.data)))[0];
 async function refresh(){setRefreshing(true);try{await Promise.all([events.refetch(),notice.refetch(),carregarCapituloDoDia()]);}finally{setRefreshing(false);}}
 const shortcuts=[['Células','Encontre sua comunidade','/(tabs)/celulas'],['Oração','Caminhamos juntos','/(tabs)/oracao'],['Agenda','Nossos próximos encontros','/(tabs)/agenda'],['Mais','Tudo da sua igreja','/(tabs)/mais']];
 return <ScreenContainer><ScrollView contentContainerStyle={{padding:24,gap:24,paddingBottom:40}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
 <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
 <View><Text style={{color:colors.muted,fontSize:12,letterSpacing:2}}>{church.shortName.toUpperCase()}</Text><Text style={{color:colors.foreground,fontSize:28,fontWeight:'700',marginTop:8}}>Olá{firstName?', '+firstName:''}.</Text></View>
 <Pressable onPress={()=>router.push('/perfil')} accessibilityLabel="Abrir meu perfil" accessibilityRole="button" style={{width:48,height:48,borderRadius:24,alignItems:'center',justifyContent:'center',backgroundColor:colors.surface}}><Text style={{color:colors.primary,fontWeight:'700'}}>{initials}</Text></Pressable>
 </View>
 <Pressable onPress={()=>router.push('/(tabs)/devocional')} accessibilityRole="button" style={{backgroundColor:colors.primary,borderRadius:28,padding:26,gap:14}}>
 <Text style={{color:'#FFFFFF',fontSize:12,letterSpacing:2}}>UM TEMPO COM DEUS</Text>
 <Text style={{color:'#FFFFFF',fontSize:28,fontWeight:'700'}}>A Palavra para{ '\n' }o seu dia.</Text>
 <Text style={{color:'#FFFFFF',fontSize:16}}>{loading?'Preparando sua leitura…':capitulo?capitulo.livro+' '+capitulo.numero:'Abra o devocional de hoje'}</Text>
 <Text style={{color:'#FFFFFF',fontWeight:'600',marginTop:8}}>Ler devocional →</Text>
 </Pressable>
 {notice.data?.ativo===1 && <View style={{padding:20,borderRadius:20,backgroundColor:colors.surface,gap:8}}><Text style={{color:colors.foreground,fontWeight:'700',fontSize:18}}>{notice.data.titulo}</Text><Text style={{color:colors.muted}}>{notice.data.mensagem}</Text></View>}
 <View style={{gap:12}}><Text style={{fontSize:20,fontWeight:'700',color:colors.foreground}}>Vida em comunidade</Text>
 <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{shortcuts.map(([title,subtitle,route])=><Pressable key={title} accessibilityRole="button" onPress={()=>router.push(route as any)} style={{flexGrow:1,flexBasis:'45%',padding:20,borderRadius:20,backgroundColor:colors.surface,minHeight:112,gap:8}}><Text style={{color:colors.foreground,fontWeight:'700',fontSize:18}}>{title}</Text><Text style={{color:colors.muted,fontSize:13,lineHeight:19}}>{subtitle}</Text></Pressable>)}</View>
 </View>
 <View style={{gap:12}}><Text style={{fontSize:20,fontWeight:'700',color:colors.foreground}}>Nosso próximo encontro</Text>
 <Pressable accessibilityRole="button" onPress={()=>router.push(nextEvent?('/event/'+nextEvent.id) as any:'/(tabs)/agenda')} style={{padding:22,borderRadius:20,borderWidth:1,borderColor:colors.border,gap:8}}>
 <Text style={{fontSize:18,fontWeight:'600',color:colors.foreground}}>{nextEvent?.titulo || (events.isError?'Agenda indisponível no momento':'Acompanhe nossa agenda')}</Text>
 <Text style={{color:colors.muted}}>{nextEvent?[nextEvent.data,nextEvent.horario,nextEvent.local].filter(Boolean).join(' · '):'Os próximos encontros aparecerão aqui.'}</Text>
 </Pressable></View>
 </ScrollView></ScreenContainer>;
}
