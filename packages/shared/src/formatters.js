/**
 * Currency and Date formatters for Indian locale (INR and IST)
 */
export function formatInr(paise) {
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(rupees);
}
export function formatInrNumberOnly(paise) {
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
    }).format(rupees);
}
export function formatDateIst(dateString) {
    if (!dateString)
        return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime()))
        return dateString;
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
    }).format(d);
}
export function formatDateTimeIst(isoString) {
    if (!isoString)
        return '—';
    const d = new Date(isoString);
    if (isNaN(d.getTime()))
        return isoString;
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
    }).format(d);
}
export function calculateMembershipEndDate(startDate, durationMonths, durationDays = 0) {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + durationMonths);
    if (durationDays > 0) {
        start.setDate(start.getDate() + durationDays);
    }
    return start.toISOString().split('T')[0];
}
