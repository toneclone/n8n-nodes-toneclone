# ToneClone n8n Node – Follow-up Checklist

- [ ] Configure repository defaults on GitHub: add description, topics, branch protection, and MIT license notice.
- [ ] Review `.gitignore` and ensure build artefacts (`dist/`) are committed while local-only files stay ignored.
- [ ] Run `npx @n8n/scan-community-package n8n-nodes-toneclone` and address any findings.
- [ ] Update `src/client-info.ts` + `package.json` if you bump the version before publishing.
- [ ] Publish the package to npm (`npm publish --access public`) once verification checklist is satisfied.
- [ ] Submit the package for n8n community node verification via https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/.
- [ ] Link the new public repo from internal docs/mono-repo so the team knows where to contribute fixes.
- [ ] Set up CI (lint/test/build) for this repo if desired.
