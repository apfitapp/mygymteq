/**
 * WhatsApp click-to-chat link generator (wa.me)
 * Uses standard Indian phone number normalization (+91)
 */
export declare function generateWhatsAppLink(phone: string, type: 'WELCOME_MEMBER' | 'PAYMENT_RECEIPT' | 'RENEWAL_REMINDER' | 'CUSTOM', payload: {
    gymName: string;
    memberName: string;
    memberCode?: string;
    startDate?: string;
    expiryDate?: string;
    amountFormatted?: string;
    receiptNumber?: string;
    customMessage?: string;
}): string;
