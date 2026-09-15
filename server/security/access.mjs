const publicReads = new Set(['auth.me', 'celulas.list', 'celulas.getById', 'eventos.list', 'eventos.getById', 'noticias.list', 'noticias.getById', 'avisoImportante.get', 'contatosIgreja.get', 'contribuicao.get', 'escolaCrescimento.getConfig', 'pagamentosEventos.getByEventoId', 'recados.list', 'recados.getById']);
const publicWrites = new Set(['auth.signup', 'auth.login', 'auth.logout']);
const memberReads = new Set(['usuarios.getByUserId', 'usuarios.getMeuPerfil', 'usuarios.getAniversariantes', 'oracao.list', 'oracao.getById', 'anotacoesDevocional.listByUser', 'anotacoesDevocional.getByCapitulo']);
const memberWrites = new Set(['usuarios.create', 'usuarios.updateMeuPerfil', 'usuarios.deleteAccount', 'batismo.create', 'oracao.create', 'oracao.incrementarContador', 'inscricoesEventos.create', 'escolaCrescimento.create', 'anotacoesDevocional.create', 'anotacoesDevocional.update', 'anotacoesDevocional.delete', 'anotacoesDevocional.deleteByCapitulo']);
export function accessLevel(path, type) {
  if ((type === 'query' ? publicReads : publicWrites).has(path)) return 'public';
  if ((type === 'query' ? memberReads : memberWrites).has(path)) return 'member';
  if (path === 'lideres.getByUserId') return 'self';
  if (['relatorios.getByLiderId', 'relatorios.getByLiderIdWithFilters', 'relatorios.getByCelula', 'relatorios.create', 'usuarios.getMembrosPorCelula', 'inscricoesEventos.getByCelula', 'escolaCrescimento.getByCelula', 'anexos.list', 'anexos.getById'].includes(path)) return 'leader';
  return 'admin';
}
