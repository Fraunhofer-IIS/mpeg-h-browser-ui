/*-----------------------------------------------------------------------------
Software License for The Fraunhofer FDK MPEG-H Software

Copyright (c) 2025 - 2026 Fraunhofer-Gesellschaft zur Förderung der angewandten
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

import { UiComponent } from "../lib/UiComponent";
import { UiComponentFocusable } from "../lib/UiComponentFocusable";
import { ButtonView } from "../lib/ButtonView";
import { ExtendedNavController } from "./ExtendedNavController";

export abstract class PopupView extends UiComponent {
  viewModel: unknown;
  element: HTMLElement;
  protected ac = new AbortController();
  private _shown: boolean = false;
  private registeredNavComponents: UiComponentFocusable[] = [];

  constructor(
    rootElement: HTMLElement,
    params: Map<string, unknown>,
    protected parentFocusElement: UiComponentFocusable,
    protected closedAction: () => void,
  ) {
    super(rootElement, params);
  }

  init() {
    this.element = document.createElement("div");
    this.element.classList.add("popup");
    this.element.classList.add("hidden");
    this._shown = false;
    super.init();
  }

  setViewModel(vm: unknown) {
    // clear vm listeners
    this.ac.abort();
    this.viewModel = vm;
  }

  registerComponentFirstLayer(
    elem: UiComponentFocusable,
    isTarget = false,
    previousElem: UiComponentFocusable = null,
  ) {
    const exnavs = this.params?.get(
      "navigationControllers",
    ) as ExtendedNavController[];
    if (exnavs == null || exnavs.length == null) {
      return;
    }
    for (const exnav of exnavs) {
      if (!exnav?.setConnection) {
        continue;
      }
      exnav.setConnection(
        elem,
        "back",
        () => {
          this.hide();
          return this.parentFocusElement;
        },
        true,
      );
      if (elem instanceof ButtonView) {
        exnav.setConnection(
          elem,
          "select",
          () => {
            const newTarget = elem?.action(elem);
            if (newTarget instanceof UiComponentFocusable) {
              return newTarget;
            }
            return this.parentFocusElement;
          },
          true,
        );
      }
      // only sets parent -> select = elem if parent -> select = undefined or if isTarget is true.
      exnav.setConnection(
        this.parentFocusElement,
        "select",
        () => {
          this.show();
          (this.parentFocusElement as ButtonView)?.setActive(true);
          return elem;
        },
        isTarget,
      );
      if (
        this.registeredNavComponents.length > 0 &&
        this.registeredNavComponents.indexOf(elem) == -1
      ) {
        const previousOrLastElem =
          previousElem ??
          this.registeredNavComponents[this.registeredNavComponents.length - 1];
        const nextElem = exnav.getConnection(previousOrLastElem, "down");
        this.connectVertical(exnav, previousOrLastElem, elem);
        if (nextElem != null && nextElem instanceof UiComponentFocusable) {
          this.connectVertical(exnav, elem, nextElem);
        }
      }
    }
    if (this.registeredNavComponents.indexOf(elem) == -1) {
      this.registeredNavComponents.push(elem);
    }
  }

  /**
   * vertivcally connect elem1(top) and elem2(bottom) with up and down actions.
   * Only connect them, if both are already in the nav graph!
   */
  private connectVertical(
    exnav: ExtendedNavController,
    elem1: UiComponentFocusable,
    elem2: UiComponentFocusable,
  ) {
    if (!(exnav.hasSource(elem1) && exnav.hasSource(elem2))) {
      return;
    }
    exnav.setConnection(elem1, "down", elem2, true);
    exnav.setConnection(elem2, "up", elem1, true);
  }

  unregisterComponentFirstLayer(elem: UiComponentFocusable) {
    const exnavs = this.params?.get(
      "navigationControllers",
    ) as ExtendedNavController[];
    if (exnavs != null && exnavs.length != null) {
      for (const exnav of exnavs) {
        if (!exnav?.setConnection) {
          continue;
        }

        const upElem = exnav?.getConnection(elem, "up");
        const downElem = exnav?.getConnection(elem, "down");

        // if to be removed elem has focus: shift focus to previous or parent elem
        if (exnav?.currentFocus == elem) {
          exnav?.performAction("up");
        }
        if (exnav?.currentFocus == elem) {
          exnav?.performAction("back");
        }

        // close possible up/down nav gap or remove nav in edge cases
        if (
          upElem instanceof UiComponentFocusable &&
          exnav?.getConnection(upElem, "down") != null
        ) {
          exnav?.setConnection(
            upElem,
            "down",
            downElem instanceof UiComponentFocusable ? downElem : undefined,
            true,
          );
        }
        if (
          downElem instanceof UiComponentFocusable &&
          exnav?.getConnection(downElem, "up") != null
        ) {
          exnav?.setConnection(
            downElem,
            "up",
            upElem instanceof UiComponentFocusable ? upElem : undefined,
            true,
          );
        }

        // fix parent select connection if needed
        if (exnav?.getConnection(this.parentFocusElement, "select") == elem) {
          exnav?.setConnection(
            this.parentFocusElement,
            "select",
            exnav?.getConnection(elem, "down") ??
              exnav?.getConnection(elem, "up") ??
              this.parentFocusElement,
            true,
          );
        }

        exnav?.removeSource(elem);
      }
    }
    // remove component from registered nav components array
    const index = this.registeredNavComponents.indexOf(elem);
    if (index !== -1) {
      this.registeredNavComponents.splice(index, 1);
    }
  }

  show() {
    this.element.classList.add("shown");
    this.element.classList.remove("hidden");
    const anim = this.params.get("useAnimations");
    if (anim) {
      this.element.classList.remove("animate-out");
    }
    this._shown = true;
  }

  hide() {
    this.element.classList.add("hidden");
    const anim = this.params.get("useAnimations");
    if (this.element.classList.contains("shown")) {
      if (anim) {
        this.element.classList.add("animate-out");
      }
    }
    this.element.classList.remove("shown");
    this._shown = false;

    const exnavs = this.params?.get(
      "navigationControllers",
    ) as ExtendedNavController[];
    if (exnavs != null && exnavs.length != null) {
      for (const exnav of exnavs) {
        if (!exnav?.currentFocus) {
          continue;
        }
        if (this.registeredNavComponents.indexOf(exnav.currentFocus) !== -1) {
          exnav.currentFocus = this.parentFocusElement;
        }
      }
    }
    this.closedAction();
  }

  get shown() {
    return this._shown;
  }

  abstract getMainFocusTarget(): UiComponentFocusable;

  dispose() {
    // clear vm listeners
    this.ac.abort();
    super.dispose();
  }
}
