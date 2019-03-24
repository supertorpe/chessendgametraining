
export interface Position {
    move: string;
    target: string;
    fen: string;
    record: number;
}

export interface Subcategory {
    name: string;
    images: string[];
    games: Position[];
}

export interface Category {
    name: string;
    icon: string;
    selected: boolean;
    subcategories: Subcategory[];
}

export interface EndgameDatabase {
    version: string,
    categories: Category[];
}