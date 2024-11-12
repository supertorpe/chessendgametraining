// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { Category, isCategory } from './category';
import { endgamedatabaseJson } from '../static';

export interface EndgameDatabase {
    version: number;
    timestamp: number;
    categories: Category[];
    count: number;
}

export const isEndgameDatabase = (obj: any): boolean => {
    return (
        typeof obj.version === 'number' &&
        typeof obj.timestamp === 'number' &&
        Array.isArray(obj.categories) &&
        obj.categories.every(isCategory) &&
        typeof obj.count === 'number'
    );
};

export const endgameDatabase: EndgameDatabase = <any>endgamedatabaseJson;