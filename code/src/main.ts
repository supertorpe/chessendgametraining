// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import './styles';

import { services_initialize, routeService } from './services';
import { ROUTE_MAP } from './routes';

services_initialize().then(() => { routeService.init(ROUTE_MAP); });
