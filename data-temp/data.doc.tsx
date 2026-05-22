import type { Element, Node } from "@dldc/tsx-doc/jsx";

export declare function Config(props: { name: string; description: string; ratio: number }): Element;
export declare function Step(props: { children: Node }): Element;
export declare function Text(props: { children: Node; size?: number; centered?: boolean }): Element;
export declare function Code(props: { children: Node; size?: number; wrapSize?: number }): Element;
export declare function Image(props: { src: string; alt: string; size?: number }): Element;
export declare function QuizzOption(props: { children: Node; value: string; isCorrect?: boolean }): Element;
export declare function Grid(props: { children: Node; columns?: string; rows?: string; gap?: number }): Element;
export declare function Box(props: { children: Node }): Element;

<Config
  name="JS Hard Mode"
  description="C'est simple, il n'y a que des pieges"
  ratio={1.5}
/>;

<Step>
  <Text size={2} centered>Bienvenue dans le mode difficile de JS Quiz !</Text>
  <Text size={1.5} centered>
    Ici, pas de questions faciles, que des pieges pour tester votre connaissance du langage JavaScript !
  </Text>
  <Text size={1.5} centered>Bonne chance !</Text>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Code size={4}>NaN == NaN</Code>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1">
        <Text size={1.5}>
          SyntaxError c'est `Nan` pas `NaN`
        </Text>
      </QuizzOption>
      <QuizzOption value="option2" isCorrect>
        <Text>`false`</Text>
      </QuizzOption>
      <QuizzOption value="option3">
        <Text>`true`</Text>
      </QuizzOption>
      <QuizzOption value="option4">
        <Text>`true` mais `false` avec `===`</Text>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Text>Cette syntax est-elle valide:</Text>
      <Code>{"({_:[{},{}]}) => {}"}</Code>
    </Box>
    <Grid rows="1fr" columns="1fr 1fr">
      <QuizzOption value="option1" isCorrect>
        <Text>True</Text>
      </QuizzOption>
      <QuizzOption value="option2">
        <Text>False</Text>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Code>typeof null</Code>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1">
        <Text>null</Text>
      </QuizzOption>
      <QuizzOption value="option2">
        <Code>"null"</Code>
      </QuizzOption>
      <QuizzOption value="option3" isCorrect>
        <Code>"object"</Code>
      </QuizzOption>
      <QuizzOption value="option4">
        <Text>ReferenceError</Text>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Code>(0.1 + 0.2) === 0.3</Code>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1">
        <Text>true</Text>
      </QuizzOption>
      <QuizzOption value="option2">
        <Text>`false` mais `true` avec `===`</Text>
      </QuizzOption>
      <QuizzOption value="option3" isCorrect>
        <Text>false car IEEE 754</Text>
      </QuizzOption>
      <QuizzOption value="option4">
        <Text>false car RFC 791</Text>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Text>Que vaut la variable x apres :</Text>
      <Code>const x = (1, 2, 3);</Code>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1">
        <Text>SyntaxError</Text>
      </QuizzOption>
      <QuizzOption value="option2">
        <Text>1</Text>
      </QuizzOption>
      <QuizzOption value="option3" isCorrect>
        <Text>3</Text>
      </QuizzOption>
      <QuizzOption value="option4">
        <Code>[1, 2, 3]</Code>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Text>Que vaut la variable `r` ?</Text>
      <Code size={1}>
        {`const d = new Date('2026-05-27');`}
        {`const r = [d.getDay(), d.getDate(), d.getMonth()];`}
      </Code>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1">
        <Code size={1.2}>[27, '05/27/2026', 5]</Code>
      </QuizzOption>
      <QuizzOption value="option2" isCorrect>
        <Code size={1.2}>[3, 27, 4]</Code>
      </QuizzOption>
      <QuizzOption value="option3">
        <Code size={1.2}>[3, 27, 5]</Code>
      </QuizzOption>
      <QuizzOption value="option4">
        <Code size={1.2}>['wednesday', 27, 4]</Code>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Text>Que signifie l'acronyme `IIFE` ?</Text>
    </Box>
    <Grid rows="1fr 1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1">
        <Text size={1.5}>Internal Interface For Elements</Text>
      </QuizzOption>
      <QuizzOption value="option2">
        <Text size={1.5}>Integrated Intel Flash Environment</Text>
      </QuizzOption>
      <QuizzOption value="option3">
        <Text size={1.5}>Inherited Interface Functional Extension</Text>
      </QuizzOption>
      <QuizzOption value="option4" isCorrect>
        <Text size={1.5}>Immediately Invoked Function Expression</Text>
      </QuizzOption>
      <QuizzOption value="option5">
        <Text size={1.5}>Inter-Internet Frame Exchange</Text>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Text>A quoi ressemble un IIFE ?</Text>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1">
        <Code>{"() => (() => ({}))"}</Code>
      </QuizzOption>
      <QuizzOption value="option2">
        <Code>{"({} = {}) => ()"}</Code>
      </QuizzOption>
      <QuizzOption value="option3">
        <Code>{"() => () => {}"}</Code>
      </QuizzOption>
      <QuizzOption value="option4" isCorrect>
        <Code>{"(() => {})()"}</Code>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Code>{"3 < 2 < 1"}</Code>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1" isCorrect>
        <Text>true</Text>
      </QuizzOption>
      <QuizzOption value="option2">
        <Text>false</Text>
      </QuizzOption>
      <QuizzOption value="option3">
        <Text>SyntaxError</Text>
      </QuizzOption>
      <QuizzOption value="option4">
        <Text>reponse d</Text>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Text>Que retourne la function suivante ?</Text>
      <Code>{"() => void {}"}</Code>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1">
        <Text>SyntaxError</Text>
      </QuizzOption>
      <QuizzOption value="option2" isCorrect>
        <Text>undefined</Text>
      </QuizzOption>
      <QuizzOption value="option3">
        <Code>{"{}"}</Code>
      </QuizzOption>
      <QuizzOption value="option4">
        <Text>reponse d</Text>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Code>Number.MAX_VALUE + 1000000</Code>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1">
        <Text>Error</Text>
      </QuizzOption>
      <QuizzOption value="option2" isCorrect>
        <Code>Number.MAX_VALUE</Code>
      </QuizzOption>
      <QuizzOption value="option3">
        <Text>Infinity</Text>
      </QuizzOption>
      <QuizzOption value="option4">
        <Text>reponse d</Text>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Text size={1.5}>Quel est le resultat de cette expression ?</Text>
      <Code size={0.6} wrapSize={80}>
        {"(!![]+[])[+!+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(+(!+[]+!+[]+[+!+[]]+[+!+[]]))[(!![]+[])[+[]]+(!![]+[][(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+([]+[])[([][(![]+[])[+!+[]]+(!![]+[])[+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[][(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+([][[]]+[])[+!+[]]+(![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[+!+[]]+([][[]]+[])[+[]]+([][(![]+[])[+!+[]]+(!![]+[])[+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[][(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+(!![]+[])[+!+[]]][([][[]]+[])[+!+[]]+(![]+[])[+!+[]]+((+[])[([][(![]+[])[+!+[]]+(!![]+[])[+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[][(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+([][[]]+[])[+!+[]]+(![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[+!+[]]+([][[]]+[])[+[]]+([][(![]+[])[+!+[]]+(!![]+[])[+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[][(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+(!![]+[])[+!+[]]]+[])[+!+[]+[+!+[]]]+(!![]+[])[!+[]+!+[]+!+[]]]](!+[]+!+[]+!+[]+[+!+[]])[+!+[]]+(!![]+[][(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+[]]]+([][[]]+[])[+!+[]]+(![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(+[![]]+[][(![]+[])[+!+[]]+(!![]+[])[+[]]])[+!+[]+[+!+[]]]+([][[]]+[])[!+[]+!+[]]"}
      </Code>
    </Box>
    <Grid rows="1fr 1fr" columns="1fr 1fr">
      <QuizzOption value="option1">
        <Text>42</Text>
      </QuizzOption>
      <QuizzOption value="option2">
        <Text>SyntaxError</Text>
      </QuizzOption>
      <QuizzOption value="option3">
        <Text>Infinite loop</Text>
      </QuizzOption>
      <QuizzOption value="option4" isCorrect>
        <Text>reponse d</Text>
      </QuizzOption>
    </Grid>
  </Grid>
</Step>;
