/*-----------------------------------------------------------------------------
Software License for The Fraunhofer FDK MPEG-H Software

Copyright (c) 2021 - 2025 Fraunhofer-Gesellschaft zur Förderung der angewandten
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

/*
 * JavaScript class representing W3C Localizable structure, also refer to https://www.w3.org/TR/localizable-manifests/
 */

export class Localizable {
  /**
   * Constructor to create a Localizable according to https://www.w3.org/TR/string-meta/#use-the-localizable-data-structure
   * @param value content
   * @param lang valid BCP47 language tag (e.g. 2 or 3 letters plus optional contry, eg. "en" or "en-US", refer to https://www.w3.org/TR/i18n-glossary/#dfn-valid)
   * @param dir writing direction ("ltr", "rtl" or "auto")
   */
  constructor(
    readonly value: string,
    readonly lang: string,
    readonly dir: string = "auto",
  ) {}
}

/**
 * Append a specific string to all localizables of an array
 * @param local the input localizables
 * @param appendString string to append to all localizables
 * @returns array of localizables with string appended
 */

export const appendToLocalizables = (
  local: Localizable[],
  appendString = ", ...",
) => {
  const rslt: Localizable[] = [];
  for (const l of local) {
    rslt.push(new Localizable(l.value + appendString, l.lang, l.dir));
  }
  return rslt;
};

export type LanguageNameConverter = (
  inputLanguage: string,
  outputLabelLanguage?: string,
) => string | undefined;

/**
 * Convert a iso 639-2 or 639-1 language tag to a language tag according to BCP47 (= shortest valid tag)
 * @param inLangTag input language tag, at least 2 letters.
 * @returns a language tag according to BCP47
 */

export const toBCP47 = (inLangTag: string) => {
  if (inLangTag == null) return undefined;
  // grab the first alphabetical substring for further processing
  inLangTag = inLangTag.match(/[a-zA-Z]+/)?.[0] ?? "";
  if (inLangTag.length < 2) {
    return undefined;
  } else if (inLangTag.length == 2) {
    return inLangTag;
  } else if (inLangTag.length == 3) {
    // try to shorten to 639-1
    const converted = iso639_2_to_639_1.get(inLangTag);
    if (converted == null) {
      // there are no differences between 639-2/B and /T if there is no corresponding 639-1 lang tag
      return inLangTag;
    }
    return converted;
  } else {
    // try to find a match for longer input tags
    const converted = iso639_2_to_639_1.get(inLangTag.substring(0, 3));
    if (converted != null) {
      return converted;
    }
    const is2letterValid = iso639_1_to_639_2_B.has(inLangTag.substring(0, 2));
    if (is2letterValid) {
      return inLangTag.substring(0, 2);
    }
    return inLangTag.substring(0, 3);
  }
};

export const toBCP47Array = (inLangs: string[]) => {
  const result = [];
  for (const lang of inLangs) {
    result.push(toBCP47(lang));
  }
  return result;
};

/**
 * Convert a iso 639-2 or 639-1 language tag to a iso 639-2/B language tag.
 * @param inLangTag input language tag, at least 2 letters.
 * @returns a language tag according to iso 639-2/B
 */

export const to639_2B = (inLangTag: string) => {
  // convert a 639-2 or 639-1 language tag language tag to a 639-2/B tag.
  if (inLangTag.length <= 2) {
    return undefined;
  } else if (inLangTag.length == 2) {
    return iso639_1_to_639_2_B.get(inLangTag);
  } else if (inLangTag.length == 3) {
    const converted = iso639_2_to_639_1.get(inLangTag);
    if (converted == null) {
      // cant find corresponding -1 tag: => no difference bnetween /T and /B tag.
      return inLangTag;
    }
    return iso639_1_to_639_2_B.get(converted);
  } else {
    // try to find a match for longer input tags
    const converted = iso639_2_to_639_1.get(inLangTag.substring(0, 3));
    if (converted != null) {
      return converted;
    }
    const is2letterValid = iso639_1_to_639_2_B.has(inLangTag.substring(0, 2));
    if (is2letterValid) {
      return iso639_1_to_639_2_B.get(inLangTag.substring(0, 2));
    }
    return inLangTag.substring(0, 3);
  }
};

