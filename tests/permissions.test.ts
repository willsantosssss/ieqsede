import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('../server/db', () => ({
 getLiderByUserId: vi.fn(), deleteEvento: vi.fn(), deleteUserCompletely: vi.fn(),
 getAllUsuariosCadastrados: vi.fn(), updateAnotacaoDevocional: vi.fn(),
 deleteAnotacaoDevocional: vi.fn(), getRelatoriosByLiderId: vi.fn(),
}));
import { appRouter } from '../server/routers';
import * as db from '../server/db';
const member={id:7,openId:'member',email:'user@example.invalid',name:'Teste',role:'user',password:'PRIVATE_HASH'};
function caller(user: any=null) {
 return appRouter.createCaller({user, req:{headers:{}} as any, res:{clearCookie:vi.fn()} as any, sdk:{revokeRequest:vi.fn()} as any});
}
beforeEach(()=>vi.clearAllMocks());
it('visitantes não podem excluir eventos',async()=>{
 await expect(caller().eventos.delete({id:1})).rejects.toMatchObject({code:'UNAUTHORIZED'});
 expect(db.deleteEvento).not.toHaveBeenCalled();
});
it('membros não podem excluir eventos nem outras contas',async()=>{
 await expect(caller(member).eventos.delete({id:1})).rejects.toMatchObject({code:'FORBIDDEN'});
 await expect(caller(member).usuarios.deleteUser(9)).rejects.toMatchObject({code:'FORBIDDEN'});
 expect(db.deleteUserCompletely).not.toHaveBeenCalled();
});
it('listas de membros exigem administrador',async()=>{
 await expect(caller(member).usuarios.list()).rejects.toMatchObject({code:'FORBIDDEN'});
});
it('administrador consegue excluir evento',async()=>{
 await caller({...member,role:'admin'}).eventos.delete({id:1});
 expect(db.deleteEvento).toHaveBeenCalledWith(1);
});
it('auth.me nunca retorna o hash de senha',async()=>{
 const result=await caller(member).auth.me();
 expect(result).not.toHaveProperty('password');
 expect(result?.id).toBe(7);
});
it('alteração de anotações passa o dono autenticado ao banco',async()=>{
 await caller(member).anotacoesDevocional.update({id:42,texto:'Anotação'});
 expect(db.updateAnotacaoDevocional).toHaveBeenCalledWith(42,{texto:'Anotação'},7);
 await caller(member).anotacoesDevocional.delete(42);
 expect(db.deleteAnotacaoDevocional).toHaveBeenCalledWith(42,7);
});
it('líder não acessa relatórios de outro líder',async()=>{
 vi.mocked(db.getLiderByUserId).mockResolvedValue({id:10,ativo:1,celula:'Teste'} as any);
 await expect(caller(member).relatorios.getByLiderId(11)).rejects.toMatchObject({code:'FORBIDDEN'});
 expect(db.getRelatoriosByLiderId).not.toHaveBeenCalled();
 await caller(member).relatorios.getByLiderId(10);
 expect(db.getRelatoriosByLiderId).toHaveBeenCalledWith(10);
});
it('logout revoga a sessão no servidor',async()=>{
 const revoke=vi.fn(); const clearCookie=vi.fn();
 const api=appRouter.createCaller({user:member,req:{headers:{}} as any,res:{clearCookie} as any,sdk:{revokeRequest:revoke} as any} as any);
 await api.auth.logout(); expect(revoke).toHaveBeenCalledOnce(); expect(clearCookie).toHaveBeenCalledOnce();
});
