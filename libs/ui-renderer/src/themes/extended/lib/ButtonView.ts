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

import { Localizable } from "@wmt/mpeg-h-browser-ui-core";
import { UiComponentFocusable } from "./UiComponentFocusable";
import { LabelView } from "./LabelView";
import { ImageView } from "./ImageView";

export class ButtonView extends UiComponentFocusable {
  element: HTMLButtonElement;
  labelView: LabelView | null;
  imageView: ImageView | null;
  private _style: string;

  constructor(
    rootElement: HTMLElement,
    params: Map<string, unknown>,
    public action: (b: ButtonView) => unknown,
    localizables: Localizable[] = undefined,
    imageSrc: string = undefined,
    style = "selection",
  ) {
    super(rootElement, params);
    this.element = document.createElement("button");
    this.element.tabIndex = -1;
    // first text, then image. CSS may be used to revert order if needed

    if (imageSrc) {
      this.imageView = new ImageView(this.element, params, imageSrc);
      if (localizables) {
        this.labelView = new LabelView(
          this.imageView.element,
          params,
          "",
          localizables,
        );
      }
    } else if (localizables) {
      this.labelView = new LabelView(this.element, params, "p", localizables);
    }
    super.init();
    this.style = style;
    this.element.addEventListener("click", () => {
      this.action(this);
    });
  }

  /**
   * Update the buttons label content, if the button has a label.
   * @param localizables label content in different languages. Label will select the preferred language.
   */
  updateLabel(localizables: Localizable[]) {
    this.labelView?.updateContent(localizables);
  }

  /**
   * Update the buttons image content, if the button has an image.
   * @param imageSrc Path to source image.
   */
  updateImage(imageSrc: string) {
    this.imageView?.updateImage(imageSrc);
  }

  /**
   * Set the action that is executed when the button is clicked.
   * @param action function to be executed.
   */
  setAction(action: (b: ButtonView) => unknown) {
    this.action = action;
  }

  /**
   * Set the buttons status indicator. based on the button style, the button will change visually.
   * @param active
   */
  setActive(active: boolean) {
    this.element.classList.toggle("active", active);
  }

  /**
   * Set the button style.
   * @param style "dropdown", "dropup", "selection", "action"
   */
  set style(style: string) {
    if (!["dropdown", "dropup", "selection", "action"].includes(style)) {
      return;
    }
    this._style = style;
    this.element.classList.toggle("btn-dropdown", style === "dropdown");
    this.element.classList.toggle("btn-dropup", style === "dropup");
    this.element.classList.toggle("btn-selection", style === "selection");
    this.element.classList.toggle("btn-action", style === "action");
  }

  get style() {
    return this._style;
  }

  /** Sets enabled or disabled based on e */
  setEnabled(e: boolean) {
    super.setEnabled(e);
    this.element.disabled = !e;
    this.focusable = e;
  }

  /**
   * Focus this element.
   * @param i focus requester id. 0 = main requester
   */
  focus(i: number) {
    if (this.focusable) {
      this.element.focus();
      this.element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      this.focusedBy.add(i);
      this.element.classList.add("focused_navctrl_" + i);
      // focus eats active of drop menus
      if (this.style != "selection") {
        this.setActive(false);
      }
      // make focusable by tab
      if (i === 0) this.element.tabIndex = 0;
    }
  }
}