/**
 * ISO-639-1 -> ISO-639-2/B language tag conversion table, based on
 * http://loc.gov/standards/iso639-2/ISO-639-2_utf-8.txt
 */

export const iso639_1_to_639_2_B = new Map([
  ["aa", "aar"],
  ["ab", "abk"],
  ["af", "afr"],
  ["ak", "aka"],
  ["sq", "alb"],
  ["am", "amh"],
  ["ar", "ara"],
  ["an", "arg"],
  ["hy", "arm"],
  ["as", "asm"],
  ["av", "ava"],
  ["ae", "ave"],
  ["ay", "aym"],
  ["az", "aze"],
  ["ba", "bak"],
  ["bm", "bam"],
  ["eu", "baq"],
  ["be", "bel"],
  ["bn", "ben"],
  ["bh", "bih"],
  ["bi", "bis"],
  ["bs", "bos"],
  ["br", "bre"],
  ["bg", "bul"],
  ["my", "bur"],
  ["ca", "cat"],
  ["ch", "cha"],
  ["ce", "che"],
  ["zh", "chi"],
  ["cu", "chu"],
  ["cv", "chv"],
  ["kw", "cor"],
  ["co", "cos"],
  ["cr", "cre"],
  ["cs", "cze"],
  ["da", "dan"],
  ["dv", "div"],
  ["nl", "dut"],
  ["dz", "dzo"],
  ["en", "eng"],
  ["eo", "epo"],
  ["et", "est"],
  ["ee", "ewe"],
  ["fo", "fao"],
  ["fj", "fij"],
  ["fi", "fin"],
  ["fr", "fre"],
  ["fy", "fry"],
  ["ff", "ful"],
  ["ka", "geo"],
  ["de", "ger"],
  ["gd", "gla"],
  ["ga", "gle"],
  ["gl", "glg"],
  ["gv", "glv"],
  ["el", "gre"],
  ["gn", "grn"],
  ["gu", "guj"],
  ["ht", "hat"],
  ["ha", "hau"],
  ["he", "heb"],
  ["hz", "her"],
  ["hi", "hin"],
  ["ho", "hmo"],
  ["hr", "hrv"],
  ["hu", "hun"],
  ["ig", "ibo"],
  ["is", "ice"],
  ["io", "ido"],
  ["ii", "iii"],
  ["iu", "iku"],
  ["ie", "ile"],
  ["ia", "ina"],
  ["id", "ind"],
  ["ik", "ipk"],
  ["it", "ita"],
  ["jv", "jav"],
  ["ja", "jpn"],
  ["kl", "kal"],
  ["kn", "kan"],
  ["ks", "kas"],
  ["kr", "kau"],
  ["kk", "kaz"],
  ["km", "khm"],
  ["ki", "kik"],
  ["rw", "kin"],
  ["ky", "kir"],
  ["kv", "kom"],
  ["kg", "kon"],
  ["ko", "kor"],
  ["kj", "kua"],
  ["ku", "kur"],
  ["lo", "lao"],
  ["la", "lat"],
  ["lv", "lav"],
  ["li", "lim"],
  ["ln", "lin"],
  ["lt", "lit"],
  ["lb", "ltz"],
  ["lu", "lub"],
  ["lg", "lug"],
  ["mk", "mac"],
  ["mh", "mah"],
  ["ml", "mal"],
  ["mi", "mao"],
  ["mr", "mar"],
  ["ms", "may"],
  ["mg", "mlg"],
  ["mt", "mlt"],
  ["mn", "mon"],
  ["na", "nau"],
  ["nv", "nav"],
  ["nr", "nbl"],
  ["nd", "nde"],
  ["ng", "ndo"],
  ["ne", "nep"],
  ["nn", "nno"],
  ["nb", "nob"],
  ["no", "nor"],
  ["ny", "nya"],
  ["oc", "oci"],
  ["oj", "oji"],
  ["or", "ori"],
  ["om", "orm"],
  ["os", "oss"],
  ["pa", "pan"],
  ["fa", "per"],
  ["pi", "pli"],
  ["pl", "pol"],
  ["pt", "por"],
  ["ps", "pus"],
  ["qu", "que"],
  ["rm", "roh"],
  ["ro", "rum"],
  ["rn", "run"],
  ["ru", "rus"],
  ["sg", "sag"],
  ["sa", "san"],
  ["si", "sin"],
  ["sk", "slo"],
  ["sl", "slv"],
  ["se", "sme"],
  ["sm", "smo"],
  ["sn", "sna"],
  ["sd", "snd"],
  ["so", "som"],
  ["st", "sot"],
  ["es", "spa"],
  ["sc", "srd"],
  ["sr", "srp"],
  ["ss", "ssw"],
  ["su", "sun"],
  ["sw", "swa"],
  ["sv", "swe"],
  ["ty", "tah"],
  ["ta", "tam"],
  ["tt", "tat"],
  ["te", "tel"],
  ["tg", "tgk"],
  ["tl", "tgl"],
  ["th", "tha"],
  ["bo", "tib"],
  ["ti", "tir"],
  ["to", "ton"],
  ["tn", "tsn"],
  ["ts", "tso"],
  ["tk", "tuk"],
  ["tr", "tur"],
  ["tw", "twi"],
  ["ug", "uig"],
  ["uk", "ukr"],
  ["ur", "urd"],
  ["uz", "uzb"],
  ["ve", "ven"],
  ["vi", "vie"],
  ["vo", "vol"],
  ["cy", "wel"],
  ["wa", "wln"],
  ["wo", "wol"],
  ["xh", "xho"],
  ["yi", "yid"],
  ["yo", "yor"],
  ["za", "zha"],
  ["zu", "zul"],
]);

