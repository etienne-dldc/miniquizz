// deno-lint-ignore-file no-import-prefix
import {
  Box,
  Code,
  Config,
  Grid,
  Image,
  Leaderboard,
  QuizzOption,
  Step,
  Text,
} from "https://raw.githubusercontent.com/etienne-dldc/miniquizz/230049bfb906da8134fea0cbcd5046f04c65eaae/logic/tsx.ts";

<Config
  name="Quiz de couverture du schema"
  description="Jeu de donnees de test couvrant toutes les variantes de blocs de contenu de quizzSchema et plusieurs formats de reponse."
  ratio={1.5}
/>;

<Step>
  <Box>
    <Text size={2}>Hello !</Text>
  </Box>
</Step>;

<Step>
  <Grid rows="1fr 2fr">
    <Box>
      <Text size={2}>Que signifie HTML ?</Text>
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
      <Text size={1.5}>Quelles valeurs JavaScript sont falsy ?</Text>
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
      <Text size={1}>Que retourne cette fonction TypeScript pour n = 4 ?</Text>
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
      <Text size={1}>Identifiez le logo affiche dans l'image.</Text>
      <Image src="/data/deno-logo.svg" alt="Un logo circulaire avec une silhouette de dinosaure" size={6} />
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
      <Text size={1.5}>Selectionnez toutes les methodes HTTP valides dans la liste ci-dessous.</Text>
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
      <Text>Choisissez l'expression qui cree un tableau contenant les valeurs 1, 2, 3 en JavaScript.</Text>
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

<Leaderboard />;
