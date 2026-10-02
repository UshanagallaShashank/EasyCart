// Zod schemas for delivery partner (rider) sign-up, profile, location and the delivery steps.
import { z } from 'zod';
import { username_schema, email_schema, password_schema, phone_number_schema } from '../auth/auth-schemas.js';

export const VEHICLE_TYPES = ['bike', 'scooter', 'electric_bike', 'bicycle'];

// Required before an application can be sent for review; "other" documents are optional.
export const REQUIRED_DOCUMENTS = ['partner_photo', 'vehicle_photo', 'license_front', 'vehicle_rc', 'id_proof'];
export const OPTIONAL_DOCUMENTS = ['license_back', 'insurance', 'other'];
export const DOCUMENT_KINDS = [...REQUIRED_DOCUMENTS, ...OPTIONAL_DOCUMENTS];
export const MAX_OTHER_DOCUMENTS = 3;

const latitude_schema = z.number().min(-90).max(90);
const longitude_schema = z.number().min(-180).max(180);

export const rider_signup_schema = z.object({
  username: username_schema,
  email: email_schema,
  password: password_schema,
  phone_number: phone_number_schema,
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80)
});

const text = (label, min = 1, max = 120) => z.string().trim().min(min, `${label} is required`).max(max, `${label} is too long`);
const optional_text = (max = 120) => z.string().trim().max(max).optional().or(z.literal(''));

export const rider_profile_schema = z.object({
  full_name: text('Full name', 2, 80),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be a date'),
  vehicle_type: z.enum(VEHICLE_TYPES),
  vehicle_number: z.string().trim().toUpperCase().regex(/^[A-Z0-9 -]{4,15}$/, 'Vehicle number looks wrong').optional().or(z.literal('')),
  license_number: z.string().trim().toUpperCase().regex(/^[A-Z0-9 -]{5,20}$/, 'Licence number looks wrong').optional().or(z.literal('')),
  license_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Licence expiry must be a date').optional().or(z.literal('')),
  address_line: text('Address', 3, 200),
  area: text('Area', 2, 80),
  city: text('City', 2, 60),
  pincode: z.string().trim().regex(/^[0-9]{5,6}$/, 'Pincode must be 5 or 6 digits'),
  emergency_contact_name: text('Emergency contact name', 2, 80),
  emergency_contact_phone: phone_number_schema,
  upi_id: optional_text(60)
}).superRefine((data, ctx) => {
  // A bicycle needs no number plate or licence; every motor vehicle does.
  if (data.vehicle_type === 'bicycle') return;
  if (!data.vehicle_number) ctx.addIssue({ code: 'custom', path: ['vehicle_number'], message: 'Vehicle number is required' });
  if (!data.license_number) ctx.addIssue({ code: 'custom', path: ['license_number'], message: 'Licence number is required' });
  if (!data.license_expiry) ctx.addIssue({ code: 'custom', path: ['license_expiry'], message: 'Licence expiry is required' });
});

export const location_schema = z.object({
  latitude: latitude_schema,
  longitude: longitude_schema
});

export const online_schema = z.object({
  is_online: z.boolean(),
  latitude: latitude_schema.optional(),
  longitude: longitude_schema.optional()
});

export const document_upload_schema = z.object({
  kind: z.enum(DOCUMENT_KINDS),
  file: z.string().min(1, 'File is required'),
  label: z.string().trim().max(60).optional()
});

export const pickup_schema = z.object({
  pickup_code: z.string().trim().regex(/^[0-9]{4}$/, 'Pickup code is 4 digits')
});

export const deliver_schema = z.object({
  delivery_code: z.string().trim().regex(/^[0-9]{6}$/, 'Delivery code is 6 digits'),
  cash_collected: z.number().min(0),
  photo: z.string().min(1, 'A delivery photo is required')
});

export const review_schema = z.object({
  note: z.string().trim().max(300).optional()
});

export const reject_schema = z.object({
  note: z.string().trim().min(3, 'Tell the applicant why (at least 3 characters)').max(300)
});

export const settlement_schema = z.object({
  kind: z.enum(['cash_deposit', 'payout']),
  amount: z.number().positive('Amount must be more than 0'),
  note: z.string().trim().max(200).optional()
});


export function issues_message(error) {
  return error.issues.map((issue) => issue.message).join(', ');
}
