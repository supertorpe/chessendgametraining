// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

export interface Position {
    target: string;
    fen: string;
    record: number;
    // Moves to mate with best play, precalculated by tools/calc_mate_distance.py. Absent when
    // no tablebase covers the position. `mateInApprox` marks the ones stockfish estimated
    // rather than the tablebase proving.
    mateIn?: number;
    mateInApprox?: boolean;
}

export const isPosition = (obj: any): boolean => {
    return (
        typeof obj.target === 'string' &&
        typeof obj.fen === 'string' &&
        (obj.record === undefined || typeof obj.record === 'number') &&
        (obj.mateIn === undefined || typeof obj.mateIn === 'number') &&
        (obj.mateInApprox === undefined || typeof obj.mateInApprox === 'boolean')
    );
};
