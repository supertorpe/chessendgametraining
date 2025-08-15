// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

export interface PositionProgress {
    positionId: string;
    categoryIndex: number;
    subcategoryIndex: number;
    gameIndex: number;
    fen: string;
    target: string;
    attempts: number;
    successes: number;
    bestTime: number | null;
    averageTime: number;
    lastAttempt: Date | null;
    hintsUsed: number;
    completionDate: Date | null;
    difficulty: 'easy' | 'medium' | 'hard';
    masteryLevel: number; // 0-100
}

export interface CategoryProgress {
    categoryIndex: number;
    categoryName: string;
    totalPositions: number;
    completedPositions: number;
    successRate: number;
    averageTime: number;
    bestTime: number | null;
    lastAttempt: Date | null;
    masteryLevel: number; // 0-100
}

export interface TrainingSession {
    id: string;
    startTime: Date;
    endTime: Date | null;
    positionsAttempted: string[];
    positionsCompleted: PositionResult[];
    totalAttempts: number;
    totalSuccesses: number;
    totalFailures: number;
    totalTime: number;
    averageTime: number;
    hintsUsed: number;
    difficulty: 'easy' | 'medium' | 'hard';
    trainingMode: 'practice' | 'timed' | 'challenge';
}

export interface PositionResult {
    fen: string;
    success: boolean;
    completionTime: number;
    hintsUsed: number;
    assistanceUsed: boolean;
    timestamp: Date;
}

export interface UserProgress {
    userId: string;
    totalPositions: number;
    completedPositions: number;
    overallSuccessRate: number;
    totalTrainingTime: number;
    averageSessionTime: number;
    totalSessions: number;
    currentStreak: number;
    bestStreak: number;
    categoriesProgress: CategoryProgress[];
    recentSessions: TrainingSession[];
    achievements: Achievement[];
    lastUpdated: Date;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedDate: Date | null;
    progress: number;
    target: number;
    category: 'speed' | 'accuracy' | 'consistency' | 'exploration' | 'mastery';
}

export interface TrainingMode {
    id: string;
    name: string;
    description: string;
    icon: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit: number | null; // seconds
    hintLimit: number | null;
    features: {
        showTimer: boolean;
        showHints: boolean;
        showProgress: boolean;
        allowMistakes: boolean;
        autoNext: boolean;
    };
}

export const DEFAULT_TRAINING_MODES: TrainingMode[] = [
    {
        id: 'practice',
        name: 'Pratik Mod',
        description: 'Sınırsız zaman ve ipucu ile pratik yapın',
        icon: 'fitness',
        difficulty: 'medium',
        timeLimit: null,
        hintLimit: null,
        features: {
            showTimer: false,
            showHints: true,
            showProgress: true,
            allowMistakes: true,
            autoNext: false
        }
    },
    {
        id: 'timed',
        name: 'Zamanlı Mod',
        description: 'Her pozisyon için sınırlı süre içinde çözün',
        icon: 'timer',
        difficulty: 'hard',
        timeLimit: 300, // 5 dakika
        hintLimit: 2,
        features: {
            showTimer: true,
            showHints: true,
            showProgress: true,
            allowMistakes: false,
            autoNext: true
        }
    },
    {
        id: 'challenge',
        name: 'Meydan Okuma Modu',
        description: 'Sıralı pozisyonlar ve zorlu hedefler',
        icon: 'trophy',
        difficulty: 'hard',
        timeLimit: 180, // 3 dakika
        hintLimit: 1,
        features: {
            showTimer: true,
            showHints: true,
            showProgress: true,
            allowMistakes: false,
            autoNext: true
        }
    }
];

export const isPositionProgress = (obj: any): boolean => {
    return (
        typeof obj.positionId === 'string' &&
        typeof obj.categoryIndex === 'number' &&
        typeof obj.subcategoryIndex === 'number' &&
        typeof obj.gameIndex === 'number' &&
        typeof obj.fen === 'string' &&
        typeof obj.target === 'string' &&
        typeof obj.attempts === 'number' &&
        typeof obj.successes === 'number' &&
        (obj.bestTime === null || typeof obj.bestTime === 'number') &&
        typeof obj.averageTime === 'number' &&
        (obj.lastAttempt === null || obj.lastAttempt instanceof Date) &&
        typeof obj.hintsUsed === 'number' &&
        (obj.completionDate === null || obj.completionDate instanceof Date) &&
        ['easy', 'medium', 'hard'].includes(obj.difficulty) &&
        typeof obj.masteryLevel === 'number'
    );
};

export const isCategoryProgress = (obj: any): boolean => {
    return (
        typeof obj.categoryIndex === 'number' &&
        typeof obj.categoryName === 'string' &&
        typeof obj.totalPositions === 'number' &&
        typeof obj.completedPositions === 'number' &&
        typeof obj.successRate === 'number' &&
        typeof obj.averageTime === 'number' &&
        (obj.bestTime === null || typeof obj.bestTime === 'number') &&
        (obj.lastAttempt === null || obj.lastAttempt instanceof Date) &&
        typeof obj.masteryLevel === 'number'
    );
};

export const isTrainingSession = (obj: any): boolean => {
    return (
        typeof obj.id === 'string' &&
        obj.startTime instanceof Date &&
        (obj.endTime === null || obj.endTime instanceof Date) &&
        Array.isArray(obj.positionsAttempted) &&
        Array.isArray(obj.positionsCompleted) &&
        typeof obj.totalAttempts === 'number' &&
        typeof obj.totalSuccesses === 'number' &&
        typeof obj.totalTime === 'number' &&
        typeof obj.averageTime === 'number' &&
        typeof obj.hintsUsed === 'number' &&
        ['easy', 'medium', 'hard'].includes(obj.difficulty) &&
        ['practice', 'timed', 'challenge'].includes(obj.trainingMode)
    );
};

export const isUserProgress = (obj: any): boolean => {
    return (
        typeof obj.userId === 'string' &&
        typeof obj.totalPositions === 'number' &&
        typeof obj.completedPositions === 'number' &&
        typeof obj.overallSuccessRate === 'number' &&
        typeof obj.totalTrainingTime === 'number' &&
        typeof obj.averageSessionTime === 'number' &&
        typeof obj.totalSessions === 'number' &&
        typeof obj.currentStreak === 'number' &&
        typeof obj.bestStreak === 'number' &&
        Array.isArray(obj.categoriesProgress) &&
        Array.isArray(obj.recentSessions) &&
        Array.isArray(obj.achievements) &&
        obj.lastUpdated instanceof Date
    );
};