// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { isPosition, Position } from './position';

export interface Subcategory {
    name: string;
    images: string[];
    imageUrls: string[];
    games: Position[];
    count: number;
}

export const isSubcategory = (obj: any): boolean => {
    return (
        typeof obj.name === 'string' &&
        Array.isArray(obj.images) &&
        obj.images.every((image: any) => typeof image === 'string') &&
        Array.isArray(obj.imageUrls) &&
        obj.imageUrls.every((url: any) => typeof url === 'string') &&
        Array.isArray(obj.games) &&
        obj.games.every(isPosition) &&
        typeof obj.count === 'number'
    );
};
