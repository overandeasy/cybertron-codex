"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedSagaTransaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinaryOperations_1 = require("./cloudinaryOperations");
class EnhancedSagaTransaction {
    constructor(useMongoTransaction = true) {
        this.useMongoTransaction = useMongoTransaction;
        this.steps = [];
        this.completedSteps = [];
        this.session = null;
    }
    addStep(step) {
        this.steps.push(step);
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            try {
                // Start MongoDB session if using transactions
                if (this.useMongoTransaction) {
                    this.session = yield mongoose_1.default.startSession();
                    this.session.startTransaction();
                }
                // Execute all steps in order
                for (const step of this.steps) {
                    console.log(`[Saga] Executing step: ${step.name}`);
                    let attempts = 0;
                    const maxRetries = step.retries || 3;
                    while (attempts <= maxRetries) {
                        try {
                            result = yield step.execute();
                            this.completedSteps.push(step);
                            console.log(`[Saga] Step completed: ${step.name}`);
                            break;
                        }
                        catch (error) {
                            attempts++;
                            if (attempts > maxRetries) {
                                throw new Error(`Step ${step.name} failed after ${maxRetries} retries: ${error}`);
                            }
                            console.log(`[Saga] Retrying step ${step.name}, attempt ${attempts}`);
                            yield this.delay(1000 * attempts); // Exponential backoff
                        }
                    }
                }
                // Commit MongoDB transaction if all steps succeeded
                if (this.session) {
                    yield this.session.commitTransaction();
                    console.log('[Saga] MongoDB transaction committed');
                }
                return result;
            }
            catch (error) {
                console.error('[Saga] Transaction failed, starting rollback:', error);
                yield this.rollback();
                throw error;
            }
            finally {
                if (this.session) {
                    yield this.session.endSession();
                }
            }
        });
    }
    rollback() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[Saga] Starting rollback process');
            // Abort MongoDB transaction first
            if (this.session) {
                try {
                    yield this.session.abortTransaction();
                    console.log('[Saga] MongoDB transaction aborted');
                }
                catch (error) {
                    console.error('[Saga] Error aborting MongoDB transaction:', error);
                }
            }
            // Execute compensating actions in reverse order
            const reversedSteps = [...this.completedSteps].reverse();
            for (const step of reversedSteps) {
                try {
                    console.log(`[Saga] Executing compensation for: ${step.name}`);
                    yield step.compensate();
                    console.log(`[Saga] Compensation completed for: ${step.name}`);
                }
                catch (compensationError) {
                    console.error(`[Saga] Compensation failed for ${step.name}:`, compensationError);
                    // Continue with other compensations even if one fails
                }
            }
            console.log('[Saga] Rollback process completed');
        });
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Helper method to create Cloudinary upload step
    static createCloudinaryUploadStep(name, uploadFunction, uploadedUrls = []) {
        return {
            name,
            execute: () => __awaiter(this, void 0, void 0, function* () {
                const urls = yield uploadFunction();
                uploadedUrls.push(...urls); // Store for compensation
                return urls;
            }),
            compensate: () => __awaiter(this, void 0, void 0, function* () {
                if (uploadedUrls.length > 0) {
                    console.log(`[Saga] Removing ${uploadedUrls.length} uploaded images from Cloudinary`);
                    yield (0, cloudinaryOperations_1.removeImages)(uploadedUrls);
                    uploadedUrls.length = 0; // Clear the array
                }
            }),
            retries: 2
        };
    }
    // Helper method to create MongoDB operation step
    static createMongoStep(name, operation, compensationOperation) {
        return {
            name,
            execute: operation,
            compensate: compensationOperation || (() => __awaiter(this, void 0, void 0, function* () {
                console.log(`[Saga] No compensation defined for ${name}`);
            })),
            retries: 3
        };
    }
}
exports.EnhancedSagaTransaction = EnhancedSagaTransaction;
