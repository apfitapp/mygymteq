import { z } from 'zod';
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export declare const CreatePlatformPlanSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    monthlyPriceInr: z.ZodNumber;
    yearlyPriceInr: z.ZodNumber;
    maxMembers: z.ZodDefault<z.ZodNumber>;
    maxBranches: z.ZodDefault<z.ZodNumber>;
    maxStaff: z.ZodDefault<z.ZodNumber>;
    hasQrAttendance: z.ZodDefault<z.ZodBoolean>;
    hasReports: z.ZodDefault<z.ZodBoolean>;
    hasWhatsappAutomation: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    slug: string;
    monthlyPriceInr: number;
    yearlyPriceInr: number;
    maxMembers: number;
    maxBranches: number;
    maxStaff: number;
    hasQrAttendance: boolean;
    hasReports: boolean;
    hasWhatsappAutomation: boolean;
}, {
    id: string;
    name: string;
    slug: string;
    monthlyPriceInr: number;
    yearlyPriceInr: number;
    maxMembers?: number | undefined;
    maxBranches?: number | undefined;
    maxStaff?: number | undefined;
    hasQrAttendance?: boolean | undefined;
    hasReports?: boolean | undefined;
    hasWhatsappAutomation?: boolean | undefined;
}>;
export type CreatePlatformPlanInput = z.infer<typeof CreatePlatformPlanSchema>;
export declare const CreateGymTenantSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    phone: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodDefault<z.ZodString>;
    pincode: z.ZodOptional<z.ZodString>;
    gstin: z.ZodOptional<z.ZodString>;
    planId: z.ZodString;
    ownerName: z.ZodString;
    ownerEmail: z.ZodString;
    ownerPhone: z.ZodString;
    ownerPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    phone: string;
    city: string;
    state: string;
    planId: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    ownerPassword: string;
    email?: string | undefined;
    address?: string | undefined;
    pincode?: string | undefined;
    gstin?: string | undefined;
}, {
    name: string;
    slug: string;
    phone: string;
    city: string;
    planId: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    ownerPassword: string;
    email?: string | undefined;
    address?: string | undefined;
    state?: string | undefined;
    pincode?: string | undefined;
    gstin?: string | undefined;
}>;
export type CreateGymTenantInput = z.infer<typeof CreateGymTenantSchema>;
export declare const UpdateGymStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["TRIAL", "ACTIVE", "PAST_DUE", "SUSPENDED"]>;
}, "strip", z.ZodTypeAny, {
    status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED";
}, {
    status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED";
}>;
export type UpdateGymStatusInput = z.infer<typeof UpdateGymStatusSchema>;
export declare const UpdateGymSubscriptionSchema: z.ZodObject<{
    planId: z.ZodString;
    status: z.ZodEnum<["TRIAL", "ACTIVE", "CANCELLED", "EXPIRED"]>;
    currentPeriodEnd: z.ZodString;
    maxMembersOverride: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    maxBranchesOverride: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    status: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";
    planId: string;
    currentPeriodEnd: string;
    maxMembersOverride?: number | null | undefined;
    maxBranchesOverride?: number | null | undefined;
}, {
    status: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";
    planId: string;
    currentPeriodEnd: string;
    maxMembersOverride?: number | null | undefined;
    maxBranchesOverride?: number | null | undefined;
}>;
export type UpdateGymSubscriptionInput = z.infer<typeof UpdateGymSubscriptionSchema>;
export declare const UpdateGymSettingsSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodString;
    pincode: z.ZodOptional<z.ZodString>;
    gstin: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    city: string;
    state: string;
    email?: string | undefined;
    address?: string | undefined;
    pincode?: string | undefined;
    gstin?: string | undefined;
}, {
    name: string;
    phone: string;
    city: string;
    state: string;
    email?: string | undefined;
    address?: string | undefined;
    pincode?: string | undefined;
    gstin?: string | undefined;
}>;
export type UpdateGymSettingsInput = z.infer<typeof UpdateGymSettingsSchema>;
export declare const CreateBranchSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    isPrimary: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    isPrimary: boolean;
    phone?: string | undefined;
    address?: string | undefined;
}, {
    code: string;
    name: string;
    phone?: string | undefined;
    address?: string | undefined;
    isPrimary?: boolean | undefined;
}>;
export type CreateBranchInput = z.infer<typeof CreateBranchSchema>;
export declare const CreateStaffUserSchema: z.ZodObject<{
    branchId: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodString;
    fullName: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["MANAGER", "STAFF", "TRAINER"]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    phone: string;
    fullName: string;
    role: "MANAGER" | "STAFF" | "TRAINER";
    branchId?: string | undefined;
}, {
    email: string;
    password: string;
    phone: string;
    fullName: string;
    role: "MANAGER" | "STAFF" | "TRAINER";
    branchId?: string | undefined;
}>;
export type CreateStaffUserInput = z.infer<typeof CreateStaffUserSchema>;
export declare const CreateMemberSchema: z.ZodObject<{
    branchId: z.ZodString;
    memberCode: z.ZodOptional<z.ZodString>;
    fullName: z.ZodString;
    phone: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    gender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER"]>>;
    dob: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    emergencyContactName: z.ZodOptional<z.ZodString>;
    emergencyContactPhone: z.ZodOptional<z.ZodString>;
    medicalNotes: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    joiningDate: z.ZodDefault<z.ZodString>;
    initialPlanId: z.ZodOptional<z.ZodString>;
    initialPaidAmountInr: z.ZodOptional<z.ZodNumber>;
    initialPaymentMethod: z.ZodOptional<z.ZodEnum<["CASH", "UPI", "CARD", "NETBANKING", "OTHER"]>>;
    initialUpiRef: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    branchId: string;
    fullName: string;
    joiningDate: string;
    email?: string | undefined;
    address?: string | undefined;
    memberCode?: string | undefined;
    gender?: "OTHER" | "MALE" | "FEMALE" | undefined;
    dob?: string | undefined;
    emergencyContactName?: string | undefined;
    emergencyContactPhone?: string | undefined;
    medicalNotes?: string | undefined;
    initialPlanId?: string | undefined;
    initialPaidAmountInr?: number | undefined;
    initialPaymentMethod?: "CASH" | "UPI" | "CARD" | "NETBANKING" | "OTHER" | undefined;
    initialUpiRef?: string | undefined;
}, {
    phone: string;
    branchId: string;
    fullName: string;
    email?: string | undefined;
    address?: string | undefined;
    memberCode?: string | undefined;
    gender?: "OTHER" | "MALE" | "FEMALE" | undefined;
    dob?: string | undefined;
    emergencyContactName?: string | undefined;
    emergencyContactPhone?: string | undefined;
    medicalNotes?: string | undefined;
    joiningDate?: string | undefined;
    initialPlanId?: string | undefined;
    initialPaidAmountInr?: number | undefined;
    initialPaymentMethod?: "CASH" | "UPI" | "CARD" | "NETBANKING" | "OTHER" | undefined;
    initialUpiRef?: string | undefined;
}>;
export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
export declare const UpdateMemberSchema: z.ZodObject<{
    fullName: z.ZodString;
    phone: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    gender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER"]>>;
    dob: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    emergencyContactName: z.ZodOptional<z.ZodString>;
    emergencyContactPhone: z.ZodOptional<z.ZodString>;
    medicalNotes: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "EXPIRED", "FROZEN", "INACTIVE"]>>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    fullName: string;
    email?: string | undefined;
    status?: "ACTIVE" | "EXPIRED" | "FROZEN" | "INACTIVE" | undefined;
    address?: string | undefined;
    gender?: "OTHER" | "MALE" | "FEMALE" | undefined;
    dob?: string | undefined;
    emergencyContactName?: string | undefined;
    emergencyContactPhone?: string | undefined;
    medicalNotes?: string | undefined;
}, {
    phone: string;
    fullName: string;
    email?: string | undefined;
    status?: "ACTIVE" | "EXPIRED" | "FROZEN" | "INACTIVE" | undefined;
    address?: string | undefined;
    gender?: "OTHER" | "MALE" | "FEMALE" | undefined;
    dob?: string | undefined;
    emergencyContactName?: string | undefined;
    emergencyContactPhone?: string | undefined;
    medicalNotes?: string | undefined;
}>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
export declare const CreateMembershipPlanSchema: z.ZodObject<{
    name: z.ZodString;
    durationMonths: z.ZodNumber;
    durationDays: z.ZodDefault<z.ZodNumber>;
    priceInr: z.ZodNumber;
    admissionFeeInr: z.ZodDefault<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    durationMonths: number;
    durationDays: number;
    priceInr: number;
    admissionFeeInr: number;
    description?: string | undefined;
}, {
    name: string;
    durationMonths: number;
    priceInr: number;
    durationDays?: number | undefined;
    admissionFeeInr?: number | undefined;
    description?: string | undefined;
}>;
export type CreateMembershipPlanInput = z.infer<typeof CreateMembershipPlanSchema>;
export declare const AssignMembershipSchema: z.ZodObject<{
    memberId: z.ZodString;
    planId: z.ZodString;
    startDate: z.ZodString;
    totalAmountInr: z.ZodNumber;
    discountInr: z.ZodDefault<z.ZodNumber>;
    paidAmountInr: z.ZodDefault<z.ZodNumber>;
    paymentMethod: z.ZodDefault<z.ZodEnum<["CASH", "UPI", "CARD", "NETBANKING", "OTHER"]>>;
    upiRef: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    planId: string;
    memberId: string;
    startDate: string;
    totalAmountInr: number;
    discountInr: number;
    paidAmountInr: number;
    paymentMethod: "CASH" | "UPI" | "CARD" | "NETBANKING" | "OTHER";
    upiRef?: string | undefined;
    notes?: string | undefined;
}, {
    planId: string;
    memberId: string;
    startDate: string;
    totalAmountInr: number;
    discountInr?: number | undefined;
    paidAmountInr?: number | undefined;
    paymentMethod?: "CASH" | "UPI" | "CARD" | "NETBANKING" | "OTHER" | undefined;
    upiRef?: string | undefined;
    notes?: string | undefined;
}>;
export type AssignMembershipInput = z.infer<typeof AssignMembershipSchema>;
export declare const RenewMembershipSchema: z.ZodObject<{
    planId: z.ZodString;
    startDate: z.ZodString;
    totalAmountInr: z.ZodNumber;
    discountInr: z.ZodDefault<z.ZodNumber>;
    paidAmountInr: z.ZodDefault<z.ZodNumber>;
    paymentMethod: z.ZodDefault<z.ZodEnum<["CASH", "UPI", "CARD", "NETBANKING", "OTHER"]>>;
    upiRef: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    planId: string;
    startDate: string;
    totalAmountInr: number;
    discountInr: number;
    paidAmountInr: number;
    paymentMethod: "CASH" | "UPI" | "CARD" | "NETBANKING" | "OTHER";
    upiRef?: string | undefined;
    notes?: string | undefined;
}, {
    planId: string;
    startDate: string;
    totalAmountInr: number;
    discountInr?: number | undefined;
    paidAmountInr?: number | undefined;
    paymentMethod?: "CASH" | "UPI" | "CARD" | "NETBANKING" | "OTHER" | undefined;
    upiRef?: string | undefined;
    notes?: string | undefined;
}>;
export type RenewMembershipInput = z.infer<typeof RenewMembershipSchema>;
export declare const RecordPaymentSchema: z.ZodObject<{
    memberId: z.ZodString;
    membershipId: z.ZodOptional<z.ZodString>;
    amountInr: z.ZodNumber;
    paymentMethod: z.ZodEnum<["CASH", "UPI", "CARD", "NETBANKING", "OTHER"]>;
    paymentDate: z.ZodDefault<z.ZodString>;
    upiRefOrTxnId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    memberId: string;
    paymentMethod: "CASH" | "UPI" | "CARD" | "NETBANKING" | "OTHER";
    amountInr: number;
    paymentDate: string;
    notes?: string | undefined;
    membershipId?: string | undefined;
    upiRefOrTxnId?: string | undefined;
}, {
    memberId: string;
    paymentMethod: "CASH" | "UPI" | "CARD" | "NETBANKING" | "OTHER";
    amountInr: number;
    notes?: string | undefined;
    membershipId?: string | undefined;
    paymentDate?: string | undefined;
    upiRefOrTxnId?: string | undefined;
}>;
export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;
export declare const CheckInMemberSchema: z.ZodObject<{
    memberId: z.ZodString;
    branchId: z.ZodString;
    checkInMethod: z.ZodDefault<z.ZodEnum<["MANUAL", "QR_SCAN", "BIOMETRIC"]>>;
}, "strip", z.ZodTypeAny, {
    branchId: string;
    memberId: string;
    checkInMethod: "MANUAL" | "QR_SCAN" | "BIOMETRIC";
}, {
    branchId: string;
    memberId: string;
    checkInMethod?: "MANUAL" | "QR_SCAN" | "BIOMETRIC" | undefined;
}>;
export type CheckInMemberInput = z.infer<typeof CheckInMemberSchema>;
