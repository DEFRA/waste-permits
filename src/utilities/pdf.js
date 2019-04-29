'use strict'

const PdfMake = require('pdfmake')
const fs = require('fs')

/*
const vfs_fonts = require('pdfmake/build/vfs_fonts.js')
const printer = new PdfMake({
  Roboto: {
    normal: Buffer.from(
      vfs_fonts.pdfMake.vfs['Roboto-Regular.ttf'],
      'base64'
    )
  }
})
*/

const printer = new PdfMake({
  timesRoman: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic'
  }
})

const docDefinition = {
  defaultStyle: { font: 'timesRoman' },
  content: [
    'First paragraph',
    'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines'
  ]
}

const pdfDoc = printer.createPdfKitDocument(docDefinition)

/*
let chunks = []

let result

pdfDoc.on('readable', function () {
  let chunk
  while ((chunk = pdfDoc.read(9007199254740991)) !== null) {
    chunks.push(chunk)
  }
})
pdfDoc.on('end', function () {
  result = Buffer.concat(chunks)
  console.log(result)
})

// pdfDoc.pipe(process.stdout)
*/
pdfDoc.pipe(fs.createWriteStream('myFile.pdf'))
pdfDoc.end()

module.exports = printer
