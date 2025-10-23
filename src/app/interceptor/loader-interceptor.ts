import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader-service';
import { finalize} from 'rxjs';
 
export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoaderService);
  loadingService.addRequest();
  console.log("İstek başlıyor.");
 
  //RxJs pipe yapısı
  return next(req).pipe(
    finalize(() => {
      console.log("İstek bitti.");
      loadingService.removeRequest();
    })
  );
};