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

    expect(screen.getByText('입력한 매출')).toBeInTheDocument();
    expect(screen.getByText('입력한 매출').tagName).toBe('H2');
    expect(screen.getByRole('button', { name: '더보기' })).toBeInTheDocument();
    expect(screen.getByText('최근 8일')).toBeInTheDocument();
    expect(screen.getByText('테이블')).toBeInTheDocument();
    expect(screen.getByText('합계')).toBeInTheDocument();
  });

  it('variant 클래스를 적용한다', () => {
    render(
      <>
        <Card
          data-testid="card"
          radius="xl"
          padding="employee"
          tone="highlight"
          interactive
        />
        <Card data-testid="default-card" interactive />
        <Card data-testid="large-radius-card" radius="2xl" />
      </>,
    );

    expect(screen.getByTestId('card')).toHaveClass(
      'rounded-[28px]',
      'px-[38px]',
      'pt-7',
      'pb-8',
      'bg-primary-100',
      'transition-shadow',
      'hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]',
    );
    expect(screen.getByTestId('default-card')).toHaveClass('bg-white-50');
    expect(screen.getByTestId('default-card')).toHaveClass(
      'hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]',
    );
    expect(screen.getByTestId('default-card')).not.toHaveClass(
      'hover:bg-white-50',
    );
    expect(screen.getByTestId('large-radius-card')).toHaveClass(
      'rounded-[32px]',
    );
  });

  it('asChild로 카드와 제목의 요소를 바꾸고 속성을 병합한다', () => {
    render(
      <main>
        <Card asChild interactive className="mt-6">
          <a href="/sales" className="block">
            <Card.Title asChild className="text-lg">
              <h3>매출 현황</h3>
            </Card.Title>
          </a>
        </Card>
      </main>,
    );

    const link = screen.getByRole('link', { name: '매출 현황' });
    const title = screen.getByRole('heading', {
      name: '매출 현황',
      level: 3,
    });

    expect(link).toHaveAttribute('href', '/sales');
    expect(link.parentElement?.tagName).toBe('MAIN');
    expect(link).toHaveAttribute('data-slot', 'card');
    expect(link).toHaveClass('block', 'mt-6', 'bg-white-50');
    expect(link).toHaveClass('focus-visible:ring-2');
    link.focus();
    expect(link).toHaveFocus();
    expect(title).toHaveAttribute('data-slot', 'card-title');
    expect(title).toHaveClass('font-semibold', 'text-lg');
    expect(title).not.toHaveClass('text-xl');
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('호출부 className을 병합한다', () => {
    render(<Card data-testid="card" className="mt-6 p-0" />);

    expect(screen.getByTestId('card')).toHaveClass('mt-6', 'p-0');
    expect(screen.getByTestId('card')).not.toHaveClass('p-6');
  });

  it('compound 슬롯의 className을 기본 클래스와 병합한다', () => {
    render(
      <Card>
        <Card.Header data-testid="header" className="gap-2">
          <Card.Title data-testid="title" className="text-lg">
            제목
          </Card.Title>
          <Card.Description data-testid="description" className="text-xs">
            설명
          </Card.Description>
          <Card.Action data-testid="action" className="gap-4">
            액션
          </Card.Action>
        </Card.Header>
        <Card.Content data-testid="content" className="flex-row">
          본문
        </Card.Content>
        <Card.Footer data-testid="footer" className="gap-2">
          하단
        </Card.Footer>
      </Card>,
    );

    expect(screen.getByTestId('header')).toHaveClass('flex', 'gap-2');
    expect(screen.getByTestId('header')).not.toHaveClass('gap-4');
    expect(screen.getByTestId('title')).toHaveClass('font-semibold', 'text-lg');
    expect(screen.getByTestId('title')).not.toHaveClass('text-xl');
    expect(screen.getByTestId('description')).toHaveClass(
      'font-medium',
      'text-xs',
    );
    expect(screen.getByTestId('description')).not.toHaveClass('text-sm');
    expect(screen.getByTestId('action')).toHaveClass('shrink-0', 'gap-4');
    expect(screen.getByTestId('action')).not.toHaveClass('gap-2');
    expect(screen.getByTestId('content')).toHaveClass('flex', 'flex-row');
    expect(screen.getByTestId('content')).not.toHaveClass('flex-col');
    expect(screen.getByTestId('footer')).toHaveClass('items-center', 'gap-2');
    expect(screen.getByTestId('footer')).not.toHaveClass('gap-4');
  });
});
