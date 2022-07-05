const chalk = require('chalk');

const error = chalk.bold.red;
const warning = chalk.hex('#FFA500');
const success = chalk.hex('#00FF00');

function logHeaderInfo(heading, message) {
    console.log();
    console.log(chalk.bold.underline.blue(heading));
    console.log(message);
    console.log();
}

function logHeaderError(heading, message) {
    console.log();
    console.log(chalk.bold.underline.red(heading));
    console.log(message);
    console.log();
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
    banner
}

