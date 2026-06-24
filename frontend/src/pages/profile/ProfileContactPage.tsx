import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ProfileSectionHeader } from '../../components/profile/ProfileSectionHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { getProfile } from '../../lib/profileStorage';
import type { ProfileData } from '../../types/profile';

export function ProfileContactPage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState<Pick<ProfileData, 'phone' | 'city' | 'dropzone'>>({
    phone: '',
    city: '',
    dropzone: '',
  });
  const [fullProfile, setFullProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const load = useCallback(() => {
    if (!user) return;
    const profile = getProfile(user.id, user);
    setFullProfile(profile);
    setForm({ phone: profile.phone, city: profile.city, dropzone: profile.dropzone });
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user || !fullProfile) return null;

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      await updateProfile({ ...fullProfile, ...form });
      setFullProfile((current) => (current ? { ...current, ...form } : current));
      setSuccessMessage('Dados de contato atualizados.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ProfileSectionHeader
        title="Dados de contato"
        description="E-mail e localização usados em anúncios e mensagens."
      />

      {successMessage ? (
        <div className="mb-6 rounded-lg border border-liberado/40 bg-liberado/10 px-4 py-3 text-sm font-medium text-liberado-dark">
          {successMessage}
        </div>
      ) : null}

      <form
        onSubmit={handleSave}
        className="space-y-5 rounded-xl border border-nuvem bg-white p-5 shadow-sm sm:p-8"
      >
        <Input label="E-mail" type="email" value={user.email} readOnly />
        <Input
          label="Telefone"
          type="tel"
          placeholder="(11) 99999-9999"
          value={form.phone}
          onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Cidade"
            placeholder="São Paulo, SP"
            value={form.city}
            onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))}
          />
          <Input
            label="Dropzone"
            placeholder="Boituva"
            value={form.dropzone}
            onChange={(e) => setForm((current) => ({ ...current, dropzone: e.target.value }))}
          />
        </div>
        <p className="text-sm text-cinza">
          Alteração de e-mail será disponibilizada em uma versão futura.
        </p>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </>
  );
}
