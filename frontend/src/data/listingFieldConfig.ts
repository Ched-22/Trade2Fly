export type ListingFieldKey =
  | 'size'
  | 'jumps'
  | 'year'
  | 'weight'
  | 'repackDate'
  | 'modelNotes';

export type ListingFieldDef = {
  key: ListingFieldKey;
  label: string;
  placeholder?: string;
  required?: boolean;
  inputType?: 'text' | 'number';
};

const velameFields: ListingFieldDef[] = [
  { key: 'size', label: 'Tamanho (sqft)', placeholder: '210', required: true },
  { key: 'jumps', label: 'Saltos', placeholder: '380', required: true },
  { key: 'year', label: 'Ano', placeholder: '2021', required: true },
  { key: 'weight', label: 'Peso (kg)', placeholder: '2.1' },
];

const containerFields: ListingFieldDef[] = [
  { key: 'size', label: 'Tamanho do harness', placeholder: 'M', required: true },
  { key: 'jumps', label: 'Saltos', placeholder: '540', required: true },
  { key: 'year', label: 'Ano', placeholder: '2020', required: true },
  { key: 'weight', label: 'Peso (kg)', placeholder: '3.4' },
];

const reservaFields: ListingFieldDef[] = [
  { key: 'size', label: 'Tamanho (sqft)', placeholder: '176', required: true },
  { key: 'year', label: 'Ano', placeholder: '2022', required: true },
  { key: 'repackDate', label: 'Último repack (opcional)', placeholder: '03/2025' },
];

const sistemaFields: ListingFieldDef[] = [
  { key: 'size', label: 'Tamanho (sqft)', placeholder: '190', required: true },
  { key: 'jumps', label: 'Saltos', placeholder: '620', required: true },
  { key: 'year', label: 'Ano', placeholder: '2019', required: true },
  { key: 'weight', label: 'Peso (kg)', placeholder: '8.2' },
];

const altimetroFields: ListingFieldDef[] = [
  { key: 'year', label: 'Ano', placeholder: '2022', required: true },
  { key: 'modelNotes', label: 'Modelo / observações', placeholder: 'Digital, Viso II+' },
];

const capaceteFields: ListingFieldDef[] = [
  { key: 'size', label: 'Tamanho', placeholder: 'M', required: true },
  { key: 'year', label: 'Ano', placeholder: '2023', required: true },
];

const baseFields: ListingFieldDef[] = [
  { key: 'size', label: 'Tamanho (sqft)', placeholder: '260', required: true },
  { key: 'jumps', label: 'Saltos', placeholder: '90', required: true },
  { key: 'year', label: 'Ano', placeholder: '2020', required: true },
];

export const categoryFieldMap: Record<string, ListingFieldDef[]> = {
  Velames: velameFields,
  Containers: containerFields,
  Reservas: reservaFields,
  'Sistemas Completos': sistemaFields,
  Altímetros: altimetroFields,
  Audíveis: altimetroFields,
  'Capacetes e Equipamentos': capaceteFields,
  BASE: baseFields,
};

export function getFieldsForCategory(category: string): ListingFieldDef[] {
  return categoryFieldMap[category] ?? [];
}
