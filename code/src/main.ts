import './styles';

import { services_initialize, routeService } from './services';
import { ROUTE_MAP } from './routes';

services_initialize().then(() => { routeService.init(ROUTE_MAP); });
