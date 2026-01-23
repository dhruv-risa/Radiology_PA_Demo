// ICD-10 Code Descriptions Mapping
export const ICD_CODE_DESCRIPTIONS: Record<string, string> = {
  // Patient 009 - Multiple Myeloma/Bone Metastases
  'C79.51': 'Secondary malignant neoplasm of bone (bone metastases)',
  'C90.00': 'Multiple myeloma, not having achieved remission',
  'D47.2': 'Monoclonal gammopathy of undetermined significance (MGUS)',

  // Other existing codes
  'G43.909': 'Migraine, unspecified, not intractable, without status migrainosus',
  'M81.0': 'Age-related osteoporosis without current pathological fracture',
  'Z79.83': 'Long term (current) use of bisphosphonates',
  'R07.9': 'Chest pain, unspecified',
}

export function getIcdDescription(code: string): string {
  return ICD_CODE_DESCRIPTIONS[code] || `Clinical description for ${code}`
}
