import { Position } from './position';

export interface Subcategory {
    name: string;
    images: string[];
    imageUrls: string[];
    games: Position[];
    count: number;
}
