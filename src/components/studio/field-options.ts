import {
  DESIGN_CATEGORY_LABELS,
  DESIGN_CATEGORY_ORDER,
  FABRIC_FAMILY_LABELS,
  FABRIC_WEIGHT_LABELS,
  FIT_LABELS,
  OCCASION_LABELS,
  OCCASION_ORDER,
  ORDER_STATUS_LABELS,
} from '@/lib/constants';

/**
 * Select/multiselect option lists for the studio forms, derived from the same
 * label maps the public site uses — so a label only ever has to be changed in
 * one place.
 */

export const OCCASION_OPTIONS = OCCASION_ORDER.map((value) => ({
  value,
  label: OCCASION_LABELS[value],
}));

export const FAMILY_OPTIONS = (
  Object.keys(FABRIC_FAMILY_LABELS) as (keyof typeof FABRIC_FAMILY_LABELS)[]
).map((value) => ({ value, label: FABRIC_FAMILY_LABELS[value] }));

export const WEIGHT_OPTIONS = (
  Object.keys(FABRIC_WEIGHT_LABELS) as (keyof typeof FABRIC_WEIGHT_LABELS)[]
).map((value) => ({ value, label: FABRIC_WEIGHT_LABELS[value] }));

export const FIT_OPTIONS = (Object.keys(FIT_LABELS) as (keyof typeof FIT_LABELS)[]).map(
  (value) => ({ value, label: FIT_LABELS[value] }),
);

export const DESIGN_CATEGORY_OPTIONS = DESIGN_CATEGORY_ORDER.map((value) => ({
  value,
  label: DESIGN_CATEGORY_LABELS[value],
}));

export const ORDER_STATUS_OPTIONS = (
  Object.keys(ORDER_STATUS_LABELS) as (keyof typeof ORDER_STATUS_LABELS)[]
).map((value) => ({ value, label: ORDER_STATUS_LABELS[value] }));

export const ENQUIRY_STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'QUOTED', label: 'Quoted' },
  { value: 'CLOSED', label: 'Closed' },
];

export const POST_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
];

export const JOURNAL_CATEGORIES = [
  { value: 'Journal', label: 'Journal' },
  { value: 'Fabric', label: 'Fabric' },
  { value: 'Styling', label: 'Styling' },
  { value: 'Atelier', label: 'Atelier' },
];
