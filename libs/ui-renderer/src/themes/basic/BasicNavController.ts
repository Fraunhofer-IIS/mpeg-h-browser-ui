/*-----------------------------------------------------------------------------
Software License for The Fraunhofer FDK MPEG-H Software

Copyright (c) 2025 - 2025 Fraunhofer-Gesellschaft zur Förderung der angewandten
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

import { NavigationController } from "../../../lib";

export class BasicNavController implements NavigationController {
  // keep track of a graph with references to the elements
  // call focus and unfocus on the elements
  readonly supportedActions = ["left", "right", "up", "down"];

  constructor() {}

  getFocusable() {
    return Array.from(
      document
        .getElementById("nga-ui-basic")
        .querySelectorAll('input, [tabindex]:not([tabindex="-1"])'),
    );
  }
  getTabbable() {
    // filter out unchecked radio buttons
    return this.getFocusable().filter(
      (e) =>
        !(
          (e as HTMLInputElement).type === "radio" &&
          !(e as HTMLInputElement).checked
        ),
    );
  }
  getCurrentTabIndex() {
    const elements = this.getTabbable();
    return elements.indexOf(
      document.getElementsByClassName("basic-focused")[0],
    );
  }
  getCurrentFocusIndex() {
    const elements = this.getFocusable();
    return elements.indexOf(
      document.getElementsByClassName("basic-focused")[0],
    );
  }

  /**
   * Perform an action.
   * @param action action to be performed
   * @returns true if an action (move focus using inbuilt tabbing and arrows) was performed.
   */
  performAction(action: string): boolean {
    if (!this.supportedActions.includes(action)) return false;

    const tabbable = this.getTabbable() as HTMLInputElement[];
    const basicFocused = document.getElementsByClassName(
      "basic-focused",
    ) as HTMLCollectionOf<HTMLInputElement>;

    if (["up", "down"].includes(action)) {
      const currentIndex = this.getCurrentTabIndex();
      let newIndex;
      if (action === "down") {
        newIndex = (currentIndex + 1) % tabbable.length;
      } else {
        newIndex = currentIndex <= 0 ? tabbable.length - 1 : currentIndex - 1;
      }
      for (let i = 0; i < basicFocused.length; i++) {
        basicFocused[i].classList.remove("basic-focused");
      }
      tabbable[newIndex]?.classList.add("basic-focused");
      tabbable[newIndex]?.focus();
      if (newIndex === tabbable.length - 1) {
        // last: scroll to bottom
        const objDiv = document.getElementById("nga-ui-basic");
        objDiv.scrollTop = objDiv.scrollHeight;
      } else if (newIndex === 0) {
        // first: scroll to top
        const objDiv = document.getElementById("nga-ui-basic");
        objDiv.scrollTop = 0;
      }
      return true;
    } else if (["right", "left"].includes(action)) {
      if (basicFocused[0]?.type === "range") {
        // slider: mpove the slider and dispatch events
        let step = parseFloat(basicFocused[0].step) || 1;
        if (action === "left") {
          step *= -1;
        }
        const value = parseFloat(basicFocused[0].value) || 0;
        basicFocused[0].value = (value + step).toString();
        basicFocused[0].dispatchEvent(new Event("change", { bubbles: true }));
        basicFocused[0].dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        // normal focus movement
        const elements = this.getFocusable() as HTMLInputElement[];
        const currentIndex = elements.indexOf(basicFocused[0]);
        const nextIndex =
          action === "right"
            ? (currentIndex + 1) % elements.length
            : currentIndex <= 0
              ? 0
              : currentIndex - 1;
        if (elements[nextIndex]?.name !== elements[currentIndex]?.name)
          return false;
        if (elements[nextIndex].name == null || elements[nextIndex].name == "")
          return false;
        if (!tabbable.includes(elements[nextIndex])) {
          elements[currentIndex]?.classList.remove("basic-focused");
          elements[nextIndex]?.focus();
          elements[nextIndex]?.classList.add("basic-focused");
          elements[nextIndex]?.click();
        }
      }
      return true;
    }
    return false;
  }
}
