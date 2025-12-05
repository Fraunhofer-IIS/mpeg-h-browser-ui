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

import {
  LanguageNameConverter,
  iso639_1_to_639_2_B,
} from "../lib/LanguageTypes";

export const getDisplayName: LanguageNameConverter = (
  inputLang: string,
  outLabelLang?: string,
) => {
  let queryLang;
  if (!inputLang || inputLang.length < 2) {
    return undefined;
  }
  if (inputLang.length !== 3) {
    queryLang = iso639_1_to_639_2_B.get(inputLang.toLowerCase());
    if (!queryLang) return undefined;
  } else {
    queryLang = inputLang.toLowerCase();
  }

  // collect labels
  const queryLangLabels = LanguageNames.get(queryLang);
  if (!queryLangLabels) return undefined;

  // prio list
  const prioList = [1];
  if (!outLabelLang || outLabelLang.length < 2) {
    // use language of the input_language (endonym)
    prioList.push(4);
  } else if (outLabelLang.length !== 3) {
    outLabelLang = iso639_1_to_639_2_B.get(outLabelLang.substring(0, 2));
    if (!outLabelLang) {
      prioList.push(4);
    } else {
      switch (outLabelLang.toLowerCase()) {
        case queryLang:
          prioList.push(4);
          break;
        case "eng":
        case "enm":
        case "ang":
        case "cpe":
          prioList.push(1);
          break;
        case "fra":
        case "fre":
        case "frm":
        case "fro":
        case "cpf":
          prioList.push(2);
          break;
        case "ger":
        case "deu":
        case "gmh":
        case "goh":
        case "gsw":
        case "nds":
          prioList.push(3);
          break;
      }
    }
  }
  // get Language name of highest prio
  return queryLangLabels[prioList.pop()];
};

/**
 * Language names in English, French, German & ISO Codes according to https://www.loc.gov/standards/iso639-2/php/code_list.php (language names edited & shortened)
 * Endonyms according to https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes (CC BY-SA 4.0), slightly edited
 * Can also be used to convert ISO-639-2 code (3 letters) to ISO-639-1 code (2 letters)
 * ISO 639-2 Code,	[ISO 639-1 Code,	Language name in English,	Language name in French,  Language name in German,  Language name in native language (Endonym)]
 * Only the first language name is included
 */
const LanguageNames: Map<
  string,
  [string | undefined, string, string, string, string | undefined]
