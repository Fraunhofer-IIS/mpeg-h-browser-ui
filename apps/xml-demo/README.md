# Fraunhofer IIS MPEG-H Browser UI Example Page (XML demo)

An HTML example page showing the usage and capabilities of the XMLSceneRepository in combination with the Fraunhofer IIS MPEG-H Browser UI. The XMLSceneRepository will parse a given `AudioSceneConfig` as described in [MPEG-H UI Manager XML format](https://github.com/Fraunhofer-IIS/mpeghdec/wiki/MPEG-H-UI-manager-XML-format) (\<AudioSceneConfig\>). This information is then used to generate the MPEG-H UI of a specific theme accordingly. 

When the user interacts with the audio scene through the UI, a user interaction event (\<ActionEvent\>) is generated and outputted to the console and to a downloadable interactivity script.

## Usage

Build the core and the renderer libs of the MPEG-H UI

Copy the files
```
../../libs/ui-renderer/dist/web/mpeg-h-browser-ui-core.js
../../libs/ui-renderer/dist/web/mpeg-h-browser-ui-renderer.js
```

and the desired UI theme, e.g.
```
../../libs/ui-renderer/dist/web/mpeg-h-browser-ui-basic.js
```

to the lib folder. 

An `asi.xml` file containing a valid `AudioSceneConfig` must be stored next to the `index.html`.

Optional: Customize the style to your liking. An example is shown in ./customStyle.css

Optional: Customize the UI labels for different languages. An example customization for english is shown in customLabels.json. 

Serve the root folder via an HTTP server of your choice (otherwise file loading will not work due to CORS limitations).

Now the UI can be used on the loaded audio scene, both with mouse and keyboard navigation. Navigation via keyboard is bound to the the arrow keys (= move selection), "w" (= select), "q" (= back). 
The displayed language of UI and audio scene labels is selected using the preferred languages set up in your browser.

For each UI interaction an ActionEvent is logged to the console and to an interactivity script, which can be downloaded to test with the [MPEG-H UI manager](https://github.com/Fraunhofer-IIS/mpeghdec/wiki/MPEG-H-UI-manager-example) to simulate real-time interactivity.

## Limitations

Since the `asi.xml` only hosts static content, there is no real-time interaction possible. The demo should only show the usage of the library. For a real integration, the `AudioSceneConfig` should be provided and updated by a MPEG-H UI Manager instance, which should also receive the generated `ActionEvent XML message` directly, in order to update the scene for the MPEG-H decoder instance and the `asi.xml`.

