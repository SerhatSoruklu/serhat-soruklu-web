import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  mdiAccountOutline,
  mdiAlertCircleOutline,
  mdiBriefcaseOutline,
  mdiCheckCircleOutline,
  mdiChevronDown,
  mdiClockOutline,
  mdiEmailOutline,
  mdiFormatListBulleted,
  mdiHandshakeOutline,
  mdiMessageTextOutline,
  mdiNewspaperVariantOutline,
  mdiSendOutline,
  mdiServerNetwork,
  mdiShieldCheckOutline,
  mdiSitemapOutline,
  mdiTextBoxCheckOutline
} from '@mdi/js';
import { firstValueFrom, TimeoutError, timeout } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { environment } from '../../../environments/environment';

type ContactFieldName = 'firstName' | 'lastName' | 'email' | 'topic' | 'message';
export const CONTACT_REQUEST_TIMEOUT_MS = 45_000;
const MESSAGE_TEXTAREA_MIN_HEIGHT = 118;
const MESSAGE_TEXTAREA_MAX_HEIGHT = 260;

const trimmedMinLength = (requiredLength: number): ValidatorFn =>
  (control: AbstractControl<unknown>): ValidationErrors | null => {
    if (typeof control.value !== 'string') {
      return null;
    }

    const trimmedValue = control.value.trim();

    if (!trimmedValue) {
      return { required: true };
    }

    if (trimmedValue.length < requiredLength) {
      return {
        minlength: {
          actualLength: trimmedValue.length,
          requiredLength,
        },
      };
    }

    return null;
  };

const singleMailboxValidator: ValidatorFn = (
  control: AbstractControl<unknown>,
): ValidationErrors | null => {
  if (typeof control.value !== 'string' || !control.value) {
    return null;
  }

  const value = control.value.trim();

  if (
    !value ||
    /[\s,<>\r\n]/.test(value) ||
    value.split('@').length !== 2 ||
    value.length > 160
  ) {
    return { email: true };
  }

  const [localPart, domain] = value.split('@');
  const localPartIsValid =
    localPart.length <= 64 &&
    !localPart.startsWith('.') &&
    !localPart.endsWith('.') &&
    !localPart.includes('..') &&
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(localPart);
  const domainLabels = domain.split('.');
  const domainIsValid =
    domain.length <= 253 &&
    domainLabels.length >= 2 &&
    domainLabels.every(
      (label) =>
        label.length >= 1 &&
        label.length <= 63 &&
        /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
    );

  return localPartIsValid && domainIsValid ? null : { email: true };
};

interface ContactApiResponse {
  ok?: boolean;
  success?: boolean;
  code?: string;
  message?: string;
  error?: string;
  errors?: Partial<Record<ContactFieldName | 'form', string>>;
  deliveryStatus?: string;
  confirmationDelivered?: boolean;
  internalDelivered?: boolean;
  internalDeliveryUnknown?: boolean;
  submissionId?: string;
}

interface ContactTopic {
  label: string;
  note: string;
  messageHint: string;
  messagePlaceholder: string;
  icon: string;
}

interface MessageResizeState {
  pointerId: number;
  startY: number;
  startHeight: number;
  textarea: HTMLTextAreaElement;
}

@Component({
  selector: 'app-contact',
  imports: [MatIconModule, MatProgressSpinnerModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly isSubmitted = signal(false);
  readonly confirmationDelivered = signal(true);
  readonly deliveryStatus = signal<'complete' | 'internal_delivered' | 'unknown'>('complete');
  readonly submissionMessage = signal('');
  readonly submitError = signal('');
  readonly topicDropdownOpen = signal(false);
  readonly activeTopicIndex = signal(0);
  readonly isMessageResizing = signal(false);
  private messageResizeState: MessageResizeState | null = null;
  private submissionId = this.createSubmissionId();

  readonly topics: readonly ContactTopic[] = [
    {
      label: 'Systems architecture',
      note: 'System boundaries, architecture direction, and technical shape.',
      messageHint: '20 to 2000 characters. Mention boundaries, constraints, and the decision needed.',
      messagePlaceholder: 'Describe the architecture boundary, current constraints, and what needs deciding.',
      icon: 'contact-topic-systems'
    },
    {
      label: 'Product engineering',
      note: 'Product execution, frontend/backend delivery, and UX systems.',
      messageHint: '20 to 2000 characters. Mention the product surface, users, and what needs shipping.',
      messagePlaceholder: 'Describe the product surface, delivery stage, and what needs building or improving.',
      icon: 'contact-topic-product'
    },
    {
      label: 'Infrastructure / deployment',
      note: 'Hosting, release flow, deployment, reliability, and operations.',
      messageHint: '20 to 2000 characters. Mention hosting, release flow, reliability, and target environment.',
      messagePlaceholder: 'Describe the hosting stack, release path, reliability issue, and deployment target.',
      icon: 'contact-topic-infra'
    },
    {
      label: 'Coupyn',
      note: 'Coupon, referral, company-page, or commerce infrastructure work.',
      messageHint: '20 to 2000 characters. Mention company pages, listings, referrals, SEO, or trust signals.',
      messagePlaceholder: 'Describe the Coupyn-related company page, listing, referral, or discovery problem.',
      icon: 'contact-topic-shield'
    },
    {
      label: 'ChatPDM',
      note: 'Deterministic governance, bounded language, and concept control.',
      messageHint: '20 to 2000 characters. Mention the concept boundary, refusal behavior, or drift risk.',
      messagePlaceholder: 'Describe the ChatPDM concept boundary, governance need, or drift problem.',
      icon: 'contact-topic-message'
    },
    {
      label: 'Collaboration',
      note: 'Partnerships, opportunities, or serious project conversations.',
      messageHint: '20 to 2000 characters. Mention context, timeline, role, and a practical next step.',
      messagePlaceholder: 'Describe the collaboration context, timing, role, and what a useful next step is.',
      icon: 'contact-topic-collab'
    },
    {
      label: 'Press / media enquiry',
      note: 'Interviews, fact checks, publication permissions, and media requests.',
      messageHint: '20 to 2000 characters. Mention the publication, deadline, request, and intended use.',
      messagePlaceholder: 'Describe the publication, deadline, interview or fact-check request, and intended use.',
      icon: 'contact-topic-press'
    },
    {
      label: 'Other',
      note: 'Anything else that belongs in a direct note.',
      messageHint: '20 to 2000 characters. Mention the context, what you need, and the clearest next step.',
      messagePlaceholder: 'Describe the context, what you need, and the clearest next step.',
      icon: 'contact-topic-other'
    }
  ];

  readonly contactForm = this.formBuilder.group({
    firstName: ['', [Validators.required, trimmedMinLength(2), Validators.maxLength(60)]],
    lastName: ['', [Validators.required, trimmedMinLength(2), Validators.maxLength(60)]],
    email: ['', [Validators.required, singleMailboxValidator, Validators.maxLength(160)]],
    topic: ['', [Validators.required]],
    message: ['', [Validators.required, trimmedMinLength(20), Validators.maxLength(2000)]],
    website: ['']
  });

  constructor() {
    this.registerIcons();
    this.clearServerErrorsOnEdit();
  }

  get messageLength(): number {
    return this.contactForm.controls.message.value.length;
  }

  get currentSubmissionId(): string {
    return this.submissionId;
  }

  get selectedTopic(): ContactTopic | undefined {
    const value = this.contactForm.controls.topic.value;

    return this.topics.find((topic) => topic.label === value);
  }

  get topicTriggerLabel(): string {
    return this.selectedTopic?.label || 'Choose the route';
  }

  get topicTriggerIcon(): string {
    return this.selectedTopic?.icon || 'contact-topic-other';
  }

  get messageHint(): string {
    return this.selectedTopic?.messageHint || '20 to 2000 characters. Choose a topic for a more specific prompt.';
  }

  get messagePlaceholder(): string {
    return this.selectedTopic?.messagePlaceholder || 'Describe the system, problem, or collaboration in a few concrete details.';
  }

  @HostListener('document:click', ['$event'])
  closeTopicDropdownOnOutsideClick(event: Event): void {
    const target = event.target as HTMLElement | null;

    if (!target?.closest('.contact-topic-picker')) {
      this.closeTopicDropdown();
    }
  }

  shouldShowError(fieldName: ContactFieldName): boolean {
    const control = this.contactForm.controls[fieldName];

    return control.invalid && (control.touched || control.dirty);
  }

  fieldError(fieldName: ContactFieldName): string {
    const control = this.contactForm.controls[fieldName];

    if (!this.shouldShowError(fieldName)) {
      return '';
    }

    if (control.hasError('server')) {
      return String(control.getError('server'));
    }

    if (control.hasError('required')) {
      return this.requiredMessage(fieldName);
    }

    if (control.hasError('minlength')) {
      const error = control.getError('minlength') as { requiredLength: number };
      return `${this.fieldLabel(fieldName)} must be at least ${error.requiredLength} characters.`;
    }

    if (control.hasError('maxlength')) {
      const error = control.getError('maxlength') as { requiredLength: number };
      return `${this.fieldLabel(fieldName)} must be ${error.requiredLength} characters or fewer.`;
    }

    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }

    return 'Check this field.';
  }

  characterCounter(fieldName: ContactFieldName, max: number): string {
    return `${this.contactForm.controls[fieldName].value.length}/${max}`;
  }

  async submit(): Promise<void> {
    this.submitError.set('');
    this.clearServerErrors();
    this.contactForm.markAllAsTouched();

    if (this.contactForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    try {
      const rawValue = this.contactForm.getRawValue();
      const payload = {
        ...rawValue,
        firstName: rawValue.firstName.trim(),
        lastName: rawValue.lastName.trim(),
        email: rawValue.email.trim(),
        topic: rawValue.topic.trim(),
        message: rawValue.message.trim(),
        submissionId: this.submissionId,
      };
      const response = await firstValueFrom(
        this.http
          .post<ContactApiResponse>(`${environment.apiBaseUrl}/contact`, payload, {
            headers: {
              'Idempotency-Key': this.submissionId,
            },
          })
          .pipe(timeout(CONTACT_REQUEST_TIMEOUT_MS)),
      );

      if (!response.success && !response.ok) {
        throw new Error(response.error || 'The message could not be sent.');
      }

      this.markSubmitted(response);
      this.contactForm.reset();
    } catch (error) {
      this.handleSubmitError(error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  resetForm(): void {
    this.isSubmitted.set(false);
    this.confirmationDelivered.set(true);
    this.deliveryStatus.set('complete');
    this.submissionMessage.set('');
    this.submitError.set('');
    this.clearServerErrors();
    this.closeTopicDropdown(false);
    this.contactForm.reset();
    this.rotateSubmissionId();
  }

  toggleTopicDropdown(event: MouseEvent): void {
    event.stopPropagation();

    if (this.topicDropdownOpen()) {
      this.closeTopicDropdown();
      return;
    }

    this.openTopicDropdown();
  }

  selectTopic(topic: ContactTopic, index: number, event?: MouseEvent): void {
    event?.stopPropagation();
    this.contactForm.controls.topic.setValue(topic.label);
    this.contactForm.controls.topic.markAsDirty();
    this.contactForm.controls.topic.markAsTouched();
    this.activeTopicIndex.set(index);
    this.closeTopicDropdown(false);
  }

  startMessageResize(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    const grip = event.currentTarget as HTMLElement | null;
    const textarea = grip?.parentElement?.querySelector<HTMLTextAreaElement>('.contact-field__textarea');

    if (!grip || !textarea) {
      return;
    }

    event.preventDefault();
    grip.setPointerCapture(event.pointerId);
    this.messageResizeState = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: textarea.getBoundingClientRect().height,
      textarea
    };
    this.isMessageResizing.set(true);
  }

  resizeMessage(event: PointerEvent): void {
    const state = this.messageResizeState;

    if (!state || event.pointerId !== state.pointerId) {
      return;
    }

    event.preventDefault();
    const nextHeight = this.clampMessageTextareaHeight(state.startHeight + event.clientY - state.startY, state.textarea);
    state.textarea.style.height = `${nextHeight}px`;
  }

  finishMessageResize(event: PointerEvent): void {
    const state = this.messageResizeState;

    if (!state || event.pointerId !== state.pointerId) {
      return;
    }

    const grip = event.currentTarget as HTMLElement | null;

    if (grip?.hasPointerCapture(event.pointerId)) {
      grip.releasePointerCapture(event.pointerId);
    }

    this.messageResizeState = null;
    this.isMessageResizing.set(false);
  }

  topicOptionId(index: number): string {
    return `contact-topic-option-${index}`;
  }

  handleTopicKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();

        if (this.topicDropdownOpen()) {
          this.selectTopic(this.topics[this.activeTopicIndex()], this.activeTopicIndex());
          return;
        }

        this.openTopicDropdown();
        return;
      case 'Escape':
        if (this.topicDropdownOpen()) {
          event.preventDefault();
          this.closeTopicDropdown();
        }
        return;
      case 'ArrowDown':
        event.preventDefault();
        this.openTopicDropdown();
        this.activeTopicIndex.update((index) => Math.min(index + 1, this.topics.length - 1));
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.openTopicDropdown();
        this.activeTopicIndex.update((index) => Math.max(index - 1, 0));
        return;
      case 'Home':
        if (this.topicDropdownOpen()) {
          event.preventDefault();
          this.activeTopicIndex.set(0);
        }
        return;
      case 'End':
        if (this.topicDropdownOpen()) {
          event.preventDefault();
          this.activeTopicIndex.set(this.topics.length - 1);
        }
        return;
      case 'Tab':
        this.closeTopicDropdown();
        return;
      default:
        return;
    }
  }

  private handleSubmitError(error: unknown): void {
    if (error instanceof TimeoutError) {
      this.submitError.set('The delivery check timed out. You can retry this unchanged message safely; its submission identifier prevents a duplicate notification.');
      return;
    }

    if (error instanceof HttpErrorResponse) {
      const body = error.error as ContactApiResponse | undefined;

      if (body?.errors) {
        this.applyServerErrors(body.errors);
        this.submitError.set(body.errors.form || body.error || 'Please check the highlighted fields.');
        return;
      }

      if (body?.code === 'PARTIAL_DELIVERY' || body?.internalDelivered) {
        this.markSubmitted(body);
        return;
      }

      if (error.status === 429 || body?.code === 'RATE_LIMITED') {
        this.submitError.set('Too many messages sent. Please try again later.');
        return;
      }

      this.submitError.set(body?.error || 'The message could not be sent. Please try again later.');
      return;
    }

    this.submitError.set(error instanceof Error ? error.message : 'The message could not be sent. Please try again later.');
  }

  private applyServerErrors(errors: Partial<Record<ContactFieldName | 'form', string>>): void {
    const fields: readonly ContactFieldName[] = ['firstName', 'lastName', 'email', 'topic', 'message'];

    for (const field of fields) {
      if (!errors[field]) {
        continue;
      }

      const control = this.contactForm.controls[field];
      control.setErrors({
        ...(control.errors || {}),
        server: errors[field]
      });
      control.markAsTouched();
    }
  }

  private clearServerErrors(): void {
    const fields: readonly ContactFieldName[] = ['firstName', 'lastName', 'email', 'topic', 'message'];

    for (const field of fields) {
      this.clearControlServerError(this.contactForm.controls[field]);
    }
  }

  private clearServerErrorsOnEdit(): void {
    const fields: readonly ContactFieldName[] = ['firstName', 'lastName', 'email', 'topic', 'message'];

    for (const field of fields) {
      this.contactForm.controls[field].valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.submitError.set('');
          this.clearControlServerError(this.contactForm.controls[field]);
          this.rotateSubmissionId();
        });
    }
  }

  private clearControlServerError(control: AbstractControl): void {
    if (!control.hasError('server')) {
      return;
    }

    const remainingErrors = { ...(control.errors || {}) };
    delete remainingErrors['server'];
    control.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
  }

  private fieldLabel(fieldName: ContactFieldName): string {
    const labels: Record<ContactFieldName, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      topic: 'Topic',
      message: 'Message'
    };

    return labels[fieldName];
  }

  private requiredMessage(fieldName: ContactFieldName): string {
    return `${this.fieldLabel(fieldName)} is required.`;
  }

  private openTopicDropdown(): void {
    const selectedIndex = this.topics.findIndex((topic) => topic.label === this.contactForm.controls.topic.value);
    this.activeTopicIndex.set(selectedIndex >= 0 ? selectedIndex : 0);
    this.topicDropdownOpen.set(true);
  }

  private closeTopicDropdown(markTouched = true): void {
    if (!this.topicDropdownOpen()) {
      return;
    }

    this.topicDropdownOpen.set(false);

    if (markTouched) {
      this.contactForm.controls.topic.markAsTouched();
    }
  }

  private clampMessageTextareaHeight(height: number, textarea: HTMLTextAreaElement): number {
    const styles = textarea.ownerDocument.defaultView?.getComputedStyle(textarea);
    const minHeight = Number.parseFloat(styles?.minHeight || '') || MESSAGE_TEXTAREA_MIN_HEIGHT;
    const maxHeight = Number.parseFloat(styles?.maxHeight || '') || MESSAGE_TEXTAREA_MAX_HEIGHT;

    return Math.min(Math.max(height, minHeight), maxHeight);
  }

  private markSubmitted(response: ContactApiResponse): void {
    const deliveryStatus = response.deliveryStatus === 'unknown'
      ? 'unknown'
      : response.confirmationDelivered === false
        ? 'internal_delivered'
        : 'complete';
    const confirmationDelivered = response.confirmationDelivered !== false;

    this.deliveryStatus.set(deliveryStatus);
    this.confirmationDelivered.set(confirmationDelivered);
    this.submissionMessage.set(
      deliveryStatus === 'unknown'
        ? 'The mail provider did not confirm whether your note was delivered. Please do not submit it again; Serhat can verify the original submission before any retry.'
        : confirmationDelivered
          ? 'Your note was received. A confirmation has been sent to your email, and replies may come through Serhat or Coupyn mail infrastructure.'
          : 'Your note reached Serhat, but a confirmation email could not be sent. Your message is already recorded, so there is no need to submit it again.',
    );
    this.isSubmitted.set(true);
  }

  private rotateSubmissionId(): void {
    this.submissionId = this.createSubmissionId();
  }

  private createSubmissionId(): string {
    return globalThis.crypto.randomUUID();
  }

  private registerIcons(): void {
    const icons = {
      'contact-alert': mdiAlertCircleOutline,
      'contact-check': mdiCheckCircleOutline,
      'contact-chevron': mdiChevronDown,
      'contact-clock': mdiClockOutline,
      'contact-email': mdiEmailOutline,
      'contact-message': mdiMessageTextOutline,
      'contact-name': mdiAccountOutline,
      'contact-send': mdiSendOutline,
      'contact-topic-collab': mdiHandshakeOutline,
      'contact-topic-infra': mdiServerNetwork,
      'contact-topic-message': mdiMessageTextOutline,
      'contact-topic-other': mdiFormatListBulleted,
      'contact-topic-press': mdiNewspaperVariantOutline,
      'contact-topic-product': mdiBriefcaseOutline,
      'contact-topic-shield': mdiShieldCheckOutline,
      'contact-topic-systems': mdiSitemapOutline,
      'contact-trust': mdiTextBoxCheckOutline
    };

    for (const [name, path] of Object.entries(icons)) {
      this.iconRegistry.addSvgIconLiteral(
        name,
        this.sanitizer.bypassSecurityTrustHtml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="${path}"/></svg>`) // NOSONAR: icon paths are compile-time constants from @mdi/js, not user input.
      );
    }
  }
}
