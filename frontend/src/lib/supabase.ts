import { apiBaseUrl } from '../environments'

export async function getCurrentUser() {
  const res = await fetch(`${apiBaseUrl}/api/users/me`)
  return res.json()
}