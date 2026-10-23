import { CardAction } from './CardAction';
import { CardContent } from './CardContent';
import { CardDescription } from './CardDescription';
import { CardFooter } from './CardFooter';
import { CardHeader } from './CardHeader';
import { CardPanel } from './CardPanel';
import { CardTitle } from './CardTitle';

const Card = Object.assign(CardPanel, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Action: CardAction,
  Content: CardContent,
  Footer: CardFooter,
});

export { Card };
export type { CardPanelProps as CardProps } from './CardPanel';
export type { CardHeaderProps } from './CardHeader';
export type { CardTitleProps } from './CardTitle';
export type { CardDescriptionProps } from './CardDescription';
export type { CardActionProps } from './CardAction';
export type { CardContentProps } from './CardContent';
export type { CardFooterProps } from './CardFooter';
