// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { Subcategory } from './subcategory';

export interface Category {
    name: string;
    icons: string[];
    iconUrls: string[];
    subcategories: Subcategory[];
    count: number;
}
