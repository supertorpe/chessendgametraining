// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { storageService } from './storage-service';
import { 
    PositionProgress, 
    CategoryProgress, 
    TrainingSession, 
    UserProgress, 
    Achievement,
    isPositionProgress,
    isCategoryProgress,
    isTrainingSession,
    isUserProgress
} from '../model/progress';

export class ProgressService {
    private readonly STORAGE_KEYS = {
        USER_PROGRESS: 'USER_PROGRESS',
        CURRENT_SESSION: 'CURRENT_SESSION',
        POSITION_PROGRESS: 'POSITION_PROGRESS',
        CATEGORY_PROGRESS: 'CATEGORY_PROGRESS',
        ACHIEVEMENTS: 'ACHIEVEMENTS'
    };

    private userProgress: UserProgress | null = null;
    private currentSession: TrainingSession | null = null;
    private positionProgress: Map<string, PositionProgress> = new Map();
    private categoryProgress: Map<number, CategoryProgress> = new Map();
    private achievements: Achievement[] = [];

    constructor() {
        console.log('[ProgressService] Constructor called');
    }

    public async initialize(): Promise<void> {
        console.log('[ProgressService] Initializing...');
        
        try {
            // Load user progress
            const userProgressData = await storageService.get(this.STORAGE_KEYS.USER_PROGRESS);
            if (userProgressData && isUserProgress(userProgressData)) {
                this.userProgress = userProgressData;
                console.log('[ProgressService] User progress loaded:', this.userProgress);
            } else {
                this.userProgress = this.createNewUserProgress();
                await this.saveUserProgress();
                console.log('[ProgressService] New user progress created');
            }

            // Load position progress
            const positionProgressData = await storageService.get(this.STORAGE_KEYS.POSITION_PROGRESS);
            if (positionProgressData && Array.isArray(positionProgressData)) {
                const filteredPositionProgress = (positionProgressData as any[]).filter(isPositionProgress);
                // @ts-ignore
                this.positionProgress = new Map(filteredPositionProgress.map((p: any) => [p.positionId, p]));
                console.log('[ProgressService] Position progress loaded:', this.positionProgress.size, 'positions');
            }

            // Load category progress
            const categoryProgressData = await storageService.get(this.STORAGE_KEYS.CATEGORY_PROGRESS);
            if (categoryProgressData && Array.isArray(categoryProgressData)) {
                const filteredCategoryProgress = (categoryProgressData as any[]).filter(isCategoryProgress);
                // @ts-ignore
                this.categoryProgress = new Map(filteredCategoryProgress.map((c: any) => [c.categoryIndex, c]));
                console.log('[ProgressService] Category progress loaded:', this.categoryProgress.size, 'categories');
            }

            // Load achievements
            const achievementsData = await storageService.get(this.STORAGE_KEYS.ACHIEVEMENTS);
            if (achievementsData && Array.isArray(achievementsData)) {
                this.achievements = achievementsData;
                console.log('[ProgressService] Achievements loaded:', this.achievements.length, 'achievements');
            } else {
                this.achievements = this.createDefaultAchievements();
                await this.saveAchievements();
            }

            // Check for current session
            const currentSessionData = await storageService.get(this.STORAGE_KEYS.CURRENT_SESSION);
            if (currentSessionData && isTrainingSession(currentSessionData)) {
                this.currentSession = currentSessionData;
                if (!this.currentSession!.endTime) {
                    console.log('[ProgressService] Resuming active session:', this.currentSession!.id);
                } else {
                    this.currentSession = null;
                }
            }

            console.log('[ProgressService] Initialization completed');
        } catch (error) {
            console.error('[ProgressService] Error during initialization:', error);
            // Initialize with default values if there's an error
            this.userProgress = this.createNewUserProgress();
            this.achievements = this.createDefaultAchievements();
        }
    }

    private createNewUserProgress(): UserProgress {
        return {
            userId: this.generateUserId(),
            totalPositions: 0,
            completedPositions: 0,
            overallSuccessRate: 0,
            totalTrainingTime: 0,
            averageSessionTime: 0,
            totalSessions: 0,
            currentStreak: 0,
            bestStreak: 0,
            categoriesProgress: [],
            recentSessions: [],
            achievements: [],
            lastUpdated: new Date()
        };
    }

