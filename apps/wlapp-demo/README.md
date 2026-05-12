# MPEG-H Browser UI Example Page (WL-App demo)

An example showing how to use the Fraunhofer IIS MPEG-H Browser UI in e.g. the Android™ application [MPEG-H WL-App](https://mpegh.lze-innovation.de/#:~:text=Download%20now-,MPEG%2DH%20WL%2DApp,-The%20MPEG%2DH).

This can be achieved by remotely hosting the contents of this demo using a web server and linking to it in the MPEG-H WL-App, as described on this page. This enables quick and easy live testing during development of the user interface.

It is also possible to embed the contents of this demo directly into an application. For more information, refer to the wiki.

The XMLSceneRepository is used to parse the audio scene obtained from the application. This information is then taken to generate the UI accordingly. Whenever the user interacts with the UI, an UI action is forwarded to the application. 

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

Optional: Customize the style to your liking. An example is shown in ./customStyle.css

Optional: Customize the UI labels for different languages. An example customization for english is shown in customLabels.json. 

Serve the root folder via an HTTP server of your choice.

Connect the device running the WL-App to the same network as your device, and make sure that the port that yout HTTP server is running on is not blocked by a firewall.

In the WL-App:
Go to settings -> MPEG-H -> UI -> select WebView as UI mode.
Set up your device as a new WebView source in. 
the URL needs to point to index.html, e.g. ```http://1.2.3.4:5678/apps/wlapp-demo/index.html```. The Name can be chosen freely. User and password can be left blank in most cases.


Now the UI will be available in the WL-App, both with touch and remote control navigation.
The displayed language of UI and audio scene labels is selected using the preferred language set up in the WL-App.

## Developer guidelines 

Detailed developer guidelines for this integration example are available in the Wiki.

## Attributions
Android is a trademark of Google LLC.