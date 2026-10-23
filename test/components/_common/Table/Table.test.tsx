import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Table } from '@components/_common/Table/Table';

afterEach(cleanup);

describe('Table', () => {
  it('접근 가능한 표 구조와 HTML 속성을 전달한다', () => {
    render(
      <Table aria-label="최근 매출" className="text-base">
        <Table.Header>
          <Table.Row>
            <Table.Head scope="col">날짜</Table.Head>
            <Table.Head scope="col">합계</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>9월 11일</Table.Cell>
            <Table.Cell className="text-right">₩756,300</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );

    const table = screen.getByRole('table', { name: '최근 매출' });

    expect(table).toHaveClass('text-base');
    expect(table).not.toHaveClass('text-sm');
    expect(table.parentElement).toHaveClass('overflow-x-auto');
    expect(
      within(table).getByRole('columnheader', { name: '날짜' }),
    ).toHaveAttribute('scope', 'col');
    expect(within(table).getByRole('cell', { name: '₩756,300' })).toHaveClass(
      'text-right',
    );
  });
});
