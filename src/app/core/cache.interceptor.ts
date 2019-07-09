import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, timer, Observable } from 'rxjs';
import { startWith, tap, delay, delayWhen } from 'rxjs/operators';
import { RequestCacheService } from './request-cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {

    constructor(private cache: RequestCacheService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.method !== 'GET') {
            return next.handle(req);
        }
        const cachedResponse = this.cache.get(req);
        if (req.headers.get('x-refresh')) {
            const results$ = this.sendRequest(req, next, this.cache);
            return cachedResponse ?
                results$.pipe(startWith(cachedResponse)) :
                results$;
        }

        const result = cachedResponse ?
            of(cachedResponse) : this.sendRequest(req, next, this.cache);
        return result.pipe(delay(cachedResponse ? 250 : 200));
    }

    sendRequest(
        req: HttpRequest<any>,
        next: HttpHandler,
        cache: RequestCacheService): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            tap(event => {
                if (event instanceof HttpResponse) {
                    cache.put(req, event);
                }
            })
        );
    }
}
