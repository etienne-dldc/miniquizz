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

<Step>
  <Grid rows="1fr 1fr">
    <Box>
      <Text size={1}>What will this TypeScript function return for n = 4?</Text>
      <Code size={1}>
        {"function sumTo(n: number): number {\n  let sum = 0;\n  for (let i = 1; i <= n; i++) sum += i;\n  return sum;\n}"}
      </Code>
    </Box>
    <Grid rows="1fr" columns="1fr 1fr 1fr">
      <QuizzOption value="option1">
        <Code>6</Code>
      </QuizzOption>
      <QuizzOption value="option2" isCorrect>
        <Code>10</Code>
      </QuizzOption>
      <QuizzOption value="option3">
        <Code>16</Code>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1.5fr 1fr">
    <Box>
      <Text size={1}>Identify the logo shown in the image.</Text>
      <Image src="/data/deno-logo.svg" alt="A circle logo with a dinosaur silhouette" size={6} />
    </Box>
    <Grid rows="1fr" columns="1fr 1fr 1fr">
      <QuizzOption value="option1">
        <Text>Node.js</Text>
      </QuizzOption>
      <QuizzOption value="option2" isCorrect>
        <Text>Deno</Text>
      </QuizzOption>
      <QuizzOption value="option3">
        <Text>Bun</Text>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Text size={2.5}>Select all valid HTTP methods from the list below.</Text>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1" isCorrect>
        <Text>GET</Text>
      </QuizzOption>
      <QuizzOption value="option2" isCorrect>
        <Text>POST</Text>
      </QuizzOption>
      <QuizzOption value="option3">
        <Text>FETCH</Text>
      </QuizzOption>
      <QuizzOption value="option4">
        <Text>UPDATE</Text>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Text>Pick the expression that creates an array with values 1, 2, 3 in JavaScript.</Text>
    </Box>
    <Grid rows="1fr" columns="1fr 1fr 1fr">
      <QuizzOption value="option1" isCorrect>
        <Code>[1, 2, 3]</Code>
      </QuizzOption>
      <QuizzOption value="option2">
        <Code>{"{1, 2, 3}"}</Code>
      </QuizzOption>
      <QuizzOption value="option3">
        <Code>(1, 2, 3)</Code>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;
