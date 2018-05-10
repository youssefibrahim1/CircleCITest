let readline = require('readline-sync');
let axios = require('axios');
let fs = require('fs');
let config = require('../config.js');
let path = require('path');
// let { APIProdkey } = config.APIKeys;

'use strict';
const { readdirSync, lstatSync } = require('fs')
const { join } = require('path')

function sum(a,b){
    return a+b;
 }
 module.exports=sum