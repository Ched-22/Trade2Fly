export type ProfileData = {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  city: string;
  dropzone: string;
  phone: string;
  avatarUrl: string | null;
};

export const emptyProfile = (): ProfileData => ({
  firstName: '',
  lastName: '',
  displayName: '',
  bio: '',
  city: '',
  dropzone: '',
  phone: '',
  avatarUrl: null,
});
