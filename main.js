const inquirer = require("inquirer");
inquirer.prompt([
    {
        type: 'list',
        name: 'site',
        message: "Which website do you want to download manga on ?",
        choices: [
            "www.dm5.com",
            "m.mhxin.com",
        ],
    },
]).then(({ site }) => {
    switch (site) {
        case "www.dm5.com": {
            const dm5 = require("./sites/dm5");
            dm5();
            break;
        }
        case "m.mhxin.com": {
            // const mhxin = require("./sites/mhxin");
            // mhxin();
            break;
        }
    }
});