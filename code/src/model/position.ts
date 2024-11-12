// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

export interface Position {
    target: string;
    fen: string;
    record: number;
}

export const isPosition = (obj: any): boolean => {
    return (
        typeof obj.target === 'string' &&
        typeof obj.fen === 'string' &&
        (obj.record === undefined || typeof obj.record === 'number')
    );
};
