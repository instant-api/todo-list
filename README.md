# Instant Todo List API

> A CLI to create a small Todo List API

This package let you quickly create a small JSON API to list / add / update and delete Todos.
It uses a single JSON file to store data.

## Why ?

The aim of this package is to provide an API for front-end exercices, allowing student to use an API without having to setup one themself.

## Who made this ?

Hi ! I'm Etienne, you can [follow me on Twitter](https://dldc.dev/twitter) 😉

## Usage

```bash
npx @instant-api/todo-list
```

## Options

- `--port` or `-p`: The port to use
- `--file` or `-f`: The path to the json file used to store data.
- `--help` or `-h`: The path to the json file used to store data.
- `--slow` or `-s`: Add a random delay to every request

**Note**: By default the `file` is set to `todo-list-db.json`.

```bash
npx @instant-api/todo-list --port 9000 --file todo.json
```

If you provide an argument with no name is will be used as the `file argument`

```bash
npx @instant-api/todo-list todo.json
```
