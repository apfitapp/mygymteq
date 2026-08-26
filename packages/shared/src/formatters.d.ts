/**
 * Currency and Date formatters for Indian locale (INR and IST)
 */
export declare function formatInr(paise: number): string;
export declare function formatInrNumberOnly(paise: number): string;
export declare function formatDateIst(dateString: string): string;
export declare function formatDateTimeIst(isoString: string): string;
export declare function calculateMembershipEndDate(startDate: string, durationMonths: number, durationDays?: number): string;
