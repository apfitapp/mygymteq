/**
 * WhatsApp click-to-chat link generator (wa.me)
 * Uses standard Indian phone number normalization (+91)
 */
export function generateWhatsAppLink(phone, type, payload) {
    // Normalize phone (strip non-digits, ensure 10-digit Indian mobile format)
    const cleanDigits = phone.replace(/\D/g, '');
    const tenDigit = cleanDigits.slice(-10);
    const internationalPhone = `91${tenDigit}`;
    let message = '';
    switch (type) {
        case 'WELCOME_MEMBER':
            message = `Hello ${payload.memberName}! Welcome to *${payload.gymName}* 💪\n\nYour Member ID is: *${payload.memberCode || 'N/A'}*\nJoining Date: ${payload.startDate || 'Today'}\n\nWe are excited to help you achieve your fitness goals! Let's get started. 🏋️‍♂️`;
            break;
        case 'PAYMENT_RECEIPT':
            message = `Hi ${payload.memberName}, payment received at *${payload.gymName}*.\n\n📄 Receipt No: *${payload.receiptNumber || 'N/A'}*\n💰 Amount Paid: *${payload.amountFormatted || '₹0'}*\n\nThank you for your payment! 🙏`;
            break;
        case 'RENEWAL_REMINDER':
            message = `Hi ${payload.memberName}, your membership at *${payload.gymName}* is expiring on *${payload.expiryDate}* ⏳\n\nRenew today to maintain your workout momentum and avoid lapse of benefits! 🏋️`;
            break;
        case 'CUSTOM':
            message = payload.customMessage || `Hello from *${payload.gymName}*!`;
            break;
    }
    return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}
