type ProfileSectionHeaderProps = {
  title: string;
  description?: string;
};

export function ProfileSectionHeader({ title, description }: ProfileSectionHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-solo sm:text-3xl">
        {title}
      </h1>
      {description ? <p className="mt-2 text-cinza">{description}</p> : null}
    </div>
  );
}