    private generateUserId(): string {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    private createDefaultAchievements(): Achievement[] {
        return [
            {
                id: 'first_win',
                name: 'İlk Kazanım',
                description: 'İlk pozisyonu başarıyla tamamla',
                icon: 'star',
                unlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 1,
                category: 'accuracy'
            },
            {
                id: 'speed_demon',
                name: 'Hızlı Çözücü',
                description: 'Bir pozisyonu 60 saniyeden kısa sürede çöz',
                icon: 'flash',
                unlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 1,
                category: 'speed'
            },
            {
                id: 'consistent',
                name: 'Tutarlı',
                description: '5 pozisyonu üst üste başarıyla tamamla',
                icon: 'repeat',
                unlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 5,
                category: 'consistency'
            },
            {
                id: 'explorer',
                name: 'Keşifçi',
                description: '5 farklı kategoride pozisyon çöz',
                icon: 'compass',
                unlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 5,
                category: 'exploration'
            },
            {
                id: 'master',
                name: 'Usta',
                description: 'Toplam 50 pozisyonu tamamla',
                icon: 'crown',
                unlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 50,
                category: 'mastery'
            }
        ];
    }

    // Position tracking methods
    public async recordPositionAttempt(
        positionId: string,
        categoryIndex: number,
        subcategoryIndex: number,
        gameIndex: number,
        fen: string,
        target: string,
        success: boolean,
        timeTaken: number,
        hintsUsed: number
    ): Promise<void> {
        console.log('[ProgressService] Recording position attempt:', positionId, success, timeTaken);

        const positionKey = `${categoryIndex}_${subcategoryIndex}_${gameIndex}`;
        
        // Get or create position progress
        let positionProgress = this.positionProgress.get(positionKey);
        if (!positionProgress) {
            positionProgress = {
                positionId,
                categoryIndex,
                subcategoryIndex,
                gameIndex,
                fen,
                target,
                attempts: 0,
                successes: 0,
                bestTime: null,
                averageTime: 0,
                lastAttempt: null,
                hintsUsed: 0,
                completionDate: null,
                difficulty: this.calculateDifficulty(fen),
                masteryLevel: 0
            };
            this.positionProgress.set(positionKey, positionProgress);
        }

        // Update position progress
        positionProgress.attempts++;
        positionProgress.lastAttempt = new Date();
        positionProgress.hintsUsed += hintsUsed;

        if (success) {
            positionProgress.successes++;
            positionProgress.completionDate = new Date();
            
            // Update best time
            if (!positionProgress.bestTime || timeTaken < positionProgress.bestTime) {
                positionProgress.bestTime = timeTaken;
            }

            // Update average time
            const totalTime = (positionProgress.averageTime * (positionProgress.successes - 1)) + timeTaken;
            positionProgress.averageTime = totalTime / positionProgress.successes;

            // Update mastery level
            const successRate = positionProgress.successes / positionProgress.attempts;
            positionProgress.masteryLevel = Math.min(100, Math.round(successRate * 100));
        }

        // Update category progress
        this.updateCategoryProgress(categoryIndex, success, timeTaken);

        // Update user progress
        this.updateUserProgress(success, timeTaken);

        // Check achievements
        this.checkAchievements(success, timeTaken);

        // Save all changes
        await this.savePositionProgress();
        await this.saveCategoryProgress();
        await this.saveUserProgress();
        await this.saveAchievements();

        console.log('[ProgressService] Position progress updated:', positionProgress);
    }

    private calculateDifficulty(fen: string): 'easy' | 'medium' | 'hard' {
        // Simple difficulty calculation based on piece count and complexity
        const pieceCount = fen.substring(0, fen.indexOf(" ")).replace(/\d/g, "").length;
        
        if (pieceCount <= 4) return 'easy';
        if (pieceCount <= 6) return 'medium';
        return 'hard';
    }

    private updateCategoryProgress(categoryIndex: number, success: boolean, timeTaken: number): void {
        let categoryProgress = this.categoryProgress.get(categoryIndex);
        if (!categoryProgress) {
            categoryProgress = {
                categoryIndex,
                categoryName: `Kategori ${categoryIndex + 1}`,
                totalPositions: 0,
                completedPositions: 0,
                successRate: 0,
                averageTime: 0,
                bestTime: null,
                lastAttempt: null,
                masteryLevel: 0
            };
            this.categoryProgress.set(categoryIndex, categoryProgress);
        }

        categoryProgress.totalPositions++;
        categoryProgress.lastAttempt = new Date();

        if (success) {
            categoryProgress.completedPositions++;
            
            // Update success rate
            categoryProgress.successRate = (categoryProgress.completedPositions / categoryProgress.totalPositions) * 100;

            // Update best time
            if (!categoryProgress.bestTime || timeTaken < categoryProgress.bestTime) {
                categoryProgress.bestTime = timeTaken;
            }

            // Update average time
            const totalTime = (categoryProgress.averageTime * (categoryProgress.completedPositions - 1)) + timeTaken;
            categoryProgress.averageTime = totalTime / categoryProgress.completedPositions;

            // Update mastery level
            categoryProgress.masteryLevel = Math.min(100, Math.round(categoryProgress.successRate));
        }
    }

    private updateUserProgress(success: boolean, timeTaken: number): void {
        if (!this.userProgress) return;

        this.userProgress.totalPositions++;
        if (success) {
            this.userProgress.completedPositions++;
        }

        this.userProgress.overallSuccessRate = (this.userProgress.completedPositions / this.userProgress.totalPositions) * 100;
        this.userProgress.totalTrainingTime += timeTaken;

        // Update streaks
        if (success) {
            this.userProgress.currentStreak++;
            if (this.userProgress.currentStreak > this.userProgress.bestStreak) {
                this.userProgress.bestStreak = this.userProgress.currentStreak;
            }
        } else {
            this.userProgress.currentStreak = 0;
        }

        this.userProgress.lastUpdated = new Date();
    }

    private checkAchievements(success: boolean, timeTaken: number): void {
        if (!this.userProgress) return;

        // First win achievement
        if (success && this.userProgress.completedPositions === 1) {
            const achievement = this.achievements.find(a => a.id === 'first_win');
            if (achievement && !achievement.unlocked) {
                achievement.unlocked = true;
                achievement.unlockedDate = new Date();
                achievement.progress = achievement.target;
            }
        }

        // Speed demon achievement
        if (success && timeTaken < 60) {
            const achievement = this.achievements.find(a => a.id === 'speed_demon');
            if (achievement && !achievement.unlocked) {
                achievement.unlocked = true;
                achievement.unlockedDate = new Date();
                achievement.progress = achievement.target;
            }
        }

        // Consistency achievement
        if (success) {
            const achievement = this.achievements.find(a => a.id === 'consistent');
            if (achievement) {
                achievement.progress = Math.min(achievement.target, this.userProgress!.currentStreak);
                if (achievement.progress === achievement.target && !achievement.unlocked) {
                    achievement.unlocked = true;
                    achievement.unlockedDate = new Date();
                }
            }
        }

        // Explorer achievement
        const completedCategories = new Set(this.categoryProgress.values().map(cp => cp.categoryIndex)).size;
        const explorerAchievement = this.achievements.find(a => a.id === 'explorer');
        if (explorerAchievement) {
            explorerAchievement.progress = Math.min(explorerAchievement.target, completedCategories);
            if (explorerAchievement.progress === explorerAchievement.target && !explorerAchievement.unlocked) {
                explorerAchievement.unlocked = true;
                explorerAchievement.unlockedDate = new Date();
            }
        }

        // Master achievement
        const masterAchievement = this.achievements.find(a => a.id === 'master');
        if (masterAchievement) {
            masterAchievement.progress = Math.min(masterAchievement.target, this.userProgress!.completedPositions);
            if (masterAchievement.progress === masterAchievement.target && !masterAchievement.unlocked) {
                masterAchievement.unlocked = true;
                masterAchievement.unlockedDate = new Date();
            }
        }
    }

    // Session management
    public startTrainingSession(mode: 'practice' | 'timed' | 'challenge' = 'practice', difficulty: 'easy' | 'medium' | 'hard' = 'medium'): void {
        console.log('[ProgressService] Starting training session:', mode, difficulty);

        if (this.currentSession && !this.currentSession.endTime) {
            console.warn('[ProgressService] There is already an active session. Ending it first.');
            this.endTrainingSession();
        }

        this.currentSession = {
            id: this.generateSessionId(),
            startTime: new Date(),
            endTime: null,
            positionsAttempted: [],
            positionsCompleted: [],
            totalAttempts: 0,
            totalSuccesses: 0,
            totalFailures: 0,
            totalTime: 0,
            averageTime: 0,
            hintsUsed: 0,
            difficulty,
            trainingMode: mode
        };

        this.saveCurrentSession();
        console.log('[ProgressService] Training session started:', this.currentSession.id);
    }

    public endTrainingSession(): void {
        if (!this.currentSession) {
            console.warn('[ProgressService] No active session to end');
            return;
        }

        this.currentSession.endTime = new Date();
        const sessionDuration = Math.round((this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()) / 1000);

        // Add to recent sessions
        if (this.userProgress) {
            this.userProgress.recentSessions.unshift(this.currentSession);
            // Keep only last 10 sessions
            if (this.userProgress.recentSessions.length > 10) {
                this.userProgress.recentSessions = this.userProgress.recentSessions.slice(0, 10);
            }

            this.userProgress.totalSessions++;
            this.userProgress.averageSessionTime = this.calculateAverageSessionTime();
        }

        this.saveCurrentSession();
        this.saveUserProgress();

        console.log('[ProgressService] Training session ended:', this.currentSession.id, 'Duration:', sessionDuration, 'seconds');
        this.currentSession = null;
    }

    private generateSessionId(): string {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    private calculateAverageSessionTime(): number {
        if (!this.userProgress || this.userProgress.recentSessions.length === 0) {
            return 0;
        }

        const totalTime = this.userProgress.recentSessions.reduce((sum, session) => {
            if (session.endTime) {
                return sum + ((session.endTime.getTime() - session.startTime.getTime()) / 1000);
            }
            return sum;
        }, 0);

        return Math.round(totalTime / this.userProgress.recentSessions.length);
    }

    // Data retrieval methods
    public getPositionProgress(categoryIndex: number, subcategoryIndex: number, gameIndex: number): PositionProgress | null {
        const positionKey = `${categoryIndex}_${subcategoryIndex}_${gameIndex}`;
        return this.positionProgress.get(positionKey) || null;
    }

    public getCategoryProgress(categoryIndex: number): CategoryProgress | null {
        return this.categoryProgress.get(categoryIndex) || null;
    }

    public getUserProgress(): UserProgress | null {
        return this.userProgress;
    }

    public getCurrentSession(): TrainingSession | null {
        return this.currentSession;
    }

    public getAchievements(): Achievement[] {
        return this.achievements;
    }

    public getUnlockedAchievements(): Achievement[] {
        return this.achievements.filter(a => a.unlocked);
    }

    // Session-based position recording methods
    public recordPositionSuccess(fen: string, completionTime: number, hintsUsed: number, assistanceUsed: boolean): void {
        if (this.currentSession) {
            this.currentSession.positionsCompleted.push({
                fen,
                success: true,
                completionTime,
                hintsUsed,
                assistanceUsed,
                timestamp: new Date()
            });
            
            this.currentSession.totalSuccesses++;
            this.currentSession.totalTime += completionTime;
            this.currentSession.averageTime = this.currentSession.totalTime / this.currentSession.totalSuccesses;
            
            this.saveCurrentSession();
        }
    }

    public recordPositionFailure(fen: string, hintsUsed: number, assistanceUsed: boolean): void {
        if (this.currentSession) {
            this.currentSession.positionsCompleted.push({
                fen,
                success: false,
                completionTime: 0,
                hintsUsed,
                assistanceUsed,
                timestamp: new Date()
            });
            
            if (this.currentSession.totalFailures !== undefined) {
                this.currentSession.totalFailures++;
            }
            
            this.saveCurrentSession();
        }
    }

    // Export/Import methods
    public async exportProgress(): Promise<string> {
        const exportData: {
            userProgress: UserProgress | null;
            positionProgress: [string, PositionProgress][];
            categoryProgress: [number, CategoryProgress][];
            achievements: Achievement[];
            exportDate: string;
            version: string;
        } = {
            userProgress: this.userProgress,
            // @ts-ignore
            positionProgress: Array.from(this.positionProgress.values()).map((p: PositionProgress) => [p.positionId, p]),
            // @ts-ignore
            categoryProgress: Array.from(this.categoryProgress.values()).map((c: CategoryProgress) => [c.categoryIndex, c]),
            achievements: this.achievements,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        return JSON.stringify(exportData, null, 2);
    }

    public async importProgress(jsonData: string): Promise<boolean> {
        try {
            const importData = JSON.parse(jsonData);
            
            if (importData.userProgress && isUserProgress(importData.userProgress)) {
                this.userProgress = importData.userProgress;
            }
            
            if (importData.positionProgress && Array.isArray(importData.positionProgress)) {
                this.positionProgress = new Map(importData.positionProgress.map((p: { positionId: string; [key: string]: any }) => [p.positionId, p]));
            }
            
            if (importData.categoryProgress && Array.isArray(importData.categoryProgress)) {
                this.categoryProgress = new Map(importData.categoryProgress.map((c: { categoryIndex: number; [key: string]: any }) => [c.categoryIndex, c]));
            }
            
            if (importData.achievements && Array.isArray(importData.achievements)) {
                this.achievements = importData.achievements;
            }

            // Save all imported data
            await this.saveUserProgress();
            await this.savePositionProgress();
            await this.saveCategoryProgress();
            await this.saveAchievements();

            console.log('[ProgressService] Progress imported successfully');
            return true;
        } catch (error) {
            console.error('[ProgressService] Error importing progress:', error);
            return false;
        }
    }

    // Private save methods
    private async saveUserProgress(): Promise<void> {
        if (this.userProgress) {
            await storageService.set(this.STORAGE_KEYS.USER_PROGRESS, this.userProgress);
        }
    }

    private async savePositionProgress(): Promise<void> {
        const positionProgressArray = Array.from(this.positionProgress.values());
        await storageService.set(this.STORAGE_KEYS.POSITION_PROGRESS, positionProgressArray);
    }

    private async saveCategoryProgress(): Promise<void> {
        const categoryProgressArray = Array.from(this.categoryProgress.values());
        await storageService.set(this.STORAGE_KEYS.CATEGORY_PROGRESS, categoryProgressArray);
    }

    private async saveAchievements(): Promise<void> {
        await storageService.set(this.STORAGE_KEYS.ACHIEVEMENTS, this.achievements);
    }

    private async saveCurrentSession(): Promise<void> {
        if (this.currentSession) {
            await storageService.set(this.STORAGE_KEYS.CURRENT_SESSION, this.currentSession);
        } else {
            await storageService.remove(this.STORAGE_KEYS.CURRENT_SESSION);
        }
    }

    // Statistics methods
    public getStatistics() {
        if (!this.userProgress) {
            return {
                totalPositions: 0,
                completedPositions: 0,
                successRate: 0,
                totalTrainingTime: 0,
                averageSessionTime: 0,
                totalSessions: 0,
                currentStreak: 0,
                bestStreak: 0,
                unlockedAchievements: 0,
                totalAchievements: this.achievements.length
            };
        }

        return {
            totalPositions: this.userProgress.totalPositions,
            completedPositions: this.userProgress.completedPositions,
            successRate: Math.round(this.userProgress.overallSuccessRate),
            totalTrainingTime: this.userProgress.totalTrainingTime,
            averageSessionTime: this.userProgress.averageSessionTime,
            totalSessions: this.userProgress.totalSessions,
            currentStreak: this.userProgress.currentStreak,
            bestStreak: this.userProgress.bestStreak,
            unlockedAchievements: this.getUnlockedAchievements().length,
            totalAchievements: this.achievements.length
        };
    }
}

export const progressService = new ProgressService();