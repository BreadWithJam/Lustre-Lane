/**
 * Admin authentication utilities using Firebase Auth.
 * Requirements: 5.1
 */

import { adminAuth } from './firebase-admin'

export interface AdminUser {
  uid: string
  email: string | undefined
  role: 'admin'
}

/**
 * Verify a Firebase ID token from the Authorization header.
 * Returns the decoded admin user or null if invalid/unauthorized.
 */
export async function verifyAdminToken(
  authHeader: string | null
): Promise<AdminUser | null> {
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    // Check custom claim for admin role
    if (decoded.role !== 'admin' && decoded.admin !== true) return null
    return { uid: decoded.uid, email: decoded.email, role: 'admin' }
  } catch {
    return null
  }
}

/**
 * Set admin custom claim on a Firebase user.
 * Call this once to promote a user to admin.
 */
export async function setAdminClaim(uid: string): Promise<void> {
  await adminAuth.setCustomUserClaims(uid, { role: 'admin', admin: true })
}
