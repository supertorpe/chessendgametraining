export interface Controller {
    setInfo(info: any): void;
    getSEOParams(): any;
    onEnter($routeParams?: any): void;
    onExit(): Promise<boolean>;
}

export class BaseController implements Controller {
    setInfo(_info: any) {
    }
    getSEOParams(): any {
        return {};
    }
    onEnter(_$routeParams?: any): void {
    }
    onExit(): Promise<boolean> {
        return new Promise<boolean>(resolve => { resolve(true); });
    }
}

export const dummyController = new BaseController();