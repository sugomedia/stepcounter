const dbConfig = {
    host: "localhost",
    user: "214SZFTE",
    password: "123456",
    database: "stepcounter"
}

const dbDevConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "214SZFTE_stepcounter"
}

const appConfig = {
    appname: "StepCounter WebApplication",
    author: "Bajai SZC Türr István Technikum - 2/14.SZFTE"
}

module.exports.db = dbConfig;
module.exports.dbDev = dbDevConfig;
module.exports.app = appConfig;