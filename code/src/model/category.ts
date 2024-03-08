import { Subcategory } from './subcategory';

export interface Category {
    name: string;
    icons: string[];
    iconUrls: string[];
    subcategories: Subcategory[];
    count: number;
}
