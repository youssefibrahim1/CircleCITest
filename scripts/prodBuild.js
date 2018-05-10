let readline = require('readline-sync');
let axios = require('axios');
let fs = require('fs');
let config = require('../config.js');
let path = require('path');
// let { APIProdkey } = config.APIKeys;

const { readdirSync, lstatSync } = require('fs')
const { join } = require('path')

function checkBuildExists(){
    let dir = `./Build`
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    removefiles()
}

function removefiles() {
    rmDir = function (dirPath, removeSelf) {
        if (removeSelf === undefined)
            removeSelf = true;
        try { var files = fs.readdirSync(dirPath); }
        catch (e) { return; }
        if (files.length > 0)
            for (var i = 0; i < files.length; i++) {
                var filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else
                    rmDir(filePath);
            }
        if (removeSelf)
            fs.rmdirSync(dirPath);
    };
    rmDir('./Build', false)
    checkConfigAndBuildFolders()
}

function checkConfigAndBuildFolders() {
    let ProdFolder = config.ProdFolder
    let ProdFolderArr = []

    for (let prod in ProdFolder) {
        ProdFolderArr.push(prod)
    }

    let location = './Templates'

    //Creates an array of folder paths (e.g. ['/Templates/FolderName'])
    const isDirectory = source => lstatSync(source).isDirectory()
    const getDirectories = source =>
        readdirSync(source).map(name => join(source, name)).filter(isDirectory)
    let folderList = getDirectories(location)

    //Creates an array of folder names (e.g. ['FolderName1','FolderName2'])
    let shortFolderList = []
    for (let x = 1; x < folderList.length + 1; x++) {
        let shortFolder = /\/(.*)/g.exec(folderList[x - 1])
        shortFolderList.push(shortFolder[1])
    }

    //Loops through every folder in config file
    let doesntExistFolders = []
    let extraInConfig = []

    for (let x = 0; x < shortFolderList.length; x++) {
        let folderExists = false
        let configExists = false
        for (let folder in ProdFolder) {
            if (folder == shortFolderList[x]) {
                folderExists = true
            }
        }
        if (!folderExists) {
            doesntExistFolders.push(shortFolderList[x])
        }
    }

    let difference = ProdFolderArr.filter(x => !shortFolderList.includes(x));
    if (difference.length > 0 && doesntExistFolders.length != 0) {
        console.log('Consider deleting: The following folder(s) exist in the config file but not in the templates folder:')
        console.log('')
        for (let z = 0; z < difference.length; z++) {
            console.log(`${difference[z]}`)
        }
        console.log('')
        console.log('The following folders exist in Templates folder but not in config:')
        console.log('')
        for (let y = 0; y < doesntExistFolders.length; y++) {
            console.log(`${doesntExistFolders[y]}:false,`)
        }
        return;
    } else if (doesntExistFolders.length == 0 && difference.length != 0) {
        console.log('The following folders exist in the config file but not in templates folder:')
        console.log('')
        for (let z = 0; z < difference.length; z++) {
            console.log(`${difference[z]}`)
        }
        return;
    } else if (doesntExistFolders.length != 0 && difference.length == 0) {
        console.log('The following folders exist in Templates folder but not in config:')
        console.log('')
        for (let y = 0; y < doesntExistFolders.length; y++) {
            console.log(`${doesntExistFolders[y]}:false,`)
        }
        return;
    }
    createBuildFolder()
}

function createBuildFolder() {

    let ProdFolder = config.ProdFolder

    //Loops through every folder in config file
    for (let folder in ProdFolder) {

        if (ProdFolder[folder]) {

            //Reads the files inside the specified Template folder
            let fileChoice = fs.readdirSync(`./Templates/${folder}`);
            let filePath = ''
            let htmlFileExists = false

            //Checks if a directory exists in build, if not it creates it
            let dir = `./Build/${folder}`
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }


            //Creates a filePath in Build Folder only if an html file exists in Template folder
            for (let w = 0; w < fileChoice.length; w++) {
                let htmlChecker = /\.html/g.test(fileChoice[w])
                if (htmlChecker) {
                    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];

                    const d = new Date();
                    let n = d.getDate()
                    let h = d.getHours();
                    let m = d.getMinutes();
                    // console.log(`${monthNames[d.getMonth()]}-${n}`);

                    filePathTemplate = `./Templates/${folder}/${fileChoice[w]}`
                    let abridgedFileName = fileChoice[w].replace(/\.html/g, '')
                    filePathBuild = `./Build/${folder}/${abridgedFileName}_${monthNames[d.getMonth()]}${n}_${h}:${m}.html`
                    htmlFileExists = true;
                    break;
                }
            }

            //Stops the application if no html file in a Template folder
            if (!htmlFileExists) {
                console.log(`There are no html files in the ${folder} folder.`)
                return;
            }

            //Reads html from file and replaces stage links
            let htmlCode = fs.readFileSync(`${filePathTemplate}`, 'utf8');
            let htmlContentProd = htmlCode.replace(/\/\/stage\./g, '//www.')

            //Writes previously extracted html to a new file in build
            fs.writeFile(`${filePathBuild}`, `${htmlContentProd}`, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log(`The ${folder} file has been generated successfully!`)
            });

        }
    }
}

checkBuildExists()


