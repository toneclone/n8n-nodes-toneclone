# ToneClone for n8n

ToneClone for n8n is an [n8n](https://n8n.io/) community node that lets you generate and train ToneClone personas directly from your workflows. Use it to keep AI-generated content on-brand, capture new training material, and orchestrate ToneClone alongside the rest of your automation stack.

- **Generate persona content:** Ask a trained persona to draft emails, posts, documents, and more.
- **Submit new training data:** Upload plain text or binary files (PDF, DOCX, TXT, etc.) to improve a persona.
- **Work with knowledge cards:** Pull structured knowledge into your generations so responses stay accurate.

This repository contains the full source, tests, and packaging assets for the `n8n-nodes-toneclone` npm package.

## Installation

1. Launch your self-hosted n8n instance (v1.38.0 or later recommended).
2. Open *Settings → Community Nodes* in the editor UI.
3. Add the package name `n8n-nodes-toneclone` and confirm the warning prompt.
4. After installation, search for **ToneClone** in the node palette.

Alternatively, install via the CLI:

```bash
npm install n8n-nodes-toneclone
```

## Credentials

The node uses a single credential type: **ToneClone API**.

1. Sign in to [ToneClone](https://toneclone.ai) and generate an API key from *Settings → Developer*.
2. In n8n, open *Credentials → New → ToneClone API*.
3. Paste your API key (`tc_…`) and leave the API URL set to `https://api.toneclone.ai` unless you are targeting a private environment.
4. Click *Test* to verify connectivity.

> Built-in personas are read-only. Upload operations require a persona that you or your team owns.

## Operations

### Write with your persona (`resource = query`)

- **Generate Content:** Produce text from a persona using an input prompt.
  - *Persona* – Select or reference a persona ID.
  - *Prompt* – Instruction or question for ToneClone.
  - *Knowledge Card IDs* (optional) – Enrich the response with structured knowledge.
  - *Additional Options* (optional) – Control formality, reading level, and target length.

### Training (`resource = training`)

- **Upload Text:** Provide raw text that will be converted to a `.txt` file and attached to a persona.
  - *Persona* – Target persona to train.
  - *Content* – Text body.
  - *Filename* – Saved as `<filename>.txt` if no extension is provided.

- **Upload File:** Attach an existing binary file from the workflow input.
  - *Persona* – Target persona to train.
  - *Input Binary Field* – Name of the binary property holding the file.

## Usage

### Generate a follow-up email

1. Start with a **HTTP Request** or **Trigger** node that captures meeting details.
2. Add **ToneClone → Generate Content**, select a persona, and map the meeting summary into the *Prompt*.
3. Optional: attach a knowledge card containing your product messaging.
4. Use the response in downstream steps (e.g., send via Gmail or Slack).

### Upload customer transcripts for training

1. Fetch or receive a transcript file, ensuring it is stored in the `data` binary property.
2. Add **ToneClone → Upload File**, choose the persona, and set *Input Binary Field* to `data`.
3. ToneClone stores the file, associates it with the persona, and returns the resulting file metadata.

## Compatibility

- Requires n8n **1.38.0+** (tested on 1.38.x and 1.39.x).
- Node is written in TypeScript and compiled to JavaScript during the `npm publish` process.
- Uses only the built-in `n8n-workflow` peer dependency—no runtime dependencies are bundled.

## Development

```bash
# Install dependencies
yarn install  # or npm install

# Lint and test
npm run lint
npm test

# Build distributable assets
npm run build
```

Run the helper script `./test-n8n.sh` to spin up a local n8n instance with the compiled node mounted at runtime.

## Resources

- [ToneClone Documentation](https://docs.toneclone.ai/)
- [ToneClone API Authentication](https://docs.toneclone.ai/api/authentication)
- [n8n Community Nodes Guide](https://docs.n8n.io/integrations/#community-nodes)

## Version History

- **0.1.0** – Initial public release of the ToneClone community node.

## License

MIT © ToneClone
