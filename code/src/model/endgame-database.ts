// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { Category } from './category';
import { endgamedatabaseJson } from '../static';

export interface EndgameDatabase {
    version: string;
    timestamp: number;
    categories: Category[];
    count: number;
}

export const endgameDatabase: EndgameDatabase = <any>endgamedatabaseJson;