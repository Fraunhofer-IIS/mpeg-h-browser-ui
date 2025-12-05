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

import { UiComponent } from "../lib/UiComponent";
import { UiComponentFocusable } from "../lib/UiComponentFocusable";
import { ButtonView } from "../lib/ButtonView";
import { ExtendedNavController } from "./ExtendedNavController";

export abstract class PopupView extends UiComponent {
  viewModel: unknown;
  element: HTMLElement;
  protected ac = new AbortController();
  private _shown: boolean = false;
  private _registeredNavComponents: UiComponentFocusable[] = [];

  constructor(
    rootElement: HTMLElement,
    params: Map<string, unknown>,
    protected parentFocusElement: UiComponentFocusable,
  ) {
    super(rootElement, params);
  }

  init() {
    this.element = document.createElement("div");
    this.element.classList.add("popup");
    this.hide();
    super.init();
  }

  setViewModel(vm: unknown) {
    // clear vm listeners
    this.ac.abort();
    this.viewModel = vm;
  }

  registerComponentFirstLayer(elem: UiComponentFocusable, isTarget = false) {
    const exnavs = this.params?.get(
      "navigationControllers",
    ) as ExtendedNavController[];

    if (exnavs != null && exnavs.length != null) {
      for (const exnav of exnavs) {
        if (!exnav?.setConnection) continue;
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
        // only set parent -> select = elem if parent -> select = undefined.
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
          this._registeredNavComponents.length > 0 &&
          this._registeredNavComponents.indexOf(elem) == -1
        ) {
          exnav.setConnection(
            this._registeredNavComponents[
              this._registeredNavComponents.length - 1
            ],
            "down",
            elem,
            true,
          );
          exnav.setConnection(
            elem,
            "up",
            this._registeredNavComponents[
              this._registeredNavComponents.length - 1
            ],
            true,
          );
        }
      }
    }
    if (this._registeredNavComponents.indexOf(elem) == -1) {
      this._registeredNavComponents.push(elem);
    }
  }

  unregisterComponentFirstLayer(elem: UiComponentFocusable) {
    const exnavs = this.params?.get(
      "navigationControllers",
    ) as ExtendedNavController[];
    if (exnavs != null && exnavs.length != null) {
      for (const exnav of exnavs) {
        if (!exnav?.setConnection) continue;
        if (exnav?.getConnection(this.parentFocusElement, "select") == elem) {
          exnav?.setConnection(
            this.parentFocusElement,
            "select",
            undefined,
            true,
          );
        }
        // exnav?.setConnection(elem, "back", undefined, true); - already included in removeSource(elem)
        exnav?.removeSource(elem);
      }
    }
    // remove component from registered nav components array
    const index = this._registeredNavComponents.indexOf(elem);
    if (index !== -1) {
      this._registeredNavComponents.splice(index, 1);
    }
  }

  show() {
    this.element.classList.add("shown");
    this.element.classList.remove("hidden");
    this._shown = true;
  }

  hide() {
    this.element.classList.add("hidden");
    this.element.classList.remove("shown");
    this._shown = false;

    const exnavs = this.params?.get(
      "navigationControllers",
    ) as ExtendedNavController[];
    if (exnavs != null && exnavs.length != null) {
      for (const exnav of exnavs) {
        if (!exnav?.currentFocus) continue;
        if (this._registeredNavComponents.indexOf(exnav.currentFocus) !== -1) {
          exnav.currentFocus = this.parentFocusElement;
        }
      }
    }
  }

  get shown() {
    return this._shown;
  }

  abstract getMainFocusTarget(): UiComponentFocusable;

  dispose() {
    // clear vm listeners
    this.ac.abort();
    // remove element
    this.element?.remove();
  }
}
