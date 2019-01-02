export const KYC_PERSONAL_DOCUMENT_TYPE = [
  { name: 'Passport', value: 'passport'},
  { name: 'Drivers License', value: 'drivers_license'},
  { name: 'Driving History Certificate', value: 'driving_history_certificate'},
  { name: 'Health Insurance Card', value: 'health_insurance_card'},
  { name: 'Individual Number Card', value: 'individual_number_card'},
  { name: 'Basic Resident Registration Card', value: 'basic_resident_registration_card'},
  { name: 'Residence Card', value: 'residence_card'},
  { name: 'Special Permanent Resident Certificate', value: 'special_permanent_resident_certificate'},
]
export const KYC_ERROR_CODE = {
  missing: 'The image and document type are required',
  too_large: 'The image exceeds the maximum size, please choose files under 4 Mb',
  missing_page: 'The number of images is less than the expected number',
  too_many_pages: 'The number of images is greater than the expected number',
  unsupported: 'The document is unsupported',
  unreadable: 'The image is unreadable, please select JPEG, PNG or GIF image'
}
