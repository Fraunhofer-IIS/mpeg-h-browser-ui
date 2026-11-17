# Changelog

## [r2.4.0] - 2026-11-17

### Added

- Extended theme: added optional animations

### Changed

- Extended & basic theme: improved responsiveness for smaller screens
- Updated pnpm to 12.16.1
- Updated dependencies

### Fixed

- Fixed XML reset handling

# Changelog

## [r2.3.0] - 2026-09-21

### Added

- Basic theme: added reset button

### Changed

- Extended theme: moved reset button to menu bar

### Fixed

- Fixed parsing XML switch groups with disabled switching but enabled prominence or position interactivity
- UI fixes in the extended theme (advanced menu, text wrapping of long words)

## [r2.2.0] - 2026-08-13

### Added

- Added [MPEG-H UI Manager](https://github.com/Fraunhofer-IIS/mpeghdec/wiki/MPEG-H-UI-manager-example) XML Version 11.1 support
- Added developer guide

### Changed

- Improved XML handling & parsing

### Fixed

- Minor UI fixes in the extended theme, e.g. opening and closing submenus

## [r2.1.0] - 2026-05-12

### Added

- Added REST backend and REST demo for integration with a JSON format as defined in the [MPEG-H UI Translator](https://github.com/Fraunhofer-IIS/mpegh-ui-translator)
- Added Wlapp demo for an example integration into an application together with the [MPEG-H UI Manager](https://github.com/Fraunhofer-IIS/mpeghdec/wiki/MPEG-H-UI-manager-example)
- Added audio language persistency functionality

### Changed

- Improved audio scene reset functionality
- Improved navigation and usability of basic & extended theme
- Improved audio scene loading
- Improved XML backend (e.g. added throttling for outgoing ActionEvents)
- Simplified SceneRepository structure
- Error handling & code style improvements

### Fixed

- Minor bugfixes

## [r2.0.0] - 2025-12-05

_Initial release._