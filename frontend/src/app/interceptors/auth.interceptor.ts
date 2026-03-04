import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from '../core/auth.service';

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);

    return from(authService.getAccessToken()).pipe(
        switchMap((token: string | null) => {
            if (token) {
                const clonedRequest = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                return next(clonedRequest);
            }
            return next(req);
        })
    );
};
