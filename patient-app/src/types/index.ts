// src/types/index.ts
export interface User {
    id: number;
name: string;
phoneNumber: string;
age: number;
weight: number;
height: number;
eGFR?: number;
isDialysis: boolean;
}

export interface Prescription {
id: number;
patientId: number;
doctorName: string;
hospitalName: string;
prescribedAt: string;
drugs: Drug[];
status: 'pending' | 'confirmed' | 'rejected';
}

export interface Drug {
id: number;
name: string;
dosage: number;
unit: string;
frequency: string;
duration: number;
warning?: string;
}