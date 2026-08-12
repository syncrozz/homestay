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

export function formatOwnerBookingAlertMessage(params: {
  template?: string;
  propertyName: string;
  guestName: string;
  guestPhone: string;
  unitName: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  guestCount: number;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  remark?: string;
}): string {
  const defaultTemplate = `📢 TEMPAHAN BAHARU DISAHKAN!

Homestay: {property_name}
Unit: {unit_name}
Tetamu: {guest_name} ({guest_phone})
Bilangan Tetamu: {guest_count} pax

📅 Check-in: {check_in_date} ({check_in_time})
📅 Check-out: {check_out_date} ({check_out_time})

💰 Status Bayaran: {payment_status}
💵 Jumlah: RM {total_amount}
💳 Deposit: RM {deposit_amount}
⚠️ Baki Belum Bayar: RM {balance_amount}
{remark_section}
Terima Kasih Menggunakan Perkhidmatan Kami.`;

  const template = params.template || defaultTemplate;
  const remarkSection = params.remark ? `💬 Catatan: ${params.remark}` : '';

  return template
    .replace(/\{property_name\}/g, params.propertyName)
    .replace(/\{unit_name\}/g, params.unitName)
    .replace(/\{guest_name\}/g, params.guestName)
    .replace(/\{guest_phone\}/g, params.guestPhone)
    .replace(/\{guest_count\}/g, String(params.guestCount))
    .replace(/\{check_in_date\}/g, params.checkInDate)
    .replace(/\{check_in_time\}/g, params.checkInTime)
    .replace(/\{check_out_date\}/g, params.checkOutDate)
    .replace(/\{check_out_time\}/g, params.checkOutTime)
    .replace(/\{payment_status\}/g, params.paymentStatus)
    .replace(/\{total_amount\}/g, String(params.totalAmount))
    .replace(/\{deposit_amount\}/g, String(params.depositAmount))
    .replace(/\{balance_amount\}/g, String(params.balanceAmount))
    .replace(/\{remark_section\}/g, remarkSection);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

export function openWhatsAppChat(phone: string, text: string): void {
  const url = generateWhatsAppLink(phone, text);
  window.open(url, '_blank', 'noopener,noreferrer');
}
