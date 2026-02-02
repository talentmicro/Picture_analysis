const PDFDocument = require('pdfkit');
const fs = require('fs');

const images = [
    './Applicants/243546/243546_Applicant_Interview.png',
    './Applicants/243546/243546_Applicant_new.png',
    './Applicants/243546/243546_Applicant_profile.png',
    // add more image paths
];
var data=[];
fs.readFile('./Applicants/243546/abc.json', 'utf8', (err, jsonString) => {
  if (err) {
    console.error("Error reading json file ");
    return;
  }
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    console.error('Error parsing JSON string:', err);
  }
});

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('multi_page_images.pdf'));

images.forEach((imagePath, index) => {
    // Add a new page for each image (except the first one if the first image is on the initial blank page)
    if (index > 0) {
       // doc.addPage();
    }

    // Add the image to the current page, fitting it within the page dimensions
    doc.image(imagePath, {
        fit: [200, 200], // Fit within margins
        align: 'center',
        valign: 'center'
    });

    doc.text(`Page ${index + 1}: ${imagePath}`, { align: 'center' }).moveDown();
});

const headers = Object.keys(data);
const rowHeight = 25;
const columnWidth = 150;
let x = doc.x;
let y = doc.y;

headers.forEach((header, i) => {
    doc
      .rect(x + i * columnWidth, y, columnWidth, rowHeight)
      .stroke()
      .font("Helvetica-Bold")
      .text(header, x + i * columnWidth + 5, y + 7, {
        width: columnWidth - 10,
        align: "left",
      });
  });

y += rowHeight;

headers.forEach((key, i) => {
      doc
        .rect(x + i * columnWidth, y, columnWidth, rowHeight)
        .stroke()
        .font("Helvetica")
        .text(String(data[key]), x + i * columnWidth + 5, y + 7, {
          width: columnWidth - 10,
          align: "left",
        });
    });


doc.end();
console.log('Multi-page PDF generated.');