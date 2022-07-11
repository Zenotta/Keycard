const chalk = require('chalk');
const utils = require('./utils');

const error = chalk.bold.red;
const warning = chalk.hex('#FFA500');
const success = chalk.hex('#00FF00');

class VerboseLogger {
    constructor(verbose) {
        this.verbose = verbose;
    }

    log(context, header, message) {
        if (this.verbose) {
            console.log();
            console.log(`${chalk.green('VERBOSE :: ')}${context}`);
            console.log(chalk.greenBright(header));
            console.log(message);
        }
    }
}

function logHeaderInfo(heading, message) {
    const date = new Date();
    
    console.log();
    console.log(chalk.bold.underline.blue(`${utils.getTimestamp()} :: ${heading}`));
    console.log(message);
    console.log();
}

function logHeaderError(heading, message) {
    const date = new Date();
    
    console.log();
    console.log(chalk.bold.underline.red(`${utils.getTimestamp()} :: ${heading}`));
    console.log(message);
    console.log();
}

function verboseLog(verbose, message) {
    if (verbose) {

    }
}

function banner() {
    console.log(
        " \
                                                        \n \
        ██╗  ██╗███████╗██╗   ██╗ ██████╗ █████╗ ██████╗ ██████╗ \n \
        ██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔════╝██╔══██╗██╔══██╗██╔══██╗ \n \
        █████╔╝ █████╗   ╚████╔╝ ██║     ███████║██████╔╝██║  ██║ \n \
        ██╔═██╗ ██╔══╝    ╚██╔╝  ██║     ██╔══██║██╔══██╗██║  ██║ \n \
        ██║  ██╗███████╗   ██║   ╚██████╗██║  ██║██║  ██║██████╔╝ \n \
        ╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ \n \
                                                        \n \
        By Zenotta AG | https://zenotta.io \n \
        REMEMBER TO HAVE FUN!  \n \
        "
    )
}

module.exports = {
    error,
    warning,
    success,
    logHeaderInfo,
    logHeaderError,
    banner,
    VerboseLogger
}

