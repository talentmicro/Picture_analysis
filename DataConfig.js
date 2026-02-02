

const options = {
    encrypt: false,
    enableArithAbort: false,
    requestTimeout: 300000,
}

const getDataConfig = () => ({
    ATS: {
        name: 'ATS',
        config: {
            server: '185.100.212.20',
            database: 'ATS',
            user: 'Tallint',
            password: 'Dev@123',
            options: options
        }
    }
})

module.exports ={ getDataConfig}