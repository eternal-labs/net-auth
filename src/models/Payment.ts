export interface Payment {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  amount: number; // in lamports
  transactionSignature?: string;
  status: PaymentStatus;
  memo?: string;
  createdAt: Date;
  completedAt?: Date;
  privacyToken?: string; // Token for privacy layer tracking
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface SendPaymentRequest {
  fromAgentId: string;
  toAgentId: string;
  amount: number; // in lamports
  memo?: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  transactionSignature?: string;
  message?: string;
}