/**
 * ISO-639-2/B/T -> ISO-639-1 language tag conversion table, based on
 * http://loc.gov/standards/iso639-2/ISO-639-2_utf-8.txt
 * contains conversions for all ISO-639-2-B or -T 3-letter codes
 * that may be converted to ISO 639-1 2-letter codes
 */
export const iso639_2_to_639_1: Map<string, string> = new Map([
  ["aar", "aa"],
  ["abk", "ab"],
  ["afr", "af"],
  ["aka", "ak"],
  ["alb", "sq"],
  ["amh", "am"],
  ["ara", "ar"],
  ["arg", "an"],
  ["arm", "hy"],
  ["asm", "as"],
  ["ava", "av"],
  ["ave", "ae"],
  ["aym", "ay"],
  ["aze", "az"],
  ["bak", "ba"],
  ["bam", "bm"],
  ["baq", "eu"],
  ["bel", "be"],
  ["ben", "bn"],
  ["bis", "bi"],
  ["bod", "bo"],
  ["bos", "bs"],
  ["bre", "br"],
  ["bul", "bg"],
  ["bur", "my"],
  ["cat", "ca"],
  ["ces", "cs"],
  ["cha", "ch"],
  ["che", "ce"],
  ["chi", "zh"],
  ["chu", "cu"],
  ["chv", "cv"],
  ["cor", "kw"],
  ["cos", "co"],
  ["cre", "cr"],
  ["cym", "cy"],
  ["cze", "cs"],
  ["dan", "da"],
  ["deu", "de"],
  ["div", "dv"],
  ["dut", "nl"],
  ["dzo", "dz"],
  ["ell", "el"],
  ["eng", "en"],
  ["epo", "eo"],
  ["est", "et"],
  ["eus", "eu"],
  ["ewe", "ee"],
  ["fao", "fo"],
  ["fas", "fa"],
  ["fij", "fj"],
  ["fin", "fi"],
  ["fra", "fr"],
  ["fre", "fr"],
  ["fry", "fy"],
  ["ful", "ff"],
  ["geo", "ka"],
  ["ger", "de"],
  ["gla", "gd"],
  ["gle", "ga"],
  ["glg", "gl"],
  ["glv", "gv"],
  ["gre", "el"],
  ["grn", "gn"],
  ["guj", "gu"],
  ["hat", "ht"],
  ["hau", "ha"],
  ["heb", "he"],
  ["her", "hz"],
  ["hin", "hi"],
  ["hmo", "ho"],
  ["hrv", "hr"],
  ["hun", "hu"],
  ["hye", "hy"],
  ["ibo", "ig"],
  ["ice", "is"],
  ["ido", "io"],
  ["iii", "ii"],
  ["iku", "iu"],
  ["ile", "ie"],
  ["ina", "ia"],
  ["ind", "id"],
  ["ipk", "ik"],
  ["isl", "is"],
  ["ita", "it"],
  ["jav", "jv"],
  ["jpn", "ja"],
  ["kal", "kl"],
  ["kan", "kn"],
  ["kas", "ks"],
  ["kat", "ka"],
  ["kau", "kr"],
  ["kaz", "kk"],
  ["khm", "km"],
  ["kik", "ki"],
  ["kin", "rw"],
  ["kir", "ky"],
  ["kom", "kv"],
  ["kon", "kg"],
  ["kor", "ko"],
  ["kua", "kj"],
  ["kur", "ku"],
  ["lao", "lo"],
  ["lat", "la"],
  ["lav", "lv"],
  ["lim", "li"],
  ["lin", "ln"],
  ["lit", "lt"],
  ["ltz", "lb"],
  ["lub", "lu"],
  ["lug", "lg"],
  ["mac", "mk"],
  ["mah", "mh"],
  ["mal", "ml"],
  ["mao", "mi"],
  ["mar", "mr"],
  ["may", "ms"],
  ["mkd", "mk"],
  ["mlg", "mg"],
  ["mlt", "mt"],
  ["mon", "mn"],
  ["mri", "mi"],
  ["msa", "ms"],
  ["mya", "my"],
  ["nau", "na"],
  ["nav", "nv"],
  ["nbl", "nr"],
  ["nde", "nd"],
  ["ndo", "ng"],
  ["nep", "ne"],
  ["nld", "nl"],
  ["nno", "nn"],
  ["nob", "nb"],
  ["nor", "no"],
  ["nya", "ny"],
  ["oci", "oc"],
  ["oji", "oj"],
  ["ori", "or"],
  ["orm", "om"],
  ["oss", "os"],
  ["pan", "pa"],
  ["per", "fa"],
  ["pli", "pi"],
  ["pol", "pl"],
  ["por", "pt"],
  ["pus", "ps"],
  ["que", "qu"],
  ["roh", "rm"],
  ["ron", "ro"],
  ["rum", "ro"],
  ["run", "rn"],
  ["rus", "ru"],
  ["sag", "sg"],
  ["san", "sa"],
  ["sin", "si"],
  ["slk", "sk"],
  ["slo", "sk"],
  ["slv", "sl"],
  ["sme", "se"],
  ["smo", "sm"],
  ["sna", "sn"],
  ["snd", "sd"],
  ["som", "so"],
  ["sot", "st"],
  ["spa", "es"],
  ["sqi", "sq"],
  ["srd", "sc"],
  ["srp", "sr"],
  ["ssw", "ss"],
  ["sun", "su"],
  ["swa", "sw"],
  ["swe", "sv"],
  ["tah", "ty"],
  ["tam", "ta"],
  ["tat", "tt"],
  ["tel", "te"],
  ["tgk", "tg"],
  ["tgl", "tl"],
  ["tha", "th"],
  ["tib", "bo"],
  ["tir", "ti"],
  ["ton", "to"],
  ["tsn", "tn"],
  ["tso", "ts"],
  ["tuk", "tk"],
  ["tur", "tr"],
  ["twi", "tw"],
  ["uig", "ug"],
  ["ukr", "uk"],
  ["urd", "ur"],
  ["uzb", "uz"],
  ["ven", "ve"],
  ["vie", "vi"],
  ["vol", "vo"],
  ["wel", "cy"],
  ["wln", "wa"],
  ["wol", "wo"],
  ["xho", "xh"],
  ["yid", "yi"],
  ["yor", "yo"],
  ["zha", "za"],
  ["zho", "zh"],
  ["zul", "zu"],
]);
