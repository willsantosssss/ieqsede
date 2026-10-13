// Login and signup share the same validated session flow.
import { useState } from "react";
import { Alert, ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc, createTRPCClient } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { setSessionToken, setUserInfo, removeSessionToken, clearUserInfo } from "@/lib/_core/auth";
import { useColors } from "@/hooks/use-colors";


export default function LoginScreen() {
  void 0;
  const colors = useColors();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const signupMutation = trpc.auth.signup.useMutation();
  const loginMutation = trpc.auth.login.useMutation();

  const queryClient = useQueryClient();
  const handleSubmit = async () => {
    if (!email.trim() || !password || (isSignup && !name.trim())) {
      Alert.alert("Erro", "Preencha todos os campos."); return;
    }
    if (isSignup && (password.length < 12 || password.length > 128)) {
      Alert.alert("Erro", "Use uma senha de 12 a 128 caracteres."); return;
    }
    setLoading(true);
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      const credentials = { email: email.trim().toLowerCase(), password };
      const result = isSignup
        ? await signupMutation.mutateAsync({ ...credentials, name: name.trim() })
        : await loginMutation.mutateAsync(credentials);
      await setSessionToken(result.sessionToken);
      const api = createTRPCClient();
      const current = await api.auth.me.query();
      if (!current?.openId) throw new Error("Não foi possível validar a sessão.");
      await setUserInfo({ ...current, openId: current.openId, lastSignedIn: new Date(current.lastSignedIn) });
      const profile = await api.usuarios.getByUserId.query();
      await AsyncStorage.multiSet([
        ["@is_logged_in", "true"], ["@user_email", credentials.email],
        ["@cadastro_completo", profile ? "true" : "false"],
      ]);
      router.replace(profile ? "/(tabs)" : "/completar-cadastro");
    } catch {
      await createTRPCClient().auth.logout.mutate().catch(() => {});
      await removeSessionToken();
      await clearUserInfo();
      await AsyncStorage.multiRemove(["@is_logged_in", "@cadastro_completo", "@user_email"]);
      queryClient.clear();
      Alert.alert("Não foi possível entrar", "Confira seus dados e a conexão e tente novamente.");
    } finally { setLoading(false); }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} className="p-6">
        <View className="gap-8">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-foreground">
              {isSignup ? "Criar Conta" : "Bem-vindo"}
            </Text>
            <Text className="text-base text-muted text-center">
              {isSignup ? "Cadastre-se para acessar o app" : "Faça login para continuar"}
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            {isSignup && (
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Nome</Text>
                <TextInput
                  className="border border-border rounded-lg p-3 text-foreground bg-surface"
                  placeholder="Seu nome"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                />
              </View>
            )}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Email</Text>
              <TextInput
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Senha</Text>
              <TextInput
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholder="Sua senha"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[
              {
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingVertical: 16,
                paddingHorizontal: 16,
                alignItems: 'center',
                justifyContent: 'center',
              },
              loading && { opacity: 0.6 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                {isSignup ? "Criar Conta" : "Entrar"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle */}
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-muted text-sm">
              {isSignup ? "Já tem conta?" : "Não tem conta?"}
            </Text>
            <TouchableOpacity onPress={() => setIsSignup(!isSignup)} disabled={loading}>
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>
                {isSignup ? "Faça login" : "Cadastre-se"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
