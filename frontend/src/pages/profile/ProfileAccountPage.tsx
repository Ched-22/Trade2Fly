import { useCallback, useEffect, useState } from 'react';
import { ProfileForm } from '../../components/profile/ProfileForm';
import { ProfilePublicPreview } from '../../components/profile/ProfilePublicPreview';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { getProfile } from '../../lib/profileStorage';
import type { ProfileData } from '../../types/profile';

export function ProfileAccountPage() {
  const { user, updateProfile } = useAuth();
  const [savedData, setSavedData] = useState<ProfileData | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ProfileData | null>(null);

  const loadProfile = useCallback(() => {
    if (!user) return;
    setSavedData(getProfile(user.id, user));
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (!user || !savedData) return null;

  const handleSave = async (data: ProfileData) => {
    setSaving(true);
    setSuccessMessage('');
    try {
      await updateProfile(data);
      setSavedData(data);
      setFormKey((key) => key + 1);
      setSuccessMessage('Perfil atualizado.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormKey((key) => key + 1);
    setSuccessMessage('');
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-solo sm:text-3xl">
            Configurações da conta
          </h1>
          <p className="mt-2 text-cinza">
            Gerencie como outros skydivers veem você na Trade2Fly.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 self-start"
          onClick={() => {
            setPreviewData(savedData);
            setPreviewOpen(true);
          }}
        >
          Ver perfil público
        </Button>
      </div>

      {successMessage ? (
        <div className="mb-6 rounded-lg border border-liberado/40 bg-liberado/10 px-4 py-3 text-sm font-medium text-liberado-dark">
          {successMessage}
        </div>
      ) : null}

      <div className="rounded-xl border border-nuvem bg-white p-5 shadow-sm sm:p-8">
        <ProfileForm
          key={formKey}
          initialData={savedData}
          saving={saving}
          onSubmit={handleSave}
          onCancel={handleCancel}
          onPreview={(data) => {
            setPreviewData(data);
            setPreviewOpen(true);
          }}
        />
      </div>

      <ProfilePublicPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        profile={previewData ?? savedData}
        email={user.email}
      />
    </>
  );
}
