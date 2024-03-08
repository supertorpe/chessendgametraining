import { appController, homeController, aboutController, settingsController, listController, positionController, promotionController } from './controllers';

export const ROUTE_MAP = {
    hash: true,
    mainRoute: {
        path: '/chess-endgame-training/',
        template: 'app.html',
        tag: 'ion-app',
        controller: appController,
        hasParams: false
    },
    routes: [
        {
            path: '/',
            template: 'home.html',
            tag: 'ion-router-outlet',
            controller: homeController,
            hasParams: false
        },
        {
            path: '/home',
            template: 'home.html',
            tag: 'ion-router-outlet',
            controller: homeController,
            hasParams: false
        },
        {
            path: '/about',
            template: 'about.html',
            tag: 'ion-router-outlet',
            controller: aboutController,
            hasParams: false
        },
        {
            path: '/settings',
            template: 'settings.html',
            tag: 'ion-router-outlet',
            controller: settingsController,
            hasParams: false
        },
        {
            path: '/list/:idxCategory/:idxSubcategory',
            template: 'list.html',
            tag: 'ion-router-outlet',
            controller: listController,
            hasParams: true
        },
        {
            path: '/position/:idxCategory/:idxSubcategory/:idxGame',
            template: 'position.html',
            tag: 'ion-router-outlet',
            controller: positionController,
            hasParams: true
        },
        {
            path: '/fen/:fen1/:fen2/:fen3/:fen4/:fen5/:fen6/:fen7/:fen8',
            template: 'position.html',
            tag: 'ion-router-outlet',
            controller: positionController,
            hasParams: true
        },
        {
            path: '/fen/:fen1/:fen2/:fen3/:fen4/:fen5/:fen6/:fen7/:fen8/:target',
            template: 'position.html',
            tag: 'ion-router-outlet',
            controller: positionController,
            hasParams: true
        },
        {
            path: '/promotion',
            template: 'promotion.html',
            tag: 'ion-router-outlet',
            controller: promotionController,
            hasParams: false
        }
    ]
};
