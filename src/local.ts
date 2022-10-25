import path from 'path'
import { executeTests } from './testrunner'



(async function() {

    await executeTests({
        pwd: path.resolve(__dirname, "..", "example"),
        runName: "My Unit Tests",
        goTestArgs: "./...",
        githubToken: "foo"
    })



})()