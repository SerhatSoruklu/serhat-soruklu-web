import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { siX } from 'simple-icons';

interface OrderFact {
  label: string;
  value: string;
}

interface OrderPrinciple {
  title: string;
  description: string;
}

interface OrderResponsibility {
  title: string;
  description: string;
}

@Component({
  selector: 'app-soruklu-order',
  imports: [RouterLink],
  templateUrl: './soruklu-order.component.html',
  styleUrl: './soruklu-order.component.css',
})
export class SorukluOrderComponent {
  readonly emblemPath = '/assets/brand/soruklu-order/the-soruklu-order-emblem.png';
  readonly officialXUrl = 'https://x.com/sorukluorder';
  readonly xIconPath = siX.path;

  readonly facts: readonly OrderFact[] = [
    { label: 'Established', value: '2025' },
    { label: 'Purpose', value: 'Family stewardship and continuity' },
    { label: 'Participation', value: 'Small, voluntary, and consent-based' },
    { label: 'Coordinated by', value: 'Serhat Soruklu' },
  ];

  readonly activities: readonly string[] = [
    'Preserve authorised family photographs, documents, history, and contextual records',
    'Maintain useful continuity information with the consent of the people involved',
    'Encourage practical support during personal and family difficulties',
    'Document voluntary responsibilities and important shared decisions',
    'Preserve agreed principles and context for future generations',
    'Encourage lawful, responsible, and evidence-based conduct',
  ];

  readonly principles: readonly OrderPrinciple[] = [
    {
      title: 'Discipline',
      description: 'Choose deliberate action over impulse and honour reasonable commitments.',
    },
    {
      title: 'Compassion',
      description: 'Respond to difficulty with humanity while maintaining healthy boundaries.',
    },
    {
      title: 'Responsibility',
      description: 'Accept ownership for decisions, obligations, and consequences.',
    },
    {
      title: 'Truth',
      description: 'Prefer evidence, accuracy, correction, and intellectual honesty.',
    },
    {
      title: 'Self-restraint',
      description: 'Develop judgement, patience, and control over one’s own conduct.',
    },
    {
      title: 'Lawful conduct',
      description:
        'Respect the law, due process, individual rights, and legitimate public institutions.',
    },
    {
      title: 'Continuity',
      description: 'Preserve useful knowledge without treating ancestry as entitlement.',
    },
    {
      title: 'Mutual support',
      description:
        'Offer practical help without excusing harmful, reckless, or unlawful behaviour.',
    },
  ];

  readonly responsibilities: readonly OrderResponsibility[] = [
    {
      title: 'Project coordinator',
      description:
        'Maintains the purpose of the initiative, its authorised materials, and its public boundaries.',
    },
    {
      title: 'Family adviser',
      description: 'Offers family context and non-binding advice when participants request it.',
    },
    {
      title: 'Safeguarding contact',
      description:
        'Encourages appropriate safeguarding action and referral to qualified independent services.',
    },
    {
      title: 'Records custodian',
      description: 'Preserves authorised records and their context with appropriate consent.',
    },
  ];
}
