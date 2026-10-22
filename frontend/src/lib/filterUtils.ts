import type { Filters } from '../types/listing';
import { defaultFilters } from '../types/listing';

export function countActiveFilters(filters: Filters): number {
  let count = 0;
  if (filters.category) count += 1;
  if (filters.brand) count += 1;
  if (filters.condition) count += 1;
  if (filters.escrow) count += 1;
  if (filters.min) count += 1;
  if (filters.max) count += 1;
  if (filters.sort !== defaultFilters.sort) count += 1;
  return count;
}
