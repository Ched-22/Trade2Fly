export type ProfileSettingsSection =
  | 'conta'
  | 'contato'
  | 'senha'
  | 'recebimento'
  | 'pagamento';

export type ProfileSettingsNavItem = {
  id: ProfileSettingsSection;
  label: string;
  path: string;
  icon?: 'settings';
};

export const profileSettingsNav: ProfileSettingsNavItem[] = [
  { id: 'conta', label: 'Configurações da conta', path: '/perfil', icon: 'settings' },
  { id: 'contato', label: 'Dados de contato', path: '/perfil/contato' },
  { id: 'senha', label: 'Senha', path: '/perfil/senha' },
  { id: 'recebimento', label: 'Dados de recebimento', path: '/perfil/recebimento' },
  { id: 'pagamento', label: 'Métodos de pagamento', path: '/perfil/pagamento' },
];
