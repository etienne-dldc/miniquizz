import { Element, Node } from "@dldc/tsx-doc/jsx";

export declare function Config(props: { name: string; description: string; ratio: number }): Element;
export declare function Step(props: { children: Node }): Element;
export declare function Text(props: { children: Node; size?: number; centered?: boolean }): Element;
export declare function Code(props: { children: Node; size?: number; wrapSize?: number }): Element;
export declare function Image(props: { src: string; alt: string; size?: number }): Element;
export declare function QuizzOption(props: { children: Node; value: string; isCorrect?: boolean }): Element;
export declare function Grid(props: { children: Node; columns?: string; rows?: string; gap?: number }): Element;
export declare function Box(props: { children: Node }): Element;

<Config
  name="Schema Coverage Quiz"
  description="Test dataset covering all quizzSchema content block variants and multiple answer patterns."
  ratio={1.5}
/>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Text size={2}>What does HTML stand for?</Text>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1">
        <Text>HighText Machine Language</Text>
      </QuizzOption>
      <QuizzOption value="option2" isCorrect>
        <Text>HyperText Markup Language</Text>
      </QuizzOption>
      <QuizzOption value="option3">
        <Text>Hyperlinks and Text Markup Language</Text>
      </QuizzOption>
      <QuizzOption value="option4">
        <Text>Home Tool Markup Language</Text>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Text size={1.5}>Which JavaScript values are falsy?</Text>
      <Code size={1.5}>
        {"if (value) { /* truthy */ }"}
      </Code>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1" isCorrect>
        <Code>0</Code>
      </QuizzOption>
      <QuizzOption value="option2" isCorrect>
        <Code>""</Code>
      </QuizzOption>
      <QuizzOption value="option3">
        <Code>[]</Code>
      </QuizzOption>
      <QuizzOption value="option4">
        <Code>"0"</Code>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;
