import type { BaseEntity, FirestoreTimestamp } from './common.types';
export interface Parent extends BaseEntity {
    id: string;
    name: string;
    contactInfo: {
        phone: string;
        email?: string;
    };
    childStudentIds: string[];
    notes?: string;
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateParentRequest {
    name: string;
    contactInfo: {
        phone: string;
        email?: string;
    };
    childStudentIds?: string[];
    notes?: string;
}
export interface UpdateParentRequest {
    name?: string;
    contactInfo?: {
        phone?: string;
        email?: string;
    };
    childStudentIds?: string[];
    notes?: string;
}
export interface ParentSearchParams {
    name?: string;
    phone?: string;
    email?: string;
    childStudentId?: string;
    hasMultipleChildren?: boolean;
}
export interface ParentStatistics {
    totalParents: number;
    averageChildrenPerParent: number;
    parentsWithMultipleChildren: number;
    parentsWithoutChildren: number;
}
export interface ParentValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export interface ParentValidationRule {
    field: keyof Parent;
    required: boolean;
    validator?: (value: any) => boolean;
    errorMessage: string;
}
//# sourceMappingURL=parent.types.d.ts.map