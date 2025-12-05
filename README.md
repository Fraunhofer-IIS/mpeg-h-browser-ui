# Fraunhofer IIS MPEG-H Browser UI software

The Fraunhofer IIS MPEG-H Browser UI (**mpeg-h-browser-ui**) is a software component for rendering advanced user interfaces for the MPEG-H Audio standard as defined in [ISO/IEC 23008-3:2022](https://www.iso.org/standard/83525.html). Multiple customizable UI themes are provided, making the personalization features of MPEG-H Audio experienceable in modern browser environments.

Please visit [www.mpegh.com](https://mpegh.com) to learn more about MPEG-H Audio.

## Supported architectures

The **mpeg-h-browser-ui** is based on modern web technologies and will therefore run on nearly any architecture, which supports today's web technologies (HTML5, JavaScript, CSS).

Integration support can be requested directly from [Fraunhofer IIS](https://www.iis.fraunhofer.de/en/ff/amm/broadcast-streaming/mpegh.html).

## Build

**mpeg-h-browser-ui** uses [pnpm](https://pnpm.io/) (version >= 8), [webpack](https://webpack.js.org/) (version >= 5.90.1), and [Node.js](https://nodejs.org/en) (version >= 20). A working installation is therefore required to build the software. For a list of all dependencies, including build dependencies, please consult the package.json(s).

### How to build using pnpm

Find below the basic instructions to build the project.

1. Clone the project.
   ```
   $ git clone https://github.com/Fraunhofer-IIS/mpeg-h-browser-ui.git
   $ cd mpeg-h-browser-ui
   ```
2. (optional, if not done already) Install pnpm, e.g. using Corepack.
   ```
   $ corepack enable pnpm
   ```
3. Install dependencies.
   ```
   $ pnpm install
   ```
4. Build the project.
   ```
   $ pnpm build:all
   ```

Afterwards, the generated files can be found in ./ui-renderer/dist/web/

After the initial build, the command

   ```
   $ pnpm build:libs_to_apps
   ```

can be used, to automatically copy all updated built code to the lib folders of all demo apps.

## Example page

This repository provides following demo example page for the **mpeg-h-browser-ui**:

[Fraunhofer IIS MPEG-H Browser UI XML Demo](./apps/xml-demo/README.md)

## Contributing

Contributions may be done through a pull request to the upstream repository.

- Create a fork based on the latest master branch.
- Apply changes to the fork.
- Add the author names to [AUTHORS.md](./AUTHORS.md).
- Create a pull request to the upstream repository. The request must contain a detailed description of its purpose.

## Links

- [www.mpegh.com](https://mpegh.com)
- [Fraunhofer IIS MPEG-H Audio](https://www.iis.fraunhofer.de/en/ff/amm/broadcast-streaming/mpegh.html)

## License

Please see the [license.txt](./license.txt) file for the terms of use that apply to the software in this repository.

Fraunhofer supports the development of MPEG-H products and services by offering additional software, documentation, and technical advice. In addition, it operates the MPEG-H Trademark Program to ease interoperability testing of end-products. Please visit [www.mpegh.com](https://mpegh.com) for more information.


For more information, please contact amm-info@iis.fraunhofer.de
