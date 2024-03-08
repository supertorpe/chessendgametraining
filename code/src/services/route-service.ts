
import Navigo from 'navigo';
import { MenuI, menuController, modalController } from '@ionic/core';
import { Controller } from '../controllers';
import { MAIN_MENU_ID, setupSEO } from '../commons';
import { redrawIconImages } from './ionic';

interface RouteItem {
    path: string;
    template: string;
    tag: string;
    controller: Controller;
    hasParams: boolean;
}

interface RouteMap {
    hash: boolean,
    mainRoute: RouteItem;
    routes: RouteItem[];
}

class RouteService {

    private navigo!: Navigo;
    private menuRegistered = false;
    private templates = new Map<string, string>();
    
    private closeMenu = (menuId: string) => {
        if (!this.menuRegistered) {
            const query = "ion-menu[menu-id='" + menuId + "']";
            const menu = document.querySelector(query) as unknown as MenuI;
            if (!menu) return;
            menuController._register(menu);
            this.menuRegistered = true;
        }
        menuController.close(menuId);
    }

    private openRoute = (navigo: Navigo, template: string, targetElementSelector: string, controller: Controller, params?: any): Promise<void> => {
        this.closeMenu(MAIN_MENU_ID);
        return new Promise<void>(resolve => {
            const targetElement = document.querySelector(targetElementSelector);
            if (targetElement) {
                const elementObserver = new MutationObserver((mutations) => {
                    mutations.forEach((_mutation) => {
                        if (controller) {
                            elementObserver.disconnect();
                            redrawIconImages();
                            navigo.updatePageLinks();
                            resolve();
                        }
                    });
                });
                elementObserver.observe(targetElement, { childList: true });
                controller.onEnter(params);
                const content = this.templates.get(template);
                if (content) {
                    targetElement.innerHTML = content;
                    setupSEO(template, controller.getSEOParams());
                } else {
                    fetch(template)
                        .then(response => response.text()
                            .then(content => {
                                this.templates.set(template, content);
                                targetElement.innerHTML = content;
                                setupSEO(template, controller.getSEOParams());
                                redrawIconImages();
                            }));
                }
            }
        });
    }

    private open(routeItem: RouteItem): (params?: any) => Promise<void> {
        if (routeItem.hasParams) {
            return (params: any) => this.openRoute(this.navigo, routeItem.template, routeItem.tag, routeItem.controller, params);
        } else {
            return () => this.openRoute(this.navigo, routeItem.template, routeItem.tag, routeItem.controller);
        }
    }

    public openModal(xData: string, template: string, controller: Controller, pageMode: boolean, autoHeight: boolean, info?: any): Promise<any> {
        const element = document.createElement('div');
        element.setAttribute('x-data', xData);
        const content = this.templates.get(template);
        if (content) {
            element.innerHTML = content;
            return this.innerOpenModal(element, controller, pageMode, autoHeight, info);
        } else {
            return fetch(template)
                .then(response => response.text()
                    .then(async content => {
                        this.templates.set(template, content);
                        element.innerHTML = content;
                        return this.innerOpenModal(element, controller, pageMode, autoHeight, info);
                    }));
        }
    }

    private async innerOpenModal(component: HTMLElement, controller: Controller, pageMode: boolean, autoHeight: boolean, info?: any): Promise<any> {
        const modal = await modalController.create({ component: component });
        if (autoHeight) modal.style.setProperty('--height', 'auto');
        if (info) controller.setInfo(info);
        controller.onEnter(info);
        modal.present().then(() => { redrawIconImages(); });
        // remove ion-page class on the next tick, when the DOM of the modal has been loaded
        if (!pageMode) {
            requestAnimationFrame(() => {
                if (!pageMode) component.classList.remove('ion-page');
            });
        }
        const { data } = await modal.onDidDismiss();
        return data;
    }

    public updatePageLinks() {
        this.navigo.updatePageLinks();
    }

    public init(routeMap: RouteMap) {
        this.navigo = new Navigo(routeMap.mainRoute.path, { hash: routeMap.hash });
        const mainRoute = this.open(routeMap.mainRoute);
        routeMap.routes.forEach((route) => {
            const oRoute = this.open(route);
            if (route.hasParams) {
                this.navigo.on(route.path, (info: any) => {
                    document.querySelector(route.tag) ? oRoute(info.data) : mainRoute().then(() => oRoute(info.data));
                }, {
                    leave(done, _match) {
                        route.controller.onExit().then((canExit: boolean) => done(canExit));
                    }
                });
            } else {
                this.navigo.on(route.path, () => {
                    document.querySelector(route.tag) ? oRoute() : mainRoute().then(() => oRoute());
                });
            }
        });
        this.navigo.resolve();
    }
}

export const routeService = new RouteService();