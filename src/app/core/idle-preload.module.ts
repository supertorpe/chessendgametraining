import {
  NgZone,
  NgModule,
  ModuleWithProviders,
  Inject,
  InjectionToken,
  Injectable
} from '@angular/core';
import { of } from 'rxjs';

export const REQUEST_IDLE_CALLBACK = new InjectionToken<string>('REQUEST_IDLE_CALLBACK');

export function __requestIdle(zone: NgZone) {
  if (typeof window === 'undefined') {
    return (fn) => setTimeout(fn);
  }
  const win: any = window;
  if (win.requestIdleCallback) {
    return (fn) => win.requestIdleCallback(fn);
  }
  return (fn) => zone.runOutsideAngular(() => win.setTimeout(fn, 10));
}

@Injectable()
export class IdlePreload {

  constructor(private _ngZone: NgZone, @Inject(REQUEST_IDLE_CALLBACK) private requestIdleCallback: any) { }

  preload(route: /*Route*/ any, fn: any /* () => Observable<any>*/): any/* Observable<any> */ {
    this.requestIdleCallback(fn);
    return of(null);
  }
}

export const IDLE_PRELOAD_PROVIDERS: any[] = [
  { provide: IdlePreload, useClass: IdlePreload, deps: [NgZone, REQUEST_IDLE_CALLBACK] }
];

export const REQUEST_IDLE_CALLBACK_PROVIDERS: any[] = [
  { provide: REQUEST_IDLE_CALLBACK, useFactory: __requestIdle, deps: [NgZone] }
];

export interface IdlePreloadConfig {
  requestIdleCallback?: boolean;
}

@NgModule({})
export class IdlePreloadModule {

  static forRoot(config: IdlePreloadConfig = {}): ModuleWithProviders {
    return {
      ngModule: IdlePreloadModule,
      providers: [
        ...(config.requestIdleCallback === false ? [] : REQUEST_IDLE_CALLBACK_PROVIDERS),
        ...IDLE_PRELOAD_PROVIDERS
      ]
    };
  }

  static IdleStrategy() {
    return IdlePreload;
  }

}
