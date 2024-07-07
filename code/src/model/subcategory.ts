// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { Position } from './position';

export interface Subcategory {
    name: string;
    images: string[];
    imageUrls: string[];
    games: Position[];
    count: number;
}
