
export interface Position {
    target: string;
    fen: string;
    record: number;
}

export interface Subcategory {
    name: string;
    images: string[];
    imageUrls: string[];
    games: Position[];
    count: number;
}

export interface Category {
    name: string;
    icons: string[];
    iconUrls: string[];
    selected: boolean;
    subcategories: Subcategory[];
    count: number;
}

export interface EndgameDatabase {
    version: string;
    categories: Category[];
    count: number;
}

export interface Configuration {
    useSyzygy: boolean
    stockfishDepth: number,
    automaticShowFirstPosition: boolean,
    preventScreenOff: boolean,
    colorTheme: string,
    playSounds: boolean,
    fullScreen: boolean,
    highlightSquares: boolean,
    pieceTheme: string,
    boardTheme: string
}
