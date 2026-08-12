/**
 * WhatsApp Integration Service using Click-to-Chat (wa.me)
 * Prepares pre-filled messages and opens WhatsApp natively or in browser.
 */

export function cleanPhoneNumber(phone: string): string {
  // Strip all non-digit characters except leading plus
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  // If starts with 0 (e.g. 0123456789 in Malaysia), replace with country code 60
  if (cleaned.startsWith('0')) {
    cleaned = '60' + cleaned.substring(1);
  }
  return cleaned;
}

export function generateWhatsAppLink(phone: string, text: string): string {
  const digitsOnly = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${digitsOnly}?text=${encodedText}`;
}

export function formatCleanerTaskMessage(params: {
  template: string;
  propertyName: string;
  unitName: string;
  guestName: string;
  checkoutTime: string;
}): string {
  return params.template
    .replace(/\{property_name\}/g, params.propertyName)
    .replace(/\{unit_name\}/g, params.unitName)
    .replace(/\{guest_name\}/g, params.guestName || 'Guest')
    .replace(/\{checkout_time\}/g, params.checkoutTime || '12:00 PM');
}

export function formatGuestCheckInMessage(params: {
  template: string;
  propertyName: string;
  guestName: string;
  unitName: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
}): string {
  return params.template
    .replace(/\{property_name\}/g, params.propertyName)
    .replace(/\{guest_name\}/g, params.guestName)
    .replace(/\{unit_name\}/g, params.unitName)
    .replace(/\{check_in_date\}/g, params.checkInDate)
    .replace(/\{check_in_time\}/g, params.checkInTime)
    .replace(/\{check_out_date\}/g, params.checkOutDate)
    .replace(/\{check_out_time\}/g, params.checkOutTime);
}

export function openWhatsAppChat(phone: string, text: string): void {
  const url = generateWhatsAppLink(phone, text);
  window.open(url, '_blank', 'noopener,noreferrer');
}
