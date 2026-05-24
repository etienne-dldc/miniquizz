import type { Element, Node } from "@dldc/tsx-doc/jsx";

export const ALL_FONT_WEIGHTS = ["thin", "extraLight", "light", "normal", "medium", "semibold", "bold", "extraBold", "black"] as const;
export const ALL_TEXT_DECORATIONS = ["underline", "overline", "lineThrough"] as const;
export const ALL_FONT_FAMILIES = ["sans", "serif", "mono"] as const;
export const ALL_FONT_STYLES = ["italic", "normal"] as const;

export type FontWeight = (typeof ALL_FONT_WEIGHTS)[number];
export type TextDecoration = (typeof ALL_TEXT_DECORATIONS)[number];
export type FontFamily = (typeof ALL_FONT_FAMILIES)[number];
export type FontStyle = (typeof ALL_FONT_STYLES)[number];

export type ConfigProps = { name: string; description: string; ratio: number };
export declare function Config(props: ConfigProps): Element;
export type StepProps = { children: Node };
export declare function Step(props: StepProps): Element;
export type TextProps = {
  children: Node;
  size?: number;
  centered?: boolean;
  fontWeight?: FontWeight;
  textDecoration?: TextDecoration;
  fontFamily?: FontFamily;
  fontStyle?: FontStyle;
};
export declare function Text(props: TextProps): Element;
export type CodeProps = { children: Node; size?: number; wrapSize?: number; language?: string };
export declare function Code(props: CodeProps): Element;
export type ImageProps = { src: string; alt: string; size?: number };
export declare function Image(props: ImageProps): Element;
export type QuizzOptionProps = { children: Node; value: string; isCorrect?: boolean };
export declare function QuizzOption(props: QuizzOptionProps): Element;
export type GridProps = { children: Node; columns?: string; rows?: string; gap?: number };
export declare function Grid(props: GridProps): Element;
export type BoxProps = { children: Node; gap?: number };
export declare function Box(props: BoxProps): Element;
export type AppearProps = { children: Node; offset?: number };
export declare function Appear(props: AppearProps): Element;
export type SpanProps = {
  children: Node;
  fontWeight?: FontWeight;
  textDecoration?: TextDecoration;
  fontFamily?: FontFamily;
  fontStyle?: FontStyle;
};
export declare function Span(props: SpanProps): Element;
export type LinkProps = { children: Node; href: string; openInNewTab?: boolean };
export declare function Link(props: LinkProps): Element;
export declare function Br(): Element;
