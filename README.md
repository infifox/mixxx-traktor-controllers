# mixxx-traktor-controllers

[![CI](https://github.com/infifox/mixxx-traktor-controllers/workflows/CI/badge.svg)](https://github.com/infifox/mixxx-traktor-controllers/actions)
[![Release](https://github.com/infifox/mixxx-traktor-controllers/workflows/Build%20and%20Release/badge.svg)](https://github.com/infifox/mixxx-traktor-controllers/actions)

A Mixxx controller mapping for the Native Instruments Traktor Kontrol Z1 MK2.

## Installation

### From Releases (Recommended)

1. Go to the [Releases page](https://github.com/infifox/mixxx-traktor-controllers/releases)
2. Download the latest `infinifox-mixxx-traktor-controller-mappings.zip`
3. Extract the contents to your [Mixxx controllers directory](https://github.com/mixxxdj/mixxx/wiki/Controller-Mapping-File-Locations)
4. Restart Mixxx
5. Go to Preferences → Controllers and enable your controller

### From Source

To install dependencies:

```bash
bun install
```

To build:

```bash
bun run build
```

To install locally:

```bash
bun run copy
```

This will install all controller mappings in ~/.mixxx/controllers

## Development

### Building

The build process compiles the TypeScript source into JavaScript and copies the XML configuration:

```bash
bun run build
```

### Releasing

Releases are automatically created when you push a git tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The GitHub Actions workflow will:
1. Build the project
2. Create a GitHub release
3. Upload the compiled files as release assets

You can also manually trigger a release from the Actions tab in GitHub.
