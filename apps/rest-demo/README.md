# Fraunhofer IIS MPEG-H Browser UI Example Page (REST demo)

An HTML example page showing the usage and capabilities of the implemented RESTSceneRepository of the Fraunhofer IIS MPEG-H Browser UI.

The RESTSceneRepository enables two-way synchronization of the current Audio Scene Interactivity using a JSON notation.

The implemented JSON format is a proposed JSON format for application standards (such as the TV 3.0 standard in Brazil) as described here: [mpegh-ui-translator/json_schema](https://github.com/Fraunhofer-IIS/mpegh-ui-translator/tree/main/json_schema).

A given `AudioSceneConfig` as described in [MPEG-H UI Manager XML format](https://github.com/Fraunhofer-IIS/mpeghdec/wiki/MPEG-H-UI-manager-XML-format) might be translated to JSON objects by using the [MPEG-H UI Translator](https://github.com/Fraunhofer-IIS/mpegh-ui-translator).

These JSON files then can be served in a REST API and the RESTSceneRepository can be used to connect the REST Endpoint to the MPEG-H Browser UI (bidirectional, GET and POST).
The (serving) REST server itself is out of scope for this project.

## Usage

Build the core and the UI renderer libraries of the MPEG-H Browser UI.

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

In the index.js file specify the REST URL by setting

```
const restApiUrl = "http://localhost:8080/endpoint";
```

Optional: Customize the style to your liking. An example is shown in ./customStyle.css

Optional: Customize the UI labels for different languages. An example customization for english is shown in ./customLabels.json. 

Serve the root folder via an HTTP server of your choice (otherwise file loading will not work due to CORS limitations).

Now the UI can be used on the audio scene obtained from the REST API, both with mouse and keyboard navigation. Navigation via keyboard is bound to the the arrow keys (= move selection), "w" (= select), "q" (= back). 
The displayed language of UI and audio scene labels is selected using the preferred languages set up in your browser.

All user interactivity will be synced to the specified REST endpoint.