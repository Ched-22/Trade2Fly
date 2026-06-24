import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../ui/Input';

type PasswordInputProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  id?: string;
};

export function PasswordInput({
  label = 'Senha',
  value,
  onChange,
  error,
  placeholder = '••••••••',
  id,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      id={id}
      label={label}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      error={error}
      placeholder={placeholder}
      suffix={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="cursor-pointer text-cinza hover:text-solo"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}
