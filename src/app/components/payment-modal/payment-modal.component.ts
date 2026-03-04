import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentRequest } from '../../models/payment.model';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.css'
})
export class PaymentModalComponent {
  @Input() plan: 'basic' | 'pro' | null = null;
  @Input() qrUrl: string | null = null;
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Partial<PaymentRequest>>();

  method: 'gcash' | 'maya' | null = null;
  screenshotFile: File | null = null;

  onMethodSelect(m: 'gcash' | 'maya') {
    this.method = m;
  }

  onScreenshotChange(event: any) {
    const f = event.target.files && event.target.files[0];
    if (f) {
      this.screenshotFile = f;
    }
  }

  send() {
    this.submit.emit({ method: this.method!, screenshotUrl: this.screenshotFile ? URL.createObjectURL(this.screenshotFile) : undefined });
  }
}
