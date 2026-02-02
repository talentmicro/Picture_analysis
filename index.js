const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const dataConfigObj = require('./DataConfig');
const dbAccessObj = require('./DBAccess');

const app = express();
app.use(cors());
app.use(express.json());
const port = 8088 //


const dataConfig = dataConfigObj.getDataConfig();
app.locals.db = {
    ATS: dbAccessObj.dataAccess(dataConfig.ATS)
}

const ATSConnection = req => req.app.locals.db.ATS;

const appMiddleware = (req, res, next) => {
    next();
}

app.listen(port, () => {
    console.log('Application Started');
})

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'Input/');
    },
    filename: (req, file, cb) => {
        const randomString = crypto.randomBytes(5).toString('hex');
        cb(null, `${randomString}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });
if (!fs.existsSync('Input')) {
    fs.mkdirSync('Input');
}
if (!fs.existsSync('Applicants')) {
    fs.mkdirSync('Applicants');
}

app.post('/api/imageStore', upload.single('file'), async (req, res) => {
    try {
        const { file, body } = req;
        const { applicantId, type } = body
        if (!applicantId || !type) {
            return res.status(400).json({ code: 400, status: false, message: 'Missing required fields' });
        }
        const inputPath = path.join(__dirname, 'Input', file.filename);
        const fileExtension = getFileExtension(file.filename);
        const folderName='Applicants/'+applicantId;
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
        }
        const updatedPath = path.join(__dirname, folderName, `${applicantId}_Applicant_${type}.${fileExtension}`);
        fs.readFile(inputPath, (err, data) => {
            if (err) {
                res.status(500).json({ message: 'input File is currupted' });
            }
            const base64String = data.toString('base64');
            fs.writeFile(updatedPath, data, () => {
                console.log('file Uploaded in Applicant Folder');
            });


            (async () => {
                try {
                    // console.log('BASE64 String:', base64String);
                    const updaterecordSets = await ATSConnection(req).execute(`usp_saveApplicantKycImage`, [
                        { name: 'fileData', value: base64String },
                        { name: 'applicantId', value: applicantId },
                        { name: 'type', value: type }
                    ], []).catch(
                        error => {
                             console.log('DB Error');
                        }
                    );
                    
                }
                catch (error) {
                    console.log(error);
                }
            })();
        })

       fs.unlinkSync(inputPath);
        res.status(200).json({});
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
     }
     
})



function getFileExtension(filename) {
    const parts = filename.split('.');
    if (parts.length > 1) {
        return parts.pop();
    }
    return '';
}