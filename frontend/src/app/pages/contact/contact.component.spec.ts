import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { CONTACT_REQUEST_TIMEOUT_MS, ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('renders custom fields and blocks invalid submission', () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector<HTMLButtonElement>('button[type="submit"]');

    expect(compiled.querySelector('input[formControlName="firstName"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="lastName"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="email"]')).toBeTruthy();
    expect(compiled.querySelector('select')).toBeFalsy();
    expect(compiled.querySelector<HTMLButtonElement>('#contact-topic')).toBeTruthy();
    expect(compiled.querySelector('textarea[formControlName="message"]')).toBeTruthy();
    expect(submitButton?.disabled).toBe(true);
  });

  it('keeps required free-text fields invalid when they contain only whitespace', async () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    fixture.componentInstance.contactForm.setValue({
      firstName: '   ',
      lastName: '\t ',
      email: 'ada@example.com',
      topic: 'Systems architecture',
      message: '                    ',
      website: '',
    });
    fixture.componentInstance.contactForm.markAllAsTouched();
    fixture.detectChanges();

    expect(fixture.componentInstance.contactForm.controls.firstName.hasError('required')).toBe(true);
    expect(fixture.componentInstance.contactForm.controls.lastName.hasError('required')).toBe(true);
    expect(fixture.componentInstance.contactForm.controls.message.hasError('required')).toBe(true);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button[type="submit"]')
        ?.disabled,
    ).toBe(true);

    await fixture.componentInstance.submit();
    httpTesting.expectNone(`${environment.apiBaseUrl}/contact`);
  });

  it('accepts one ordinary mailbox and rejects recipient lists and display-name wrappers', () => {
    const fixture = TestBed.createComponent(ContactComponent);
    const email = fixture.componentInstance.contactForm.controls.email;

    email.setValue('ada@example.com');
    expect(email.valid).toBe(true);

    for (const invalidEmail of [
      'victim@example.com,other',
      '<victim@example.com>',
      'Ada <victim@example.com>',
      'victim@example',
      'victim@example.com\r\nBcc: other@example.com',
    ]) {
      email.setValue(invalidEmail);
      expect({ invalidEmail, hasEmailError: email.hasError('email') }).toEqual({
        invalidEmail,
        hasEmailError: true,
      });
    }
  });

  it('allows enough client time for the bounded backend delivery window', () => {
    expect(CONTACT_REQUEST_TIMEOUT_MS).toBeGreaterThanOrEqual(36_000);
    expect(CONTACT_REQUEST_TIMEOUT_MS).toBe(45_000);
  });

  it('updates the topic control through the custom dropdown', () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('#contact-topic') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const option = Array.from(compiled.querySelectorAll<HTMLElement>('.contact-topic-option'))
      .find((candidate) => candidate.textContent?.includes('ChatPDM')) as HTMLButtonElement;
    option.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.contactForm.controls.topic.value).toBe('ChatPDM');
    expect(trigger.textContent).toContain('ChatPDM');
    expect(compiled.textContent).toContain('Mention the concept boundary, refusal behavior, or drift risk.');
    expect(compiled.querySelector<HTMLTextAreaElement>('#contact-message')?.placeholder).toContain('ChatPDM concept boundary');
  });

  it('posts valid contact data and shows success state', async () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    fixture.componentInstance.contactForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      topic: 'Systems architecture',
      message: 'I would like to discuss a systems architecture project with clear boundaries.',
      website: ''
    });
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    const submissionId = fixture.componentInstance.currentSubmissionId;
    submitButton.click();

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/contact`);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Idempotency-Key')).toBe(submissionId);
    expect(request.request.body).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      topic: 'Systems architecture',
      message: 'I would like to discuss a systems architecture project with clear boundaries.',
      website: '',
      submissionId,
    });

    request.flush({
      ok: true,
      success: true,
      message: 'Message received.'
    });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Message sent.');
    expect(fixture.nativeElement.textContent).toContain('Return to contact form');
  });

  it('trims outer whitespace and keeps the idempotency key stable across an unchanged retry', async () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    fixture.componentInstance.contactForm.setValue({
      firstName: '  Ada ',
      lastName: ' Lovelace  ',
      email: ' ada@example.com ',
      topic: ' Systems architecture ',
      message: '  I would like to discuss a systems architecture project with clear boundaries.  ',
      website: '',
    });
    const submissionId = fixture.componentInstance.currentSubmissionId;

    void fixture.componentInstance.submit();
    const firstRequest = httpTesting.expectOne(`${environment.apiBaseUrl}/contact`);
    expect(firstRequest.request.headers.get('Idempotency-Key')).toBe(submissionId);
    expect(firstRequest.request.body).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      topic: 'Systems architecture',
      message: 'I would like to discuss a systems architecture project with clear boundaries.',
      website: '',
      submissionId,
    });
    firstRequest.flush(
      {
        ok: false,
        success: false,
        code: 'CONTACT_DELIVERY_FAILED',
        error: 'We could not deliver your message. Please try again later.',
      },
      { status: 502, statusText: 'Bad Gateway' },
    );
    await fixture.whenStable();

    void fixture.componentInstance.submit();
    const retryRequest = httpTesting.expectOne(`${environment.apiBaseUrl}/contact`);
    expect(retryRequest.request.headers.get('Idempotency-Key')).toBe(submissionId);
    retryRequest.flush(
      {
        ok: false,
        success: false,
        code: 'CONTACT_DELIVERY_FAILED',
        error: 'We could not deliver your message. Please try again later.',
      },
      { status: 502, statusText: 'Bad Gateway' },
    );
    await fixture.whenStable();

    fixture.componentInstance.contactForm.controls.firstName.setValue('Grace');
    expect(fixture.componentInstance.currentSubmissionId).not.toBe(submissionId);
  });

  it('shows a received state without encouraging resubmission after partial delivery', async () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    fixture.componentInstance.contactForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      topic: 'Systems architecture',
      message: 'I would like to discuss a systems architecture project with clear boundaries.',
      website: '',
    });

    void fixture.componentInstance.submit();
    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/contact`);
    request.flush(
      {
        ok: true,
        success: true,
        code: 'PARTIAL_DELIVERY',
        deliveryStatus: 'internal_delivered',
        internalDelivered: true,
        confirmationDelivered: false,
        message: 'Your message was received, but we could not send a confirmation email.',
      },
      { status: 202, statusText: 'Accepted' },
    );

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Message received.');
    expect(fixture.nativeElement.textContent).toContain('there is no need to submit it again');
    expect(fixture.nativeElement.textContent).not.toContain('Please try again');
    expect(fixture.nativeElement.querySelector('form.contact-form')).toBeFalsy();
  });

  it('shows a terminal pending state without encouraging resubmission after ambiguous delivery', async () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    fixture.componentInstance.contactForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      topic: 'Systems architecture',
      message: 'I would like to discuss a systems architecture project with clear boundaries.',
      website: '',
    });

    void fixture.componentInstance.submit();
    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/contact`);
    request.flush({
      ok: true,
      success: true,
      code: 'CONTACT_DELIVERY_UNKNOWN',
      deliveryStatus: 'unknown',
      internalDelivered: false,
      internalDeliveryUnknown: true,
      confirmationDelivered: false,
      message: 'Delivery status is uncertain. Please do not resend this message.',
    });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Delivery status pending.');
    expect(fixture.nativeElement.textContent).toContain('Please do not submit it again');
    expect(fixture.nativeElement.textContent).not.toContain('Please try again');
    expect(fixture.nativeElement.querySelector('form.contact-form')).toBeFalsy();
  });

  it('returns from the success panel to a fresh contact form without navigation', async () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    fixture.componentInstance.contactForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      topic: 'Systems architecture',
      message: 'I would like to discuss a systems architecture project with clear boundaries.',
      website: ''
    });
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.click();

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/contact`);
    request.flush({
      ok: true,
      success: true,
      message: 'Message received.'
    });

    await fixture.whenStable();
    fixture.detectChanges();

    const resetButton = fixture.nativeElement.querySelector('.contact-secondary-action') as HTMLButtonElement;
    resetButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Message sent.');
    expect(fixture.nativeElement.querySelector('form.contact-form')).toBeTruthy();
    expect(fixture.componentInstance.contactForm.controls.firstName.value).toBe('');
  });

  it('shows the loading state while a valid request is pending', () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    fixture.componentInstance.contactForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      topic: 'Product engineering',
      message: 'I would like to discuss a production engineering project with clear delivery scope.',
      website: ''
    });
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.click();
    fixture.detectChanges();

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/contact`);

    expect(submitButton.disabled).toBe(true);
    expect(submitButton.classList.contains('contact-submit--loading')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Sending...');
    const spinner = fixture.nativeElement.querySelector('mat-spinner.contact-submit__spinner');
    expect(spinner).toBeTruthy();
    expect(spinner.classList.contains('mat-mdc-progress-spinner')).toBe(true);
    expect(spinner.getAttribute('diameter')).toBe('24');
    expect(spinner.getAttribute('strokeWidth')).toBe('3');

    request.flush({
      ok: true,
      success: true,
      message: 'Message received.'
    });
  });

  it('maps backend validation errors into the custom field errors', async () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    fixture.componentInstance.contactForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      topic: 'Systems architecture',
      message: 'I would like to discuss a systems architecture project with clear boundaries.',
      website: ''
    });
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.click();

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/contact`);
    request.flush({
      ok: false,
      success: false,
      code: 'VALIDATION_FAILED',
      error: 'Validation failed.',
      errors: {
        email: 'Enter a valid email address.',
        form: 'Please check the highlighted fields.'
      }
    }, {
      status: 400,
      statusText: 'Bad Request'
    });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Enter a valid email address.');
    expect(fixture.nativeElement.textContent).toContain('Please check the highlighted fields.');
  });

  it('shows a restrained rate-limit failure message', async () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    fixture.componentInstance.contactForm.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      topic: 'Collaboration',
      message: 'I would like to discuss a collaboration with enough context for a useful reply.',
      website: ''
    });
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.click();

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/contact`);
    request.flush({
      success: false,
      code: 'RATE_LIMITED',
      message: 'Too many contact messages. Please try again later.'
    }, {
      status: 429,
      statusText: 'Too Many Requests'
    });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Too many messages sent. Please try again later.');
  });
});
