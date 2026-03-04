export interface PaymentRequest {
  id: string;
  userId: string;
  plan: 'basic' | 'pro';
  method: 'gcash' | 'maya';
  qrUrl?: string;           // url of generated qr code
  screenshotUrl?: string;   // user-uploaded screenshot
  status: 'pending' | 'scanning' | 'approved' | 'rejected';
  feedback?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
}

