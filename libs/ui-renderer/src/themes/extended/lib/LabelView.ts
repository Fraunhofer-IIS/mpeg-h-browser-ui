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

import { getDisplayName, Localizable } from "@wmt/mpeg-h-browser-ui-core";
import { UiComponent } from "./UiComponent";

export class LabelView extends UiComponent {
  localizables: Localizable[] = [];
  isLangLabel = false;
  langCode: string = undefined;
  constructor(
    rootElement: HTMLElement,
    params: Map<string, unknown>,
    private readonly tagName = "h2",
    initialContent: Localizable[],
  ) {
    super(rootElement, params);
    if (tagName === "") {
      // do not create a sub element, but alter text of the root element
      this.element = rootElement;
    } else {
      // create a sub element
      this.element = document.createElement(this.tagName);
      super.init();
    }
    this.updateContent(initialContent);
  }

  updateContentFromLangCode(langCode: string) {
    this.isLangLabel = true;
    this.langCode = langCode;
    let displayLang = langCode;
    if (!this.params.get("useLanguageEndonyms")) {
      displayLang = (
        this.params.get("preferredLabelLanguages") as string[]
      )?.[0];
    }
    if (this.element instanceof HTMLImageElement) {
      this.element.alt = getDisplayName(langCode, displayLang);
    } else {
      this.element.textContent = getDisplayName(langCode, displayLang);
    }
    this.element.lang = displayLang;
    this.element.dir = "auto";
  }

  /**
   * Update the content of this LabelView.
   * Content will be updated to the highest match in preferredLanguages.
   * if no match is found, the first localizable content will be used.
   * @param localizables array of localizable content.
   */
  updateContent(localizables: Localizable[]): void {
    this.isLangLabel = false;
    if (localizables == null) return;
    this.localizables = localizables;
    this.update();
  }

  /**
   * Update the currently selected label based on the preferred languages.
   * Does not update content, only selects the localizable that will be displayed in the UI.
   */
  update(): void {
    if (this.isLangLabel) {
      this.updateContentFromLangCode(this.langCode);
      return;
    }
    outer: {
      for (const prefLang of this.params.get(
        "preferredLabelLanguages",
      ) as string[]) {
        for (const local of this.localizables) {
          if (local.lang === prefLang) {
            if (this.element instanceof HTMLImageElement) {
              this.element.alt = local.value;
              this.element.alt = local.value;
            } else {
              this.element.textContent = local.value;
            }
            this.element.lang = local.lang;
            this.element.dir = local.dir || "auto";
            break outer;
          }
        }
      }
      if (this.element instanceof HTMLImageElement) {
        this.element.alt = this.localizables[0]?.value || "";
      } else {
        this.element.textContent = this.localizables[0]?.value || "";
      }
      this.element.lang = this.localizables[0]?.lang || "";
      this.element.dir = this.localizables[0]?.dir || "auto";
    }
  }
}
