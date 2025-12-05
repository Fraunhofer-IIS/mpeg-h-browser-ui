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

const path = require('path');
const fs = require("fs");

const TerserWebpackPlugin = require('terser-webpack-plugin');
const LicensePlugin = require('webpack-license-plugin');


const bannerPath = require.resolve(path.resolve(__dirname, 'banner_template.txt'));
const banner = fs.readFileSync(bannerPath, {
  encoding: "utf8"
}).replace("????", (new Date).getFullYear());

const licensePath = require.resolve(path.resolve(__dirname, 'license_template.txt'));
const license = fs.readFileSync(licensePath, {
  encoding: "utf8"
}).replace("????", (new Date).getFullYear());

const authorsPath = require.resolve(path.resolve(__dirname, 'AUTHORS.md'));
const authors = fs.readFileSync(authorsPath, {
  encoding: "utf8"
})

function indent(text) {
  if (!text) return text;
  return text
    .split('\n')
    .map(line => `  ${line}`)
    .join('\n');
}

function generateLicenseText(packages) {
  return license;
}

function generateThirdPartyLegalText(packages) {
  return packages.map(({ name, version, license, licenseText }) =>
`---------------------------------------------
Applicable to ${name}@${version}
---------------------------------------------

${license} license

${indent(licenseText)}
`
  ).join('\n');
}

function generateAuthorsText(packages) {
  return authors;
}

function unacceptableLicenseTest(licenseIdentifier) {
  const spdxWhitelist = [
    'MIT',
    'Apache-2.0',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'BSL-1.0',
    'ISC',
    'Zlib',
    'CC0-1.0',
    'libpng-2.0',
    'PSF-2.0',
    'Unlicense',
    'libtiff',
    'X11',
    'HPND',
  ];
  return !spdxWhitelist.includes(licenseIdentifier);
}

const licensePluginOptions = {
  outputFilename: 'thirdPartyLegalNotice.json',
  additionalFiles: {
    'thirdPartyLegalNotice.txt': generateThirdPartyLegalText,
    'LICENSE.txt': generateLicenseText,
    'AUTHORS.md': generateAuthorsText,
  },
  excludedPackageTest: (packageName, version) => {
    return packageName.startsWith('@wmt/');
  },
  unacceptableLicenseTest,
};


module.exports = {
  mode: 'production',
  output: {
    filename: `mpeg-h-browser-ui-[name].js`,
    path: path.resolve('dist', 'web'),
    library: {
      name: 'IIS_WMT',
      type: 'assign-properties',
    },
    clean: true,
  },
  target: 'web',
  plugins: [
    new LicensePlugin(licensePluginOptions),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin({
        terserOptions: {
          format: {
            comments: false,
            preamble: banner,
          },
        },
        extractComments: false,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: "url-loader"
      },
      {
        test: /\.svg$/,
        use: "svg-url-loader"
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  // devtool: 'inline-source-map', // useful for debugging TypeScript during development.
}
