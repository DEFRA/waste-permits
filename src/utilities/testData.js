'use strict'

module.exports = {
  pageSize: 'A4',
  pageOrientation: 'portrait',
  pageMargins: [25],
  info: {
    title: 'Application for standard rules permit EPR/WE1234AB/A001',
    author: 'Southern Star Power Plc',
    subject: 'Application for an Environmental Permit',
    keywords: 'keywords for document',
    creator: 'GOV.UK',
    producer: 'GOV.UK',
    creationDate: '24/04/2019'
  },
  content: [
    { text: 'Application for standard rules permit', style: 'h1' },
    { text: 'SR2008-4 Waste transfer station', style: 'h1' },
    'Application reference: EPR/WE1234AB/A001',
    'Submitted on 24 March 2019',
    {
      table: {
        headerRows: 0,
        body: [
          [{ text: 'Regime and type', style: 'th' }, 'New application: Waste - standard rules permit'],
          [{ text: 'Application for', style: 'th' }, 'SR2008-4 Waste transfer station'],
          [{ text: 'Application cost', style: 'th' }, '£2,300.00'],
          [{ text: 'Operator', style: 'th' }, 'Limited company: Southern Star Power Plc'],
          [{ text: 'Company address', style: 'th' }, '123 Sleeve Road, London AB1 6BU'],
          [{ text: 'Company directors', style: 'th' },
            [
              'John Smith 12/4/1963',
              'David Neil Cowhill 12/2/1965',
              'David Docker 12/5/1963',
              'Paul John Vermeer 12/8/1963',
              'John Richard Kennedy 12/9/1964',
              'Bob McTaggart 12/11/1971',
              'Rachel McTall 12/6/1972',
              'Colin Simon Paul 12/11/1960',
              'David Rodderton 12/6/1963',
              'Gary Martin Stokenham 12/11/1952'
            ]
          ],
          [{ text: 'Site name', style: 'th' }, 'Car Breakers Yard'],
          [{ text: 'Site address', style: 'th' }, '5 GRANGE ROAD BRISTOL'],
          [{ text: 'Grid reference for the site', style: 'th' }, 'ST 58132 72695'],
          [{ text: 'Site plan', style: 'th' }, 'success-one.pdf'],
          [{ text: 'Contact for application', style: 'th' },
            [
              'Regina Burnett',
              'This person is an agent or consultant',
              'Telephone 01179123456',
              'cucaty@example.com'
            ]
          ],
          [{ text: 'Site or operations contact', style: 'th' },
            [
              'Jane Siteman',
              'Telephone 011799876543',
              'j.siteman@example.com'
            ]
          ],
          [{ text: 'Email address for permit and official notices', style: 'th' }, 'official@example.com'],
          [{ text: 'Relevant offences', style: 'th' }, 'No'],
          [{ text: 'Bankruptcy or insolvency', style: 'th' }, 'No'],
          [{ text: 'Technical manager', style: 'th' }, 'Jane Smith'],
          [{ text: 'Qualification', style: 'th' }, 'WAMITAB-CIWM'],
          [{ text: 'Technical manager details', style: 'th' }, 'tcm-details-document.docx'],
          [{ text: 'Fire prevention plan filename', style: 'th' }, 'success-three.pdf'],
          [{ text: 'Claim confidentiality', style: 'th' }, 'No'],
          [{ text: 'Invoice address', style: 'th' }, '9a GRANGE ROAD BRISTOL'],
          [{ text: 'Invoice contact details', style: 'th' },
            [
              'Finance Team',
              'finance@mycompany.co.uk',
              'Telephone 01179 865432'
            ]
          ],
          [{ text: 'Declaration - the operator confirmed that:', style: 'th' },
            [
              'their operation meets the standard rules',
              'a written management system will be in place before they start operating',
              'they were authorised to apply for the permit by the organisation or individual responsible',
              'the information they gave was true'
            ]
          ]
        ]
      },
      style: 'tableApplication',
      layout: 'lightHorizontalLines'
    }
  ],
  styles: {
    h1: {
      fontSize: 24,
      bold: true,
      margin: [0, 0, 0, 12]
    },
    h2: {
      fontSize: 14,
      bold: true,
      margin: [0, 12, 0, 6]
    },
    tableApplication: {
      margin: [0, 12, 0, 12]
    },
    th: {
      bold: true,
      margin: [0, 3, 0, 3]
    }
  },
  defaultStyle: {
    fontSize: 12,
    margin: [0, 0, 0, 6]
  }
}