> = new Map([
  ["aar", ["aa", "Afar", "afar", "Danakil", "Qafaraf"]],
  ["abk", ["ab", "Abkhazian", "abkhaze", "Abchasisch", "Aƥsua bızšwa"]],
  ["ace", [" ", "Achinese", "aceh", "Aceh", "بهسا اچيه"]],
  ["ach", [" ", "Acoli", "acoli", "Acholi", "Lwo"]],
  ["ada", [" ", "Adangme", "adangme", "Adangme", "Dangme"]],
  ["ady", [" ", "Adyghe", "adyghé", "Adygisch", "Адыгабзэ"]],
  [
    "afa",
    [
      " ",
      "Afro-Asiatic languages",
      "afro-asiatiques, langues",
      "Hamitosemitische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["afh", [" ", "Afrihili", "afrihili", "Afrihili", "El-Afrihili"]],
  ["afr", ["af", "Afrikaans", "afrikaans", "Afrikaans", "Afrikaans"]],
  ["ain", [" ", "Ainu", "aïnou", "Ainu", "アイヌ・イタㇰ"]],
  ["aka", ["ak", "Akan", "akan", "Akan", "Akan"]],
  ["akk", [" ", "Akkadian", "akkadien", "Akkadisch", "𒀝𒅗𒁺𒌑"]],
  ["alb", ["sq", "Albanian", "albanais", "Albanisch", "Shqip"]],
  ["ale", [" ", "Aleut", "aléoute", "Aleutisch", "Унáӈам тунуý"]],
  [
    "alg",
    [
      " ",
      "Algonquian languages",
      "algonquines, langues",
      "Algonkin-Sprachen (Andere)",
      undefined,
    ],
  ],
  ["alt", [" ", "Southern Altai", "altai du Sud", "Altaisch", "Алтай тили"]],
  ["amh", ["am", "Amharic", "amharique", "Amharisch", "አማርኛ"]],
  [
    "ang",
    [
      " ",
      "English, Old (ca.450-1100)",
      "anglo-saxon (ca.450-1100)",
      "Altenglisch",
      "Ænglisc",
    ],
  ],
  ["anp", [" ", "Angika", "angika", "Anga", "अंगिका"]],
  [
    "apa",
    [
      " ",
      "Apache languages",
      "apaches, langues",
      "Apachen-Sprachen",
      undefined,
    ],
  ],
  ["ara", ["ar", "Arabic", "arabe", "Arabisch", "العربية"]],
  [
    "arc",
    [
      " ",
      "Official Aramaic (700-300 BCE)",
      "araméen d'empire (700-300 BCE)",
      "Aramäisch",
      undefined,
    ],
  ],
  ["arg", ["an", "Aragonese", "aragonais", "Aragonesisch", "Aragonés"]],
  ["arm", ["hy", "Armenian", "arménien", "Armenisch", "Հայերէն"]],
  ["arn", [" ", "Mapudungun", "mapudungun", "Arauka-Sprachen", "Mapudungun"]],
  ["arp", [" ", "Arapaho", "arapaho", "Arapaho", "Hinónoʼeitíít"]],
  [
    "art",
    [
      " ",
      "Artificial languages",
      "artificielles, langues",
      "Kunstsprachen (Andere)",
      undefined,
    ],
  ],
  ["arw", [" ", "Arawak", "arawak", "Arawak-Sprachen", "Lokono"]],
  ["asm", ["as", "Assamese", "assamais", "Assamesisch", "অসমীয়া"]],
  ["ast", [" ", "Asturian", "asturien", "Asturisch", "Asturianu"]],
  [
    "ath",
    [
      " ",
      "Athapascan languages",
      "athapascanes, langues",
      "Athapaskische Sprachen (Andere)",
      undefined,
    ],
  ],
  [
    "aus",
    [
      " ",
      "Australian languages",
      "australiennes, langues",
      "Australische Sprachen",
      undefined,
    ],
  ],
  ["ava", ["av", "Avaric", "avar", "Awarisch", "Авар мацӏ"]],
  ["ave", ["ae", "Avestan", "avestique", "Avestisch", undefined]],
  ["awa", [" ", "Awadhi", "awadhi", "Awadhi", "अवधी"]],
  ["aym", ["ay", "Aymara", "aymara", "Aymará", "Aymar aru"]],
  [
    "aze",
    ["az", "Azerbaijani", "azéri", "Aserbeidschanisch", "Azərbaycan dili"],
  ],
  [
    "bad",
    [
      " ",
      "Banda languages",
      "banda, langues",
      "Banda-Sprachen (Ubangi-Sprachen)",
      undefined,
    ],
  ],
  [
    "bai",
    [
      " ",
      "Bamileke languages",
      "bamiléké, langues",
      "Bamileke-Sprachen",
      "Bamiléké",
    ],
  ],
  ["bak", ["ba", "Bashkir", "bachkir", "Baschkirisch", "Башҡорт теле"]],
  ["bal", [" ", "Baluchi", "baloutchi", "Belutschisch", "بلوچی"]],
  ["bam", ["bm", "Bambara", "bambara", "Bambara", "ߓߡߊߣߊ߲ߞߊ߲"]],
  ["ban", [" ", "Balinese", "balinais", "Balinesisch", "ᬪᬵᬱᬩᬮᬶ"]],
  ["baq", ["eu", "Basque", "basque", "Baskisch", "Euskara"]],
  ["bas", [" ", "Basa", "basa", "Basaa", "Mbene"]],
  [
    "bat",
    [
      " ",
      "Baltic languages",
      "baltes, langues",
      "Baltische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["bej", [" ", "Beja", "bedja", "Bedauye", "Bidhaawyeet"]],
  [
    "bel",
    ["be", "Belarusian", "biélorusse", "Weißrussisch", "Беларуская мова"],
  ],
  ["bem", [" ", "Bemba", "bemba", "Bemba", "Chibemba"]],
  ["ben", ["bn", "Bengali", "bengali", "Bengali", "বাংলা"]],
  [
    "ber",
    [
      " ",
      "Berber languages",
      "berbères, langues",
      "Berbersprachen (Andere)",
      "ⵜⴰⵎⴰⵣⵉⵖⵜ",
    ],
  ],
  ["bho", [" ", "Bhojpuri", "bhojpuri", "Bhojpuri", "भोजपुरी"]],
  [
    "bih",
    [" ", "Bihari languages", "langues biharis", "Bihari (Andere)", undefined],
  ],
  ["bik", [" ", "Bikol", "bikol", "Bikol", "Bikol"]],
  ["bin", [" ", "Bini", "bini", "Edo", "Ẹ̀dó"]],
  ["bis", ["bi", "Bislama", "bichlamar", "Beach-la-mar", "Bislama"]],
  ["bla", [" ", "Siksika", "blackfoot", "Blackfoot", "ᓱᖽᐧᖿ"]],
  [
    "bnt",
    [
      " ",
      "Bantu languages",
      "bantou, langues",
      "Bantusprachen (Andere)",
      undefined,
    ],
  ],
  ["bod", ["bo", "Tibetan", "tibétain", "Tibetisch", "བོད་སྐད་"]],
  ["bos", ["bs", "Bosnian", "bosniaque", "Bosnisch", "Bosanski"]],
  ["bra", [" ", "Braj", "braj", "Braj-Bhakha", "ब्रजभाषा"]],
  ["bre", ["br", "Breton", "breton", "Bretonisch", "Brezhoneg"]],
  ["btk", [" ", "Batak languages", "batak, langues", "Batak", undefined]],
  ["bua", [" ", "Buriat", "bouriate", "Burjatisch", "буряад хэлэн"]],
  ["bug", [" ", "Buginese", "bugi", "Bugi", "ᨅᨔ ᨕᨘᨁᨗ"]],
  ["bul", ["bg", "Bulgarian", "bulgare", "Bulgarisch", "български"]],
  ["bur", ["my", "Burmese", "birman", "Birmanisch", "မြန်မာစာ"]],
  ["byn", [" ", "Blin", "blin", "Bilin", "ብሊና"]],
  ["cad", [" ", "Caddo", "caddo", "Caddo", "Hasí:nay"]],
  [
    "cai",
    [
      " ",
      "Indigenous Central American languages",
      "langues autochtones d'Amérique centrale",
      "Indigene Sprachen Mittelamerikas",
      undefined,
    ],
  ],
  ["car", [" ", "Galibi Carib", "karib", "Karibische Sprachen", "Kari'nja"]],
  ["cat", ["ca", "Catalan", "catalan", "Katalanisch", "Català"]],
  [
    "cau",
    [
      " ",
      "Caucasian languages",
      "caucasiennes, langues",
      "Kaukasische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["ceb", [" ", "Cebuano", "cebuano", "Cebuano", "Sinugboanon"]],
  [
    "cel",
    [
      " ",
      "Celtic languages",
      "celtiques, langues",
      "Keltische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["ces", ["cs", "Czech", "tchèque", "Tschechisch", "Čeština"]],
  ["cha", ["ch", "Chamorro", "chamorro", "Chamorro", "Finu' Chamoru"]],
  ["chb", [" ", "Chibcha", "chibcha", "Chibcha", "Muysccubun"]],
  ["che", ["ce", "Chechen", "tchétchène", "Tschetschenisch", "Нохчийн мотт"]],
  ["chg", [" ", "Chagatai", "djaghataï", "Tschagataisch", "جغتای"]],
  ["chi", ["zh", "Chinese", "chinois", "Chinesisch", "中文"]],
  ["chk", [" ", "Chuukese", "chuuk", "Trukesisch", "Chuukese"]],
  ["chm", [" ", "Mari", "mari", "Tscheremissisch", "марий йылме"]],
  [
    "chn",
    [" ", "Chinook jargon", "chinook, jargon", "Chinook-Jargon", "Chinuk wawa"],
  ],
  ["cho", [" ", "Choctaw", "choctaw", "Choctaw", "Chahta'"]],
  ["chp", [" ", "Chipewyan", "chipewyan", "Chipewyan", "ᑌᓀᓱᒼᕄᓀ"]],
  ["chr", [" ", "Cherokee", "cherokee", "Cherokee", "ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ"]],
  [
    "chu",
    [
      "cu",
      "Church Slavic",
      "slavon d'église",
      "Kirchenslawisch",
      "Славе́нскїй ѧ҆зы́къ",
    ],
  ],
  ["chv", ["cv", "Chuvash", "tchouvache", "Tschuwaschisch", "Чӑвашла"]],
  ["chy", [" ", "Cheyenne", "cheyenne", "Cheyenne", "Tsėhésenėstsestȯtse"]],
  [
    "cmc",
    [" ", "Chamic languages", "chames, langues", "Cham-Sprachen", undefined],
  ],
  ["cnr", [" ", "Montenegrin", "monténégrin", "Montenegrinisch", "Црногорски"]],
  ["cop", [" ", "Coptic", "copte", "Koptisch", "ϯⲙⲉⲑⲣⲉⲙⲛ̀ⲭⲏⲙⲓ"]],
  ["cor", ["kw", "Cornish", "cornique", "Kornisch", "Kernowek"]],
  ["cos", ["co", "Corsican", "corse", "Korsisch", "Corsu"]],
  [
    "cpe",
    [
      " ",
      "Creoles and pidgins, English based",
      "créoles et pidgins basés sur l'anglais",
      "Kreolisch-Englisch (Andere)",
      undefined,
    ],
  ],
  [
    "cpf",
    [
      " ",
      "Creoles and pidgins, French-based",
      "créoles et pidgins basés sur le français",
      "Kreolisch-Französisch (Andere)",
      undefined,
    ],
  ],
  [
    "cpp",
    [
      " ",
      "Creoles and pidgins, Portuguese-based",
      "créoles et pidgins basés sur le portugais",
      "Kreolisch-Portugiesisch (Andere)",
      undefined,
    ],
  ],
  ["cre", ["cr", "Cree", "cree", "Cree", "ᓀᐦᐃᔭᐍᐏᐣ"]],
  [
    "crh",
    [" ", "Crimean Tatar", "tatar de Crimé", "Krimtatarisch", "Къырымтатарджа"],
  ],
  [
    "crp",
    [
      " ",
      "Creoles and pidgins",
      "créoles et pidgins",
      "Kreolische- & Pidginsprachen",
      undefined,
    ],
  ],
  ["csb", [" ", "Kashubian", "kachoube", "Kaschubisch", "Kaszëbsczi jãzëk"]],
  [
    "cus",
    [
      " ",
      "Cushitic languages",
      "couchitiques, langues",
      "Kuschitische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["cym", ["cy", "Welsh", "gallois", "Kymrisch", "Cymraeg"]],
  ["cze", ["cs", "Czech", "tchèque", "Tschechisch", "Čeština"]],
  ["dak", [" ", "Dakota", "dakota", "Dakota", "Dakhótiyapi"]],
  ["dan", ["da", "Danish", "danois", "Dänisch", "Dansk"]],
  ["dar", [" ", "Dargwa", "dargwa", "Darginisch", "дарган мез"]],
  [
    "day",
    [" ", "Land Dayak languages", "dayak, langues", "Dajakisch", undefined],
  ],
  ["del", [" ", "Delaware", "delaware", "Delaware", "Lënapei èlixsuwakàn"]],
  [
    "den",
    [" ", "Slave (Athapascan)", "esclave (athapascan)", "Slave", "Dene K'e"],
  ],
  ["deu", ["de", "German", "allemand", "Deutsch", "Deutsch"]],
  ["dgr", [" ", "Tlicho", "tlicho", "Tlicho", "Tłįchǫ Yatiì"]],
  ["din", [" ", "Dinka", "dinka", "Dinka", "Thuɔŋjäŋ"]],
  ["div", ["dv", "Divehi", "maldivien", "Maledivisch", "ދިވެހި; ދިވެހިބަސް"]],
  ["doi", [" ", "Dogri (macrolanguage)", "dogri", "Dogri", "𑠖𑠵𑠌𑠤𑠮"]],
  [
    "dra",
    [
      " ",
      "Dravidian languages",
      "dravidiennes, langues",
      "Drawidische Sprachen (Andere)",
      undefined,
    ],
  ],
  [
    "dsb",
    [" ", "Lower Sorbian", "bas-sorabe", "Niedersorbisch", "Dolnoserbski"],
  ],
  ["dua", [" ", "Duala", "douala", "Duala-Sprachen", "Duálá"]],
  [
    "dum",
    [
      " ",
      "Dutch, Middle (ca.1050-1350)",
      "néerlandais moyen (ca. 1050-1350)",
      "Mittelniederländisch",
      undefined,
    ],
  ],
  ["dut", ["nl", "Dutch", "néerlandais", "Niederländisch", "Nederlands"]],
  ["dyu", [" ", "Dyula", "dioula", "Dyula", "Julakan"]],
  ["dzo", ["dz", "Dzongkha", "dzongkha", "Dzongkha", "རྫོང་ཁ་"]],
  ["efi", [" ", "Efik", "efik", "Efik", "Usem Efịk"]],
  ["egy", [" ", "Egyptian (Ancient)", "égyptien", "Ägyptisch", undefined]],
  ["eka", [" ", "Ekajuk", "ekajuk", "Ekajuk", "Ekajuk"]],
  [
    "ell",
    [
      "el",
      "Modern Greek (1453-)",
      "grec moderne (1453-)",
      "Neugriechisch",
      "Νέα Ελληνικά",
    ],
  ],
  ["elx", [" ", "Elamite", "élamite", "Elamisch", undefined]],
  ["eng", ["en", "English", "anglais", "Englisch", "English"]],
  [
    "enm",
    [
      " ",
      "English, Middle (1100-1500)",
      "anglais moyen (1100-1500)",
      "Mittelenglisch",
      undefined,
    ],
  ],
  ["epo", ["eo", "Esperanto", "espéranto", "Esperanto", "Esperanto"]],
  ["est", ["et", "Estonian", "estonien", "Estnisch", "Eesti keel"]],
  ["eus", ["eu", "Basque", "basque", "Baskisch", "Euskara"]],
  ["ewe", ["ee", "Ewe", "éwé", "Ewe", "Èʋegbe"]],
  ["ewo", [" ", "Ewondo", "éwondo", "Ewondo", "Ewondo"]],
  ["fan", [" ", "Fang", "fang", "Pangwe", "Fang"]],
  ["fao", ["fo", "Faroese", "féroïen", "Färöisch", "Føroyskt"]],
  ["fas", ["fa", "Persian", "persan", "Persisch", "فارسی"]],
  ["fat", [" ", "Fanti", "fanti", "Fante", "Mfantse"]],
  ["fij", ["fj", "Fijian", "fidjien", "Fidschi", "Na Vosa Vakaviti"]],
  ["fil", [" ", "Filipino", "filipino", "Pilipino", "Wikang Filipino"]],
  ["fin", ["fi", "Finnish", "finnois", "Finnisch", "suomi"]],
  [
    "fiu",
    [
      " ",
      "Finno-Ugrian languages",
      "finno-ougriennes, langues",
      "Finnougrische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["fon", [" ", "Fon", "fon", "Fon", "Fon gbè"]],
  ["fra", ["fr", "French", "français", "Französisch", "Français"]],
  ["fre", ["fr", "French", "français", "Französisch", "Français"]],
  [
    "frm",
    [
      " ",
      "French, Middle (ca.1400-1600)",
      "français moyen (1400-1600)",
      "Mittelfranzösisch",
      "françois",
    ],
  ],
  [
    "fro",
    [
      " ",
      "French, Old (842-ca.1400)",
      "français ancien (842-ca.1400)",
      "Altfranzösisch",
      "Franceis",
    ],
  ],
  [
    "frr",
    [
      " ",
      "Northern Frisian",
      "frison septentrional",
      "Nordfriesisch",
      "Frasch",
    ],
  ],
  [
    "frs",
    [" ", "Eastern Frisian", "frison oriental", "Ostfriesisch", "Oostfräsk"],
  ],
  ["fry", ["fy", "Western Frisian", "frison occidental", "Friesisch", "Frysk"]],
  ["ful", ["ff", "Fulah", "peul", "Ful", "Fulfulde"]],
  ["fur", [" ", "Friulian", "frioulan", "Friulisch", "Furlan"]],
  ["gaa", [" ", "Ga", "ga", "Ga", "Gã"]],
  ["gay", [" ", "Gayo", "gayo", "Gayo", "Basa Gayo"]],
  ["gba", [" ", "Gbaya", "gbaya", "Gbaya", "Gbaya"]],
  [
    "gem",
    [
      " ",
      "Germanic languages",
      "germaniques, langues",
      "Germanische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["geo", ["ka", "Georgian", "géorgien", "Georgisch", "ქართული"]],
  ["ger", ["de", "German", "allemand", "Deutsch", "Deutsch"]],
  ["gez", [" ", "Geez", "guèze", "Altäthiopisch", "ግዕዝ"]],
  [
    "gil",
    [" ", "Gilbertese", "kiribati", "Gilbertesisch", "Taetae ni Kiribati"],
  ],
  ["gla", ["gd", "Gaelic", "gaélique", "Gälisch-Schottisch", "Gàidhlig"]],
  ["gle", ["ga", "Irish", "irlandais", "Irisch", "Gaeilge"]],
  ["glg", ["gl", "Galician", "galicien", "Galicisch", "galego"]],
  ["glv", ["gv", "Manx", "manx", "Manx", "Gaelg"]],
  [
    "gmh",
    [
      " ",
      "German, Middle High (ca.1050-1500)",
      "allemand, moyen haut (ca. 1050-1500)",
      "Mittelhochdeutsch",
      "Diutsch",
    ],
  ],
  [
    "goh",
    [
      " ",
      "German, Old High (ca.750-1050)",
      "allemand, vieux haut (ca. 750-1050)",
      "Althochdeutsch",
      "Diutisk",
    ],
  ],
  ["gon", [" ", "Gondi", "gond", "Gondi", "गोण्डि"]],
  [
    "gor",
    [" ", "Gorontalo", "gorontalo", "Gorontalesisch", "Bahasa Hulontalo"],
  ],
  ["got", [" ", "Gothic", "gothique", "Gotisch", "Gutiska"]],
  ["grb", [" ", "Grebo", "grebo", "Grebo", "Kréébo"]],
  [
    "grc",
    [
      " ",
      "Greek, Ancient (to 1453)",
      "grec ancien (jusqu'à 1453)",
      "Griechisch",
      "Ἑλληνική",
    ],
  ],
  [
    "gre",
    [
      "el",
      "Modern Greek (1453-)",
      "grec moderne (1453-)",
      "Neugriechisch",
      "Νέα Ελληνικά",
    ],
  ],
  ["grn", ["gn", "Guarani", "guarani", "Guaraní", "Avañe'ẽ"]],
  [
    "gsw",
    [
      " ",
      "Swiss German",
      "suisse alémanique",
      "Schweizerdeutsch",
      "Schwiizerdütsch",
    ],
  ],
  ["guj", ["gu", "Gujarati", "goudjrati", "Gujarati", "ગુજરાતી"]],
  ["gwi", [" ", "Gwich'in", "gwich'in", "Kutchin", "Dinjii Zhu’ Ginjik"]],
  ["hai", [" ", "Haida", "haida", "Haida", "X̱aat Kíl"]],
  [
    "hat",
    ["ht", "Haitian", "haïtien", "Haïtien (Haiti-Kreolisch)", "Kreyòl Ayisyen"],
  ],
  ["hau", ["ha", "Hausa", "haoussa", "Hausa", "Harshen Hausa"]],
  ["haw", [" ", "Hawaiian", "hawaïen", "Hawaiisch", "ʻŌlelo Hawaiʻi"]],
  ["heb", ["he", "Hebrew", "hébreu", "Hebräisch", "עברית"]],
  ["her", ["hz", "Herero", "herero", "Herero", "Otjiherero"]],
  ["hil", [" ", "Hiligaynon", "hiligaynon", "Hiligaynon", "Ilonggo"]],
  [
    "him",
    [
      " ",
      "Himachali languages",
      "langues himachalis",
      "Himachali",
      "पश्चिमी पहाड़ी",
    ],
  ],
  ["hin", ["hi", "Hindi", "hindi", "Hindi", "हिन्दी"]],
  ["hit", [" ", "Hittite", "hittite", "Hethitisch", "𒉈𒅆𒇷"]],
  ["hmn", [" ", "Hmong", "hmong", "Miao-Sprachen", "lus Hmoob"]],
  ["hmo", ["ho", "Hiri Motu", "hiri motu", "Hiri-Motu", "Police Motu"]],
  ["hrv", ["hr", "Croatian", "croate", "Kroatisch", "Hrvatski"]],
  [
    "hsb",
    [" ", "Upper Sorbian", "haut-sorabe", "Obersorbisch", "Hornjoserbšćina"],
  ],
  ["hun", ["hu", "Hungarian", "hongrois", "Ungarisch", "Magyar"]],
  ["hup", [" ", "Hupa", "hupa", "Hupa", "Na:tinixwe"]],
  ["hye", ["hy", "Armenian", "arménien", "Armenisch", "Հայերէն"]],
  ["iba", [" ", "Iban", "iban", "Iban", "Jaku Iban"]],
  ["ibo", ["ig", "Igbo", "igbo", "Ibo", "Asụsụ Igbo"]],
  ["ice", ["is", "Icelandic", "islandais", "Isländisch", "íslenska"]],
  ["ido", ["io", "Ido", "ido", "Ido", undefined]],
  ["iii", ["ii", "Sichuan Yi", "yi de Sichuan", "Lalo", "ꆈꌠꉙ"]],
  ["ijo", [" ", "Ijo languages", "ijo, langues", "Ijo", "Ịjọ"]],
  ["iku", ["iu", "Inuktitut", "inuktitut", "Inuktitut", "ᐃᓄᒃᑎᑐᑦ"]],
  ["ile", ["ie", "Interlingue", "interlingue", "Interlingue", undefined]],
  ["ilo", [" ", "Iloko", "ilocano", "Ilokano", "Ilokano"]],
  [
    "ina",
    [
      "ia",
      "Interlingua (International Auxiliary Language Association)",
      "interlingua (langue auxiliaire internationale)",
      "Interlingua",
      undefined,
    ],
  ],
  [
    "inc",
    [
      " ",
      "Indic languages",
      "indo-aryennes, langues",
      "Indoarische Sprachen (Andere)",
      undefined,
    ],
  ],
  [
    "ind",
    ["id", "Indonesian", "indonésien", "Bahasa Indonesia", "Bahasa Indonesia"],
  ],
  [
    "ine",
    [
      " ",
      "Indo-European languages",
      "indo-européennes, langues",
      "Indogermanische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["inh", [" ", "Ingush", "ingouche", "Inguschisch", "ГӀалгӀай мотт"]],
  ["ipk", ["ik", "Inupiaq", "inupiaq", "Inupik", "Iñupiaq"]],
  [
    "ira",
    [
      " ",
      "Iranian languages",
      "iraniennes, langues",
      "Iranische Sprachen (Andere)",
      undefined,
    ],
  ],
  [
    "iro",
    [
      " ",
      "Iroquoian languages",
      "iroquoises, langues",
      "Irokesische Sprachen",
      undefined,
    ],
  ],
  ["isl", ["is", "Icelandic", "islandais", "Isländisch", "Íslenska"]],
  ["ita", ["it", "Italian", "italien", "Italienisch", "Italiano"]],
  ["jav", ["jv", "Javanese", "javanais", "Javanisch", "ꦧꦱꦗꦮ"]],
  ["jbo", [" ", "Lojban", "lojban", "Lojban", "la .lojban"]],
  ["jpn", ["ja", "Japanese", "japonais", "Japanisch", "日本語"]],
  ["jpr", [" ", "Judeo-Persian", "judéo-persan", "Jüdisch-Persisch", "Dzhidi"]],
  [
    "jrb",
    [" ", "Judeo-Arabic", "judéo-arabe", "Jüdisch-Arabisch", "ערבית יהודית"],
  ],
  [
    "kaa",
    [" ", "Kara-Kalpak", "karakalpak", "Karakalpakisch", "Qaraqalpaq tili"],
  ],
  ["kab", [" ", "Kabyle", "kabyle", "Kabylisch", "Tamaziɣt Taqbaylit"]],
  ["kac", [" ", "Kachin", "kachin", "Kachin", "Jingpho"]],
  ["kal", ["kl", "Kalaallisut", "groenlandais", "Grönländisch", "Kalaallisut"]],
  ["kam", [" ", "Kamba", "kamba", "Kamba", "Kikamba"]],
  ["kan", ["kn", "Kannada", "kannada", "Kannada", "ಕನ್ನಡ"]],
  ["kar", [" ", "Karen languages", "karen, langues", "Karenisch", undefined]],
  ["kas", ["ks", "Kashmiri", "kashmiri", "Kaschmiri", "कॉशुर"]],
  ["kat", ["ka", "Georgian", "géorgien", "Georgisch", "ქართული"]],
  ["kau", ["kr", "Kanuri", "kanouri", "Kanuri", "Kànùrí"]],
  ["kaw", [" ", "Kawi", "kawi", "Kawi", "ꦧꦱꦗꦮ"]],
  ["kaz", ["kk", "Kazakh", "kazakh", "Kasachisch", "қазақ тілі"]],
  ["kbd", [" ", "Kabardian", "kabardien", "Kabardinisch", "Адыгэбзэ"]],
  ["kha", [" ", "Khasi", "khasi", "Khasi", "কা কতিয়েন খাশি"]],
  [
    "khi",
    [
      " ",
      "Khoisan languages",
      "khoïsan, langues",
      "Khoisan-Sprachen (Andere)",
      undefined,
    ],
  ],
  [
    "khm",
    ["km", "Central Khmer", "khmer central", "Kambodschanisch", "ភាសាខ្មែរ"],
  ],
  ["kho", [" ", "Khotanese", "khotanais", "Sakisch", undefined]],
  ["kik", ["ki", "Kikuyu", "kikuyu", "Kikuyu", "Gĩkũyũ"]],
  ["kin", ["rw", "Kinyarwanda", "rwanda", "Rwanda", "Ikinyarwanda"]],
  ["kir", ["ky", "Kirghiz", "kirghiz", "Kirgisisch", "кыргызча"]],
  ["kmb", [" ", "Kimbundu", "kimbundu", "Kimbundu", "Kimbundu"]],
  ["kok", [" ", "Konkani (macrolanguage)", "konkani", "Konkani", "कोंकणी"]],
  ["kom", ["kv", "Komi", "kom", "Komi", "Коми кыв"]],
  ["kon", ["kg", "Kongo", "kongo", "Kongo", "Kikongo"]],
  ["kor", ["ko", "Korean", "coréen", "Koreanisch", "한국어"]],
  ["kos", [" ", "Kosraean", "kosrae", "Kosraeanisch", "Kosraean"]],
  ["kpe", [" ", "Kpelle", "kpellé", "Kpelle", "Kpɛlɛwoo"]],
  [
    "krc",
    [
      " ",
      "Karachay-Balkar",
      "karatchai balkar",
      "Karatschaiisch-Balkarisch",
      "Къарачай-Малкъар тил",
    ],
  ],
  ["krl", [" ", "Karelian", "carélien", "Karelisch", "Kard'al"]],
  [
    "kro",
    [" ", "Kru languages", "krou, langues", "Kru-Sprachen (Andere)", undefined],
  ],
  ["kru", [" ", "Kurukh", "kurukh", "Oraon", "कुड़ुख़"]],
  ["kua", ["kj", "Kuanyama", "kuanyama", "Kwanyama", "Oshikwanyama"]],
  ["kum", [" ", "Kumyk", "koumyk", "Kumükisch", "къумукъ тил"]],
  ["kur", ["ku", "Kurdish", "kurde", "Kurdisch", "کوردی"]],
  ["kut", [" ", "Kutenai", "kutenai", "Kutenai", "Ktunaxa"]],
  ["lad", [" ", "Ladino", "judéo-espagnol", "Judenspanisch", "Judeo-español"]],
  ["lah", [" ", "Lahnda", "lahnda", "Lahnda", "بھارت کا"]],
  ["lam", [" ", "Lamba", "lamba", "Lamba", "Ichilamba"]],
  ["lao", ["lo", "Lao", "lao", "Laotisch", "ພາສາລາວ"]],
  ["lat", ["la", "Latin", "latin", "Latein", "Lingua latīna"]],
  ["lav", ["lv", "Latvian", "letton", "Lettisch", "Latviešu valoda"]],
  ["lez", [" ", "Lezghian", "lezghien", "Lesgisch", "Лезги чӏал"]],
  ["lim", ["li", "Limburgan", "limbourgeois", "Limburgisch", "Lèmburgs"]],
  ["lin", ["ln", "Lingala", "lingala", "Lingala", "Lingála"]],
  ["lit", ["lt", "Lithuanian", "lituanien", "Litauisch", "lietuvių kalba"]],
  ["lol", [" ", "Mongo", "mongo", "Mongo", "Lomongo"]],
  ["loz", [" ", "Lozi", "lozi", "Rotse", "Silozi"]],
  [
    "ltz",
    [
      "lb",
      "Luxembourgish",
      "luxembourgeois",
      "Luxemburgisch",
      "Lëtzebuergesch",
    ],
  ],
  ["lua", [" ", "Luba-Lulua", "luba-lulua", "Lulua", "Cilubà"]],
  ["lub", ["lu", "Luba-Katanga", "luba-katanga", "Luba-Katanga", "Kiluba"]],
  ["lug", ["lg", "Ganda", "ganda", "Ganda", "Luganda"]],
  ["lui", [" ", "Luiseno", "luiseno", "Luiseño", "Cham'teela"]],
  ["lun", [" ", "Lunda", "lunda", "Lunda", "Chilunda"]],
  [
    "luo",
    [
      " ",
      "Luo (Kenya and Tanzania)",
      "luo (Kenya et Tanzanie)",
      "Luo",
      "Dholuo",
    ],
  ],
  ["lus", [" ", "Lushai", "lushai", "Lushai", "Mizo ṭawng"]],
  [
    "mac",
    ["mk", "Macedonian", "macédonien", "Makedonisch", "Македонски јазик"],
  ],
  ["mad", [" ", "Madurese", "madourais", "Maduresisch", "Madhura"]],
  ["mag", [" ", "Magahi", "magahi", "Khotta", "मगही"]],
  ["mah", ["mh", "Marshallese", "marshall", "Marschallesisch", "Kajin M̧ajeļ"]],
  ["mai", [" ", "Maithili", "maithili", "Maithili", "मैथिली"]],
  ["mak", [" ", "Makasar", "makassar", "Makassarisch", "ᨅᨔ ᨆᨀᨔᨑ"]],
  ["mal", ["ml", "Malayalam", "malayalam", "Malayalam", "മലയാളം"]],
  ["man", [" ", "Mandingo", "mandingue", "Malinke", "Mandi'nka kango"]],
  ["mao", ["mi", "Maori", "maori", "Maori", "Te Reo Māori"]],
  [
    "map",
    [
      " ",
      "Austronesian languages",
      "austronésiennes, langues",
      "Austronesische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["mar", ["mr", "Marathi", "marathe", "Marathi", "मराठी"]],
  ["mas", [" ", "Masai", "massaï", "Massai", "ɔl Maa"]],
  [
    "may",
    ["ms", "Malay (macrolanguage)", "malais", "Malaiisch", "Bahasa Melayu"],
  ],
  ["mdf", [" ", "Moksha", "moksa", "Mokscha", "Мокшень кяль"]],
  ["mdr", [" ", "Mandar", "mandar", "Mandaresisch", "Mandar"]],
  ["men", [" ", "Mende", "mendé", "Mende", "Mɛnde yia"]],
  [
    "mga",
    [
      " ",
      "Irish, Middle (900-1200)",
      "irlandais moyen (900-1200)",
      "Mittelirisch",
      "Gaoidhealg",
    ],
  ],
  ["mic", [" ", "Mi'kmaq", "mi'kmaq", "Micmac", "Míkmawísimk"]],
  ["min", [" ", "Minangkabau", "minangkabau", "Minangkabau", "Baso Minang"]],
  [
    "mis",
    [" ", "Uncoded language", "langage non codé", "Andere Sprache", undefined],
  ],
  [
    "mkd",
    ["mk", "Macedonian", "macédonien", "Makedonisch", "Македонски јазик"],
  ],
  [
    "mkh",
    [
      " ",
      "Mon-Khmer languages",
      "môn-khmer, langues",
      "Mon-Khmer-Sprachen (Andere)",
      undefined,
    ],
  ],
  ["mlg", ["mg", "Malagasy", "malgache", "Malagassi", "مَلَغَسِ"]],
  ["mlt", ["mt", "Maltese", "maltais", "Maltesisch", "Malti"]],
  ["mnc", [" ", "Manchu", "mandchou", "Mandschurisch", "ᠮᠠᠨᠵᡠ ᡤᡳᠰᡠᠨ"]],
  ["mni", [" ", "Manipuri", "manipuri", "Meithei", "মৈতৈলোন"]],
  [
    "mno",
    [" ", "Manobo languages", "manobo, langues", "Manobo-Sprachen", undefined],
  ],
  ["moh", [" ", "Mohawk", "mohawk", "Mohawk", "Kanien’kéha"]],
  ["mon", ["mn", "Mongolian", "mongol", "Mongolisch", "ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ"]],
  ["mos", [" ", "Mossi", "moré", "Mossi", "Mooré"]],
  ["mri", ["mi", "Maori", "maori", "Maori", "Te Reo Māori"]],
  [
    "msa",
    ["ms", "Malay (macrolanguage)", "malais", "Malaiisch", "Bahasa Melayu"],
  ],
  [
    "mul",
    [" ", "Multiple languages", "multilingue", "Mehrere Sprachen", undefined],
  ],
  [
    "mun",
    [
      " ",
      "Munda languages",
      "mounda, langues",
      "Mundasprachen (Andere)",
      undefined,
    ],
  ],
  ["mus", [" ", "Creek", "muskogee", "Muskogisch", "Mvskoke"]],
  ["mwl", [" ", "Mirandese", "mirandais", "Mirandesisch", "Mirandés"]],
  ["mwr", [" ", "Marwari", "marvari", "Marwari", "मारवाड़ी"]],
  ["mya", ["my", "Burmese", "birman", "Birmanisch", "မြန်မာစာ"]],
  [
    "myn",
    [" ", "Mayan languages", "maya, langues", "Maya-Sprachen", undefined],
  ],
  ["myv", [" ", "Erzya", "erza", "Erza-Mordwinisch", "Ерзянь кель"]],
  ["nah", [" ", "Nahuatl languages", "nahuatl, langues", "Nahuatl", undefined]],
  [
    "nai",
    [
      " ",
      "Indigenous North American languages",
      "langues autochtones d'Amérique du Nord",
      "Indigene Sprachen Nordamerikas",
      undefined,
    ],
  ],
  ["nap", [" ", "Neapolitan", "napolitain", "Neapel / Mundart", "Napulitano"]],
  ["nau", ["na", "Nauru", "nauruan", "Nauruanisch", "dorerin Naoero"]],
  ["nav", ["nv", "Navajo", "navaho", "Navajo", "Diné bizaad"]],
  [
    "nbl",
    [
      "nr",
      "South Ndebele",
      "ndébélé du Sud",
      "Ndebele (Transvaal)",
      "isiNdebele seSewula",
    ],
  ],
  [
    "nde",
    [
      "nd",
      "North Ndebele",
      "ndébélé du Nord",
      "Ndebele (Simbabwe)",
      "siNdebele saseNyakatho",
    ],
  ],
  ["ndo", ["ng", "Ndonga", "ndonga", "Ndonga", "Ndonga"]],
  ["nds", [" ", "Low German", "bas allemand", "Niederdeutsch", "Plattdütsch"]],
  ["nep", ["ne", "Nepali (macrolanguage)", "népalais", "Nepali", "नेपाली"]],
  ["new", [" ", "Nepal Bhasa", "nepal bhasa", "Newari", "नेपाल भाषा"]],
  ["nia", [" ", "Nias", "nias", "Nias", "Li Niha"]],
  [
    "nic",
    [
      " ",
      "Niger-Kordofanian languages",
      "nigéro-kordofaniennes, langues",
      "Nigerkordofanische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["niu", [" ", "Niuean", "niué", "Niue", "ko e vagahau Niuē"]],
  ["nld", ["nl", "Dutch", "néerlandais", "Niederländisch", "Nederlands"]],
  [
    "nno",
    [
      "nn",
      "Norwegian Nynorsk",
      "norvégien nynorsk",
      "Nynorsk",
      "Norsk Nynorsk",
    ],
  ],
  [
    "nob",
    ["nb", "Norwegian Bokmål", "norvégien bokmål", "Bokmål", "Norsk Bokmål"],
  ],
  ["nog", [" ", "Nogai", "nogaï", "Nogaisch", "Ногай тили"]],
  [
    "non",
    [" ", "Norse, Old", "norrois, vieux", "Altnorwegisch", "Dǫnsk tunga"],
  ],
  ["nor", ["no", "Norwegian", "norvégien", "Norwegisch", "Norsk"]],
  ["nqo", [" ", "N'Ko", "n'ko", "N'Ko", "ߒߞߏ"]],
  ["nso", [" ", "Pedi", "pedi", "Pedi", "Sesotho sa Leboa"]],
  [
    "nub",
    [
      " ",
      "Nubian languages",
      "nubiennes, langues",
      "Nubische Sprachen",
      "لغات نوبية",
    ],
  ],
  [
    "nwc",
    [" ", "Classical Newari", "newari classique", "Alt-Newari", "पुलां भाय्"],
  ],
  ["nya", ["ny", "Chichewa", "chichewa", "Nyanja", "Chichewa"]],
  ["nym", [" ", "Nyamwezi", "nyamwezi", "Nyamwezi", "KiNyamwezi"]],
  ["nyn", [" ", "Nyankole", "nyankolé", "Nkole", "Orunyankore"]],
  ["nyo", [" ", "Nyoro", "nyoro", "Nyoro", "Orunyoro"]],
  ["nzi", [" ", "Nzima", "nzema", "Nzima", "Nzema"]],
  [
    "oci",
    [
      "oc",
      "Occitan (post 1500)",
      "occitan (après 1500)",
      "Okzitanisch",
      "Occitan",
    ],
  ],
  ["oji", ["oj", "Ojibwa", "ojibwa", "Ojibwa", "ᐊᓂᐦᔑᓈᐯᒧᐎᓐ"]],
  ["ori", ["or", "Oriya (macrolanguage)", "oriya", "Oriya", "ଓଡ଼ିଆ"]],
  ["orm", ["om", "Oromo", "galla", "Galla", "Afaan Oromoo"]],
  ["osa", [" ", "Osage", "osage", "Osage", "𐓏𐓘𐓻𐓘𐓻𐓟 𐒻𐓟"]],
  ["oss", ["os", "Ossetian", "ossète", "Ossetisch", "Ирон ӕвзаг"]],
  [
    "ota",
    [
      " ",
      "Turkish, Ottoman (1500-1928)",
      "turc ottoman (1500-1928)",
      "Osmanisch",
      "لسان عثمانى",
    ],
  ],
  [
    "oto",
    [
      " ",
      "Otomian languages",
      "otomi, langues",
      "Otomangue-Sprachen",
      undefined,
    ],
  ],
  [
    "paa",
    [
      " ",
      "Papuan languages",
      "papoues, langues",
      "Papuasprachen (Andere)",
      undefined,
    ],
  ],
  [
    "pag",
    [" ", "Pangasinan", "pangasinan", "Pangasinan", "Salitan Pangasinan"],
  ],
  ["pal", [" ", "Pahlavi", "pahlavi", "Mittelpersisch", "Pārsīk"]],
  ["pam", [" ", "Pampanga", "pampangan", "Pampanggan", "Amánung Kapampangan"]],
  ["pan", ["pa", "Panjabi", "pendjabi", "Pandschabi", "ਪੰਜਾਬੀ"]],
  ["pap", [" ", "Papiamento", "papiamento", "Papiamento", "Papiamentu"]],
  ["pau", [" ", "Palauan", "palau", "Palau", "a tekoi er a Belau"]],
  [
    "peo",
    [
      " ",
      "Persian, Old (ca.600-400 B.C.)",
      "perse, vieux (ca. 600-400 av. J.-C.)",
      "Altpersisch",
      undefined,
    ],
  ],
  ["per", ["fa", "Persian", "persan", "Persisch", "فارسی"]],
  [
    "phi",
    [
      " ",
      "Philippine languages",
      "philippines, langues",
      "Philippinisch-Austronesisch (Andere)",
      undefined,
    ],
  ],
  ["phn", [" ", "Phoenician", "phénicien", "Phönikisch", "𐤃𐤁𐤓𐤉𐤌 𐤊𐤍𐤏𐤍𐤉𐤌"]],
  ["pli", ["pi", "Pali", "pali", "Pali", "Pāli"]],
  ["pol", ["pl", "Polish", "polonais", "Polnisch", "Język polski"]],
  ["pon", [" ", "Pohnpeian", "pohnpei", "Ponapeanisch", "Lokaiahn Pohnpei"]],
  ["por", ["pt", "Portuguese", "portugais", "Portugiesisch", "Português"]],
  ["pra", [" ", "Prakrit languages", "prâkrit, langues", "Prakrit", undefined]],
  [
    "pro",
    [
      " ",
      "Provençal, Old (to 1500)",
      "provençal ancien (jusqu'à 1500)",
      "Altokzitanisch",
      undefined,
    ],
  ],
  ["pus", ["ps", "Pushto", "pachto", "Paschtu", "پښتو"]],
  [
    "qaa-qtz",
    [
      " ",
      "Reserved for local use",
      "réservée à l'usage local",
      "Reserviert für lokale Verwendung",
      undefined,
    ],
  ],
  ["que", ["qu", "Quechua", "quechua", "Quechua", "Runa simi"]],
  ["raj", [" ", "Rajasthani", "rajasthani", "Rajasthani", "राजस्थानी"]],
  ["rap", [" ", "Rapanui", "rapanui", "Osterinsel", "Vananga rapa nui"]],
  [
    "rar",
    [" ", "Rarotongan", "rarotonga", "Rarotonganisch", "Māori Kūki 'Āirani"],
  ],
  [
    "roa",
    [
      " ",
      "Romance languages",
      "romanes, langues",
      "Romanische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["roh", ["rm", "Romansh", "romanche", "Rätoromanisch", "Rumantsch"]],
  ["rom", [" ", "Romany", "tsigane", "Romani", "Romani čhib"]],
  ["ron", ["ro", "Romanian", "roumain", "Rumänisch", "Română"]],
  ["rum", ["ro", "Romanian", "roumain", "Rumänisch", "Română"]],
  ["run", ["rn", "Rundi", "rundi", "Rundi", "Ikirundi"]],
  ["rup", [" ", "Aromanian", "aroumain", "Aromunisch", "Armãneashce"]],
  ["rus", ["ru", "Russian", "russe", "Russisch", "Русский"]],
  ["sad", [" ", "Sandawe", "sandawe", "Sandawe", "Sàndàwé kì’ìng"]],
  ["sag", ["sg", "Sango", "sango", "Sango", "yângâ tî Sängö"]],
  ["sah", [" ", "Yakut", "iakoute", "Jakutisch", "Сахалыы"]],
  [
    "sai",
    [
      " ",
      "Indigenous South American languages",
      "langues autochtones d'Amérique du Sud",
      "Indigene Sprachen Südamerikas",
      undefined,
    ],
  ],
  [
    "sal",
    [" ", "Salishan languages", "salishennes, langues", "Salish", undefined],
  ],
  ["sam", [" ", "Samaritan Aramaic", "samaritain", "Samaritanisch", "ארמית"]],
  ["san", ["sa", "Sanskrit", "sanskrit", "Sanskrit", "संस्कृतम्"]],
  ["sas", [" ", "Sasak", "sasak", "Sasak", "ᬪᬵᬲᬵᬲᬓ᭄ᬱᬓ᭄"]],
  ["sat", [" ", "Santali", "santal", "Santali", "ᱥᱟᱱᱛᱟᱲᱤ"]],
  ["scn", [" ", "Sicilian", "sicilien", "Sizilianisch", "Sicilianu"]],
  ["sco", [" ", "Scots", "écossais", "Schottisch", "Braid Scots"]],
  ["sel", [" ", "Selkup", "selkoupe", "Selkupisch", "Чу́мэл шэ"]],
  [
    "sem",
    [
      " ",
      "Semitic languages",
      "sémitiques, langues",
      "Semitische Sprachen (Andere)",
      undefined,
    ],
  ],
  [
    "sga",
    [
      " ",
      "Irish, Old (to 900)",
      "irlandais ancien (jusqu'à 900)",
      "Altirisch",
      "Goídelc",
    ],
  ],
  [
    "sgn",
    [" ", "Sign Language", "langue des signes", "Zeichensprache", undefined],
  ],
  ["shn", [" ", "Shan", "chan", "Schan", "ၵႂၢမ်းတႆးယႂ်"]],
  ["sid", [" ", "Sidamo", "sidamo", "Sidamo", "Sidaamu Afoo"]],
  ["sin", ["si", "Sinhala", "singhalais", "Singhalesisch", "සිංහල"]],
  [
    "sio",
    [
      " ",
      "Siouan languages",
      "sioux, langues",
      "Sioux-Sprachen (Andere)",
      undefined,
    ],
  ],
  [
    "sit",
    [
      " ",
      "Sino-Tibetan languages",
      "sino-tibétaines, langues",
      "Sinotibetische Sprachen (Andere)",
      undefined,
    ],
  ],
  [
    "sla",
    [
      " ",
      "Slavic languages",
      "slaves, langues",
      "Slawische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["slk", ["sk", "Slovak", "slovaque", "Slowakisch", "Slovenčina"]],
  ["slo", ["sk", "Slovak", "slovaque", "Slowakisch", "Slovenčina"]],
  ["slv", ["sl", "Slovenian", "slovène", "Slowenisch", "Slovenščina"]],
  [
    "sma",
    [" ", "Southern Sami", "sami du Sud", "Südsaamisch", "Åarjelsaemien gïele"],
  ],
  [
    "sme",
    ["se", "Northern Sami", "sami du Nord", "Nordsaamisch", "Davvisámegiella"],
  ],
  ["smi", [" ", "Sami languages", "sames, langues", "Saamisch", undefined]],
  [
    "smj",
    [" ", "Lule Sami", "sami de Lule", "Lulesaamisch", "Julevsámegiella"],
  ],
  ["smn", [" ", "Inari Sami", "sami d'Inari", "Inarisaamisch", "Anarâškielâ"]],
  ["smo", ["sm", "Samoan", "samoan", "Samoanisch", "Gagana faʻa Sāmoa"]],
  ["sms", [" ", "Skolt Sami", "sami skolt", "Skoltsaamisch", "Sääʹmǩiõll"]],
  ["sna", ["sn", "Shona", "shona", "Schona", "chiShona"]],
  ["snd", ["sd", "Sindhi", "sindhi", "Sindhi", "सिन्धी"]],
  ["snk", [" ", "Soninke", "soninké", "Soninke", "Sooninkanxanne"]],
  ["sog", [" ", "Sogdian", "sogdien", "Sogdisch", undefined]],
  ["som", ["so", "Somali", "somali", "Somali", "af Soomaali"]],
  ["son", [" ", "Songhai languages", "songhai, langues", "Songhai", undefined]],
  ["sot", ["st", "Sotho, Southern", "sotho du Sud", "Süd-Sotho", "Sesotho"]],
  ["spa", ["es", "Spanish", "espagnol", "Spanisch", "Español"]],
  ["sqi", ["sq", "Albanian", "albanais", "Albanisch", "Shqip"]],
  ["srd", ["sc", "Sardinian", "sarde", "Sardisch", "Sardu"]],
  ["srn", [" ", "Sranan Tongo", "sranan tongo", "Sranantongo", "Sranan Tongo"]],
  ["srp", ["sr", "Serbian", "serbe", "Serbisch", "Ссрпски"]],
  ["srr", [" ", "Serer", "sérère", "Serer", "Seereer"]],
  [
    "ssa",
    [
      " ",
      "Nilo-Saharan languages",
      "nilo-sahariennes, langues",
      "Nilosaharanische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["ssw", ["ss", "Swati", "swati", "Swasi", "siSwati"]],
  ["suk", [" ", "Sukuma", "sukuma", "Sukuma", "Kɪsukuma"]],
  ["sun", ["su", "Sundanese", "soundanais", "Sundanesisch", "ᮘᮞ ᮞᮥᮔ᮪ᮓ"]],
  ["sus", [" ", "Susu", "soussou", "Susu", "Sosoxui"]],
  ["sux", [" ", "Sumerian", "sumérien", "Sumerisch", "𒅴𒂠"]],
  ["swa", ["sw", "Swahili", "swahili", "Swahili", "Kiswahili"]],
  ["swe", ["sv", "Swedish", "suédois", "Schwedisch", "Svenska"]],
  [
    "syc",
    [" ", "Classical Syriac", "syriaque classique", "Syrisch", undefined],
  ],
  ["syr", [" ", "Syriac", "syriaque", "Neuostaramäisch", "ܠܫܢܐ ܣܘܪܝܝܐ"]],
  ["tah", ["ty", "Tahitian", "tahitien", "Tahitisch", "Reo Tahiti"]],
  [
    "tai",
    [" ", "Tai languages", "tai, langues", "Thaisprachen (Andere)", "ภาษาไท"],
  ],
  ["tam", ["ta", "Tamil", "tamoul", "Tamil", "தமிழ்"]],
  ["tat", ["tt", "Tatar", "tatar", "Tatarisch", "Татар теле"]],
  ["tel", ["te", "Telugu", "télougou", "Telugu", "తెలుగు"]],
  ["tem", [" ", "Timne", "temne", "Temne", "KʌThemnɛ"]],
  ["ter", [" ", "Tereno", "tereno", "Tereno", "Terêna"]],
  ["tet", [" ", "Tetum", "tetum", "Tetum", "Lia-Tetun"]],
  ["tgk", ["tg", "Tajik", "tadjik", "Tadschikisch", "Тоҷикӣ"]],
  ["tgl", ["tl", "Tagalog", "tagalog", "Tagalog", "Wikang Tagalog"]],
  ["tha", ["th", "Thai", "thaï", "Thailändisch", "ภาษาไทย"]],
  ["tib", ["bo", "Tibetan", "tibétain", "Tibetisch", "བོད་སྐད་"]],
  ["tig", [" ", "Tigre", "tigré", "Tigre", "ትግረ"]],
  ["tir", ["ti", "Tigrinya", "tigrigna", "Tigrinja", "ትግርኛ"]],
  ["tiv", [" ", "Tiv", "tiv", "Tiv", "Tiv"]],
  ["tkl", [" ", "Tokelau", "tokelau", "Tokelauanisch", "gagana Tokelau"]],
  ["tlh", [" ", "Klingon", "klingon", "Klingonisch", undefined]],
  ["tli", [" ", "Tlingit", "tlingit", "Tlingit", "Lingít"]],
  ["tmh", [" ", "Tamashek", "tamacheq", "Tamašeq", undefined]],
  [
    "tog",
    [" ", "Tonga (Nyasa)", "tonga (Nyasa)", "Tonga (Sambia)", "chiTonga"],
  ],
  [
    "ton",
    [
      "to",
      "Tonga (Tonga Islands)",
      "tongan (Îles Tonga)",
      "Tongaisch",
      "lea faka-Tonga",
    ],
  ],
  ["tpi", [" ", "Tok Pisin", "tok pisin", "Neumelanesisch", "Tok Pisin"]],
  ["tsi", [" ", "Tsimshian", "tsimshian", "Tsimshian", "Tsmksian"]],
  ["tsn", ["tn", "Tswana", "tswana", "Tswana", "Setswana"]],
  ["tso", ["ts", "Tsonga", "tsonga", "Tsonga", "Xitsonga"]],
  ["tuk", ["tk", "Turkmen", "turkmène", "Turkmenisch", "Türkmençe"]],
  ["tum", [" ", "Tumbuka", "tumbuka", "Tumbuka", "chiTumbuka"]],
  ["tup", [" ", "Tupi languages", "tupi, langues", "Tupi", undefined]],
  ["tur", ["tr", "Turkish", "turc", "Türkisch", "Türkçe"]],
  [
    "tut",
    [
      " ",
      "Altaic languages",
      "altaïques, langues",
      "Altaische Sprachen (Andere)",
      undefined,
    ],
  ],
  ["tvl", [" ", "Tuvalu", "tuvalu", "Elliceanisch", "Te Ggana Tuuvalu"]],
  ["twi", ["tw", "Twi", "twi", "Twi", "Twi"]],
  ["tyv", [" ", "Tuvinian", "touva", "Tuwinisch", "Тыва дыл"]],
  ["udm", [" ", "Udmurt", "oudmourte", "Udmurtisch", "Удмурт кыл"]],
  ["uga", [" ", "Ugaritic", "ougaritique", "Ugaritisch", undefined]],
  ["uig", ["ug", "Uighur", "ouïgour", "Uigurisch", "ئۇيغۇر تىلى"]],
  ["ukr", ["uk", "Ukrainian", "ukrainien", "Ukrainisch", "Українська мова"]],
  ["umb", [" ", "Umbundu", "umbundu", "Mbundu", "Úmbúndú"]],
  ["und", [" ", "Undetermined", "indéterminée", "Nicht definiert", undefined]],
  ["urd", ["ur", "Urdu", "ourdou", "Urdu", "اُردُو"]],
  ["uzb", ["uz", "Uzbek", "ouszbek", "Usbekisch", "Oʻzbekcha"]],
  ["vai", [" ", "Vai", "vaï", "Vai", "ꕙꔤ"]],
  ["ven", ["ve", "Venda", "venda", "Venda", "Tshivenḓa"]],
  ["vie", ["vi", "Vietnamese", "vietnamien", "Vietnamesisch", "Tiếng Việt"]],
  ["vol", ["vo", "Volapük", "volapük", "Volapük", undefined]],
  ["vot", [" ", "Votic", "vote", "Wotisch", "Vaďďa tšeeli"]],
  [
    "wak",
    [
      " ",
      "Wakashan languages",
      "wakashanes, langues",
      "Wakash-Sprachen",
      undefined,
    ],
  ],
  ["wal", [" ", "Wolaitta", "wolaitta", "Walamo", "Wolayttatto Doonaa"]],
  ["war", [" ", "Waray", "waray", "Waray", "Winaray"]],
  ["was", [" ", "Washo", "washo", "Washo", "Wá:šiw ʔítlu"]],
  ["wel", ["cy", "Welsh", "gallois", "Kymrisch", "Cymraeg"]],
  [
    "wen",
    [
      " ",
      "Sorbian languages",
      "sorabes, langues",
      "Sorbisch (Andere)",
      "Serbsce",
    ],
  ],
  ["wln", ["wa", "Walloon", "wallon", "Wallonisch", "Walon"]],
  ["wol", ["wo", "Wolof", "wolof", "Wolof", "Wolof làkk"]],
  ["xal", [" ", "Kalmyk", "kalmouk", "Kalmückisch", "Хальмг келн"]],
  ["xho", ["xh", "Xhosa", "xhosa", "Xhosa", "isiXhosa"]],
  ["yao", [" ", "Yao", "yao", "Yao", "chiYao"]],
  ["yap", [" ", "Yapese", "yapois", "Yapesisch", "Thin nu Waqaab"]],
  ["yid", ["yi", "Yiddish", "yiddish", "Jiddisch", "ייִדיש"]],
  ["yor", ["yo", "Yoruba", "yoruba", "Yoruba", "èdè Yorùbá"]],
  [
    "ypk",
    [" ", "Yupik languages", "yupik, langues", "Ypik-Sprachen", undefined],
  ],
  ["zap", [" ", "Zapotec", "zapotèque", "Zapotekisch", "Diidxazá"]],
  ["zbl", [" ", "Blissymbols", "symboles Bliss", "Bliss-Symbol", undefined]],
  ["zen", [" ", "Zenaga", "zenaga", "Zenaga", "Tuẓẓungiyya"]],
  [
    "zgh",
    [
      " ",
      "Standard Moroccan Tamazight",
      "amazighe standard marocain",
      "Marokkanisches Tamazight",
      "ⵜⴰⵎⴰⵣⵉⵖⵜ ⵜⴰⵏⴰⵡⴰⵢⵜ",
    ],
  ],
  ["zha", ["za", "Zhuang", "zhuang", "Zhuang", "話僮"]],
  ["zho", ["zh", "Chinese", "chinois", "Chinesisch", "中文"]],
  [
    "znd",
    [" ", "Zande languages", "zandé, langues", "Zande-Sprachen", undefined],
  ],
  ["zul", ["zu", "Zulu", "zoulou", "Zulu", "isiZulu"]],
  ["zun", [" ", "Zuni", "zuni", "Zuñi", "Shiwi'ma"]],
  [
    "zxx",
    [
      " ",
      "No linguistic content",
      "pas de contenu linguistique",
      "Kein linguistischer Inhalt",
      undefined,
    ],
  ],
  ["zza", [" ", "Zaza", "zaza", "Zazaki", "Kirmanckî"]],
]);
