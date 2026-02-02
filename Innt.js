const sql = require('mssql');
const zlib = require("zlib");
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cron=require('node-cron');

const config = {
    server: '10.78.8.20',
    database: 'ESOURCINGV5',
    user: 'hirecraftv5',
    password: 'hirecraft$1991',
    port: 1755,
    options: {
        encrypt: true,
        trustedConnection: true,
        trustServerCertificate: true,
    }
}



async function main() {
    try {
        sql.connect(config).then(pool => {
	var TotalapplicantId = '';
	
            pool.query('Execute usp_getCandidateImageForValidation', function (err, recordSet) {
                if (err) {
                    console.log(err);
                    return err;
                }
                var response_object = recordSet.recordset;
                response_object.forEach(Element => {
                    var applicantId = Element['applicantId'] == null ? '' : Element['applicantId'];
                    var profilePic = Element['profilePic'] == null ? '' : Element['profilePic'];
                    var profilePicExt=Element['profilePicExt'] == null ? '' : Element['profilePicExt'];
                    var interviewImage = Element['interviewImage'] == null ? '' : Element['interviewImage'];
                    var interviewImageExt=Element['interviewImageExt'] == null ? '' : Element['interviewImageExt'];
                    var ekycImage = Element['ekycImage'] == null ? '' : Element['ekycImage'];
                    var ekycImageExt=Element['ekycImageExt'] == null ? '' : Element['ekycImageExt'];
                    console.log(applicantId);
                    if (applicantId != '') {
                        if (profilePic != '') {
                            var profilePicBase64 = opDataUnzip(profilePic);
                            saveImage(applicantId,profilePicBase64, 'Profile', profilePicExt)
                        }
                        if (interviewImage != '') {
                            var interviewImageBase64 = opDataUnzip(interviewImage);
                            saveImage(applicantId,interviewImageBase64, 'Interview', interviewImageExt)
                        }
                        if (ekycImage != '') {
                            var ekycImageBase64 = opDataUnzip(ekycImage);
                            saveImage(applicantId,ekycImageBase64, 'EKYC', ekycImageExt)
                        }
                    }
	            TotalapplicantId = TotalapplicantId + ','+ applicantId;

                })
                pool.query(`Execute usp_updateCandidateImageValidation @applicantID='`+totalApplicantId+`'`,()=>{
                console.log('completed');
            })
            })

        })

    }
    catch (error) {
        console.log(error);
    }
}

main();

async function saveImage(applicantId,base64String, type, fileExtension) {
    const folderName = 'Applicants/' + applicantId;
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    const binaryData = Buffer.from(base64String, 'base64');
    const updatedPath = path.join(__dirname, folderName, `${applicantId}_Applicant_${type}.${fileExtension}`);
    fs.writeFile(updatedPath, binaryData, () => {
        console.log('file Uploaded in Applicant Folder');
    });
}
function opDataUnzip(compressedData) {
    try {
        const compressedBuffer = Buffer.from(compressedData);
        const decompressedBuffer = zlib.unzipSync(compressedBuffer);

        return decompressedBuffer.toString('utf-8');
    } catch (ex) {
        console.error(ex.toString());
        return null;
    }
}

function opDataZip(base64Data) {
    try {
        const inputBuffer = Buffer.from(base64Data, 'utf-8');
        const compressedBuffer = zlib.gzipSync(inputBuffer);

        return compressedBuffer;
    } catch (ex) {
        console.error(ex.toString());
        return null;
    }
}