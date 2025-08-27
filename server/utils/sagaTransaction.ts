import mongoose from 'mongoose';
import { removeImages } from './cloudinaryOperations';

export interface CompensatingAction {
    name: string;
    execute: () => Promise<void>;
    retries?: number;
}

export interface SagaStep {
    name: string;
    execute: () => Promise<any>;
    compensate: () => Promise<void>;
    retries?: number;
}

export class EnhancedSagaTransaction {
    private steps: SagaStep[] = [];
    private completedSteps: SagaStep[] = [];
    private session: mongoose.ClientSession | null = null;

    constructor(private useMongoTransaction = true) { }

    addStep(step: SagaStep): void {
        this.steps.push(step);
    }

    async execute(): Promise<any> {
        let result: any = null;

        try {
            // Start MongoDB session if using transactions
            if (this.useMongoTransaction) {
                this.session = await mongoose.startSession();
                this.session.startTransaction();
            }

            // Execute all steps in order
            for (const step of this.steps) {
                console.log(`[Saga] Executing step: ${step.name}`);

                let attempts = 0;
                const maxRetries = step.retries || 3;

                while (attempts <= maxRetries) {
                    try {
                        result = await step.execute();
                        this.completedSteps.push(step);
                        console.log(`[Saga] Step completed: ${step.name}`);
                        break;
                    } catch (error) {
                        attempts++;
                        if (attempts > maxRetries) {
                            throw new Error(`Step ${step.name} failed after ${maxRetries} retries: ${error}`);
                        }
                        console.log(`[Saga] Retrying step ${step.name}, attempt ${attempts}`);
                        await this.delay(1000 * attempts); // Exponential backoff
                    }
                }
            }

            // Commit MongoDB transaction if all steps succeeded
            if (this.session) {
                await this.session.commitTransaction();
                console.log('[Saga] MongoDB transaction committed');
            }

            return result;

        } catch (error) {
            console.error('[Saga] Transaction failed, starting rollback:', error);
            await this.rollback();
            throw error;
        } finally {
            if (this.session) {
                await this.session.endSession();
            }
        }
    }

    private async rollback(): Promise<void> {
        console.log('[Saga] Starting rollback process');

        // Abort MongoDB transaction first
        if (this.session) {
            try {
                await this.session.abortTransaction();
                console.log('[Saga] MongoDB transaction aborted');
            } catch (error) {
                console.error('[Saga] Error aborting MongoDB transaction:', error);
            }
        }

        // Execute compensating actions in reverse order
        const reversedSteps = [...this.completedSteps].reverse();

        for (const step of reversedSteps) {
            try {
                console.log(`[Saga] Executing compensation for: ${step.name}`);
                await step.compensate();
                console.log(`[Saga] Compensation completed for: ${step.name}`);
            } catch (compensationError) {
                console.error(`[Saga] Compensation failed for ${step.name}:`, compensationError);
                // Continue with other compensations even if one fails
            }
        }

        console.log('[Saga] Rollback process completed');
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Helper method to create Cloudinary upload step
    static createCloudinaryUploadStep(
        name: string,
        uploadFunction: () => Promise<string[]>,
        uploadedUrls: string[] = []
    ): SagaStep {
        return {
            name,
            execute: async () => {
                const urls = await uploadFunction();
                uploadedUrls.push(...urls); // Store for compensation
                return urls;
            },
            compensate: async () => {
                if (uploadedUrls.length > 0) {
                    console.log(`[Saga] Removing ${uploadedUrls.length} uploaded images from Cloudinary`);
                    await removeImages(uploadedUrls);
                    uploadedUrls.length = 0; // Clear the array
                }
            },
            retries: 2
        };
    }

    // Helper method to create MongoDB operation step
    static createMongoStep(
        name: string,
        operation: () => Promise<any>,
        compensationOperation?: () => Promise<void>
    ): SagaStep {
        return {
            name,
            execute: operation,
            compensate: compensationOperation || (async () => {
                console.log(`[Saga] No compensation defined for ${name}`);
            }),
            retries: 3
        };
    }
}
