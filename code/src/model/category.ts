// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { isSubcategory, Subcategory } from './subcategory';

export interface Category {
    name: string;
    icons: string[];
    iconUrls: string[];
    subcategories: Subcategory[];
    count: number;
}

export const isCategory = (obj: any): boolean => {
    return (
        typeof obj.name === 'string' &&
        Array.isArray(obj.icons) &&
        obj.icons.every((icon: any) => typeof icon === 'string') &&
        Array.isArray(obj.iconUrls) &&
        obj.iconUrls.every((url: any) => typeof url === 'string') &&
        Array.isArray(obj.subcategories) &&
        obj.subcategories.every(isSubcategory) &&
        typeof obj.count === 'number'
    );
};
