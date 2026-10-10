// The business address as typed into the form, plus small helpers for it.
export interface BusinessAddress {
  line1: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

export const EMPTY_ADDRESS: BusinessAddress = { line1: '', landmark: '', city: '', state: '', pincode: '' };

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Keeps only the digits, and at most 6 of them, so the PIN code box cannot hold anything else.
export function cleanPincode(text: string): string {
  const digits = [...text].filter((character) => character >= '0' && character <= '9');
  return digits.join('').slice(0, 6);
}

export function isAddressComplete(address: BusinessAddress): boolean {
  return (
    address.line1.trim().length >= 5 &&
    address.city.trim().length >= 2 &&
    address.state !== '' &&
    address.pincode.length === 6
  );
}
