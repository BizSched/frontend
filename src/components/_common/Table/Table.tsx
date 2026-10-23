import { TableBody } from './TableBody';
import { TableCaption } from './TableCaption';
import { TableCell } from './TableCell';
import { TableFooter } from './TableFooter';
import { TableHead } from './TableHead';
import { TableHeader } from './TableHeader';
import { TableRoot } from './TableRoot';
import { TableRow } from './TableRow';

const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Caption: TableCaption,
});

export { Table };
export type { TableRootProps as TableProps } from './TableRoot';
export type { TableHeaderProps } from './TableHeader';
export type { TableBodyProps } from './TableBody';
export type { TableFooterProps } from './TableFooter';
export type { TableHeadProps } from './TableHead';
export type { TableCellProps } from './TableCell';
export type { TableCaptionProps } from './TableCaption';
