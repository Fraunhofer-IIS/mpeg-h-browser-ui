/*-----------------------------------------------------------------------------
Software License for The Fraunhofer FDK MPEG-H Software

Copyright (c) 2022 - 2025 Fraunhofer-Gesellschaft zur Förderung der angewandten
Forschung e.V. and Contributors
All rights reserved.

1. INTRODUCTION

The "Fraunhofer FDK MPEG-H Software" is software that implements the ISO/MPEG
MPEG-H 3D Audio standard for digital audio or related system features. Patent
licenses for necessary patent claims for the Fraunhofer FDK MPEG-H Software
(including those of Fraunhofer), for the use in commercial products and
services, may be obtained from the respective patent owners individually and/or
from Via LA (www.via-la.com).

Fraunhofer supports the development of MPEG-H products and services by offering
additional software, documentation, and technical advice. In addition, it
operates the MPEG-H Trademark Program to ease interoperability testing of end-
products. Please visit www.mpegh.com for more information.

2. COPYRIGHT LICENSE

Redistribution and use in source and binary forms, with or without modification,
are permitted without payment of copyright license fees provided that you
satisfy the following conditions:

* You must retain the complete text of this software license in redistributions
of the Fraunhofer FDK MPEG-H Software or your modifications thereto in source
code form.

* You must retain the complete text of this software license in the
documentation and/or other materials provided with redistributions of
the Fraunhofer FDK MPEG-H Software or your modifications thereto in binary form.
You must make available free of charge copies of the complete source code of
the Fraunhofer FDK MPEG-H Software and your modifications thereto to recipients
of copies in binary form.

* The name of Fraunhofer may not be used to endorse or promote products derived
from the Fraunhofer FDK MPEG-H Software without prior written permission.

* You may not charge copyright license fees for anyone to use, copy or
distribute the Fraunhofer FDK MPEG-H Software or your modifications thereto.

* Your modified versions of the Fraunhofer FDK MPEG-H Software must carry
prominent notices stating that you changed the software and the date of any
change. For modified versions of the Fraunhofer FDK MPEG-H Software, the term
"Fraunhofer FDK MPEG-H Software" must be replaced by the term "Third-Party
Modified Version of the Fraunhofer FDK MPEG-H Software".

3. No PATENT LICENSE

NO EXPRESS OR IMPLIED LICENSES TO ANY PATENT CLAIMS, including without
limitation the patents of Fraunhofer, ARE GRANTED BY THIS SOFTWARE LICENSE.
Fraunhofer provides no warranty of patent non-infringement with respect to this
software. You may use this Fraunhofer FDK MPEG-H Software or modifications
thereto only for purposes that are authorized by appropriate patent licenses.

4. DISCLAIMER

This Fraunhofer FDK MPEG-H Software is provided by Fraunhofer on behalf of the
copyright holders and contributors "AS IS" and WITHOUT ANY EXPRESS OR IMPLIED
WARRANTIES, including but not limited to the implied warranties of
merchantability and fitness for a particular purpose. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE for any direct, indirect,
incidental, special, exemplary, or consequential damages, including but not
limited to procurement of substitute goods or services; loss of use, data, or
profits, or business interruption, however caused and on any theory of
liability, whether in contract, strict liability, or tort (including
negligence), arising in any way out of the use of this software, even if
advised of the possibility of such damage.

5. CONTACT INFORMATION

Fraunhofer Institute for Integrated Circuits IIS
Attention: Division Audio and Media Technologies - MPEG-H FDK
Am Wolfsmantel 33
91058 Erlangen, Germany
www.iis.fraunhofer.de/amm
amm-info@iis.fraunhofer.de
-----------------------------------------------------------------------------*/

const mpeghUiRoot = document.querySelector('#mpegh-ui');
const dlActionLogBtn = document.querySelector('#dl-action-log');
dlActionLogBtn.addEventListener('click', downloadActionLog);
let viewManager;
let startTime;
let lastFrameWithAction = 0;
const actionLog = [];

function onUiAction(action) {
  const currentTime = Date.now();
  if (!startTime) {
    startTime = currentTime;
  }

  const secondsElapsed = (currentTime - startTime) / 1000;
  const framesElapsed = Math.ceil(secondsElapsed * 48000 / 1024);

  if (framesElapsed != lastFrameWithAction) {
    actionLog.push(`<Sleep Frame="${framesElapsed}">`);
    lastFrameWithAction = framesElapsed;
  }
  actionLog.push(action);
  console.log(action);
}

function downloadActionLog() {
  const content = actionLog.join('\n');
  const mimeType = 'text/plain;charset=utf-8;';
  const blob = new Blob([content], { type: mimeType });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ui_actions.log';
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function setupNavigationControls(navController) {
  if (!navController) {
    return
  }
  const keyActions = {
    "ArrowDown": () => navController.performAction("down"),
    "ArrowUp": () => navController.performAction("up"),
    "ArrowLeft": () => navController.performAction("left"),
    "ArrowRight": () => navController.performAction("right"),
    "w": () => navController.performAction("select"),
    "q": () => navController.performAction("back"),
  };
  document.addEventListener("keydown", event => {
    const action = keyActions[event.key]
    // Only prevent default and perform the action if key action is contained in setActions and is a supported function of the remote controller.
    if (action && typeof action === "function") {
      event.preventDefault();
      action();
    }
  });
}

async function main() {
  // read audio scene information & custom UI labels
  const asiPromise = fetch('asi.xml').then(res => res.text());
  const customLabelsPromise = fetch('customLabels.json').then(res => res.json());

  // ASI content: file scope for later access
  asi = await asiPromise;
  customLabels = await customLabelsPromise;
  
  repo = new IIS_WMT.XmlSceneRepository(); // create XML scene repository with callback on UI action
  repo.setOnAction(onUiAction);
  // create new viewmanager
  viewManager = new IIS_WMT.ViewManager(repo, mpeghUiRoot);

  const navctrlr = viewManager.getNavigationController(); // get nav controller
  setupNavigationControls(navctrlr); // bind nav controller functions to keys (arrow keys, w = OK, s = Back)



  // preferredLabelLanguages is an array of language tags. It accepts BCP47 primary Language Subtags (e.g. "en", "de"). 
  // To convert a mixed array of full BCP47 tags, ISO639-1 or -2 language tags to this format, use IIS_WMT.toBCP47Array(array).
  // example to convert preferred browser languages to this format:
  // grab browser language
  let browserLangs = navigator.languages;
  browserLangs = IIS_WMT.toBCP47Array(browserLangs);
  // remove duplicates
  browserLangs = [...new Set(browserLangs)];
  viewManager.updateViewParam("preferredLabelLanguages", browserLangs);
  
  // set custom labels

  viewManager.updateViewParam("updateCustomLabels", customLabels);
  
  // parse and render audio scene given from decoder, here only dummy from xml
  viewManager.loadFromPayload(asi);
}

async function reload() {
  const asiPromise = fetch('asi.xml').then(res => res.text());
  // ASI content: file scope for later access
  asi = await asiPromise;
  // parse and render audio scene given from decoder, here only dummy from xml
  viewManager.loadFromPayload(asi);
}

main();
