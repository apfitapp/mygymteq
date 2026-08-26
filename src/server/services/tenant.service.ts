export interface GymEntity {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gstNumber: string | null;
  currency: string;
  logoUrl: string | null;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
}

export interface LicenseEntity {
  id: string;
  gymId: string;
  subscriptionId: string;
  maxMembers: number;
  maxStaff: number;
  status: 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED';
  entitlements: Record<string, boolean>;
  expiresAt: number;
}

export async function getGymAndLicense(
  db: D1Database,
  gymId: string
): Promise<{ gym: GymEntity | null; license: LicenseEntity | null }> {
  try {
    const gymResult = await db
      .prepare('SELECT * FROM gyms WHERE id = ? AND deleted_at IS NULL')
      .bind(gymId)
      .first<any>();

    if (!gymResult) {
      return { gym: null, license: null };
    }

    const licenseResult = await db
      .prepare('SELECT * FROM licenses WHERE gym_id = ?')
      .bind(gymId)
      .first<any>();

    let entitlements = { reports: true, qr_attendance: true, whatsapp_links: true };
    if (licenseResult?.entitlements_json) {
      try {
        entitlements = JSON.parse(licenseResult.entitlements_json);
      } catch {
        // use default
      }
    }

    const gym: GymEntity = {
      id: gymResult.id,
      name: gymResult.name,
      slug: gymResult.slug,
      phone: gymResult.phone,
      email: gymResult.email,
      address: gymResult.address,
      city: gymResult.city,
      state: gymResult.state,
      pincode: gymResult.pincode,
      gstNumber: gymResult.gst_number,
      currency: gymResult.currency || 'INR',
      logoUrl: gymResult.logo_url,
      status: gymResult.status,
    };

    const license: LicenseEntity = licenseResult
      ? {
          id: licenseResult.id,
          gymId: licenseResult.gym_id,
          subscriptionId: licenseResult.subscription_id,
          maxMembers: licenseResult.max_members ?? 100,
          maxStaff: licenseResult.max_staff ?? 3,
          status: licenseResult.status || 'ACTIVE',
          entitlements,
          expiresAt: licenseResult.expires_at || 0,
        }
      : {
          id: 'lic_default',
          gymId,
          subscriptionId: 'sub_default',
          maxMembers: 100,
          maxStaff: 3,
          status: 'ACTIVE',
          entitlements,
          expiresAt: Math.floor(Date.now() / 1000) + 86400 * 365,
        };

    return { gym, license };
  } catch (err) {
    console.error('[Tenant Service Error]', err);
    return { gym: null, license: null };
  }
}
