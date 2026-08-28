import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensaje =
        error.error?.message ??
        (error.status === 0
          ? 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.'
          : 'Ocurrió un error inesperado');

      toast.error(mensaje);
      return throwError(() => error);
    })
  );
};
