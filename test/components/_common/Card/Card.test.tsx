import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Card } from '@components/_common/Card/Card';

afterEach(cleanup);

describe('Card', () => {
  it('compound 슬롯을 렌더한다', () => {
    render(
      <Card>
        <Card.Header>
          <Card.Title>입력한 매출</Card.Title>
          <Card.Action>
            <button type="button">더보기</button>
          </Card.Action>
        </Card.Header>
        <Card.Description>최근 8일</Card.Description>
        <Card.Content>테이블</Card.Content>
        <Card.Footer>합계</Card.Footer>
      </Card>,
    );

    const title = screen.getByRole('heading', { level: 2, name: '입력한 매출' });
    expect(title).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '더보기' })).toBeInTheDocument();
    expect(screen.getByText('최근 8일')).toBeInTheDocument();
    expect(screen.getByText('테이블')).toBeInTheDocument();
    expect(screen.getByText('합계')).toBeInTheDocument();
  });

  it('variant 클래스를 적용한다', () => {
    render(
      <Card
        data-testid="card"
        radius="xl"
        padding="employee"
        tone="highlight"
        interactive
      />,
    );

    expect(screen.getByTestId('card')).toHaveClass(
      'rounded-[28px]',
      'px-[38px]',
      'pt-7',
      'pb-8',
      'bg-primary-100',
      'transition-colors',
    );
  });

  it('호출부 className을 병합한다', () => {
    render(<Card data-testid="card" className="mt-6 p-0" />);

    expect(screen.getByTestId('card')).toHaveClass('mt-6', 'p-0');
  });
});
