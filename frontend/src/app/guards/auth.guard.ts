import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService } from '../core/auth.service'

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService)
  const router = inject(Router)

  const loggedIn = await auth.isLoggedIn()

  if (!loggedIn) {
    return router.parseUrl('/login')
  }

  return true
}

