# Miniquizz

Minimal multiplayer quiz app built with Deno and HTMX.

Miniquizz serves a live quiz from a folder on disk. The quiz content lives in a `data.doc.tsx` file plus optional static assets exposed
under `/data/*`.

## What it does

- participants join from the home page with a display name
- the admin controls the quiz from `/admin`
- questions and results update live through SSE
- the quiz document is watched on disk and reloaded automatically when `data.doc.tsx` changes

## Requirements

- Deno 2
- one folder containing a quiz document named `data.doc.tsx`
- `ADMIN_PASSWORD`, `DATA_FOLDER_PATH`, and `STORAGE_FOLDER_PATH` environment variables

## Local development

Use the sample data shipped in this repository:

```sh
cp -R ./data ./data.local
cat > .env <<'EOF'
ADMIN_PASSWORD=changeme
DATA_FOLDER_PATH=./data.local
STORAGE_FOLDER_PATH=./storage
EOF
deno task dev
```

The app starts on `http://localhost:3008` by default.

Open:

- `/` to join as a participant
- `/admin` to log in with `ADMIN_PASSWORD`

Notes:

- `DATA_FOLDER_PATH` must point to a directory containing `data.doc.tsx`
- files inside `<data-folder>/public` are served at `/data/*`
- state and sessions are persisted under `STORAGE_FOLDER_PATH`

## Quiz content format

The quiz folder typically looks like this:

```text
my-quizz/
	data.doc.tsx
	public/
		image.png
		qrcode.svg
```

`data.doc.tsx` is a TSX document parsed by Miniquizz. At minimum it needs:

- one `<Config />`
- one or more `<Step>` slides
- optionally one `<Leaderboard />` slide

The sample in [data/data.doc.tsx](/Users/etienne/Workspace/github.com/etienne-dldc/miniquizz/data/data.doc.tsx) is the best starting point.

## Run another quiz locally

Point the app at any quiz folder:

```sh
ADMIN_PASSWORD=changeme \
DATA_FOLDER_PATH=../some-quiz-folder \
STORAGE_FOLDER_PATH=./storage \
deno task dev
```

## Docker image

The Docker image expects the same environment variables and mounts:

```sh
docker run --rm -p 3008:3008 \
	-e ADMIN_PASSWORD=changeme \
	-e DATA_FOLDER_PATH=/app/data \
	-e STORAGE_FOLDER_PATH=/app/storage \
	-v "$PWD/data":/app/data \
	-v "$PWD/storage":/app/storage \
	ghcr.io/etienne-dldc/miniquizz:0.13.4
```

## Useful commands

```sh
deno task dev
deno task check
deno task test:run
```
