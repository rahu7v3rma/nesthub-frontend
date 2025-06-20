# Nesthub-frontend

Start a project

```bash
$ cd site
$ yarn
$ yarn dev
```

## Backend mocks

An OpenAPI specification is available in the `openapi` folder. A package manifest is also available to enable running a mock server easily which can be used for connecting APIs without an active backend.

To start the mock server, install dependencies in that folder and start it:

```bash
$ cd openapi
$ npm install
$ npm start
```

You can also start the mock server yourself if you wish to change execution flags:

```bash
$ npx prism mock -p 8000 ./spec.yaml
```

Available endpoints may change in the future. Check out the list of them when the mock server is started.
