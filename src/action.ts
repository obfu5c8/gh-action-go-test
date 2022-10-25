import * as core from "@actions/core"
import { executeTests } from "./testrunner";


async function executeAction() {

    // Gather inputs ==========================================|
    /** The directory to execute 'go test' from */
    const pwd = core.getInput('pwd') || process.cwd()
    /** Name of the test run */
    const runName = core.getInput('name') || 'Test Run'
    /** Additional arguments to pass to 'go test' */
    const goTestArgs = core.getInput('goTestArgs') || './...'
    /** Github access token - ${{ secrets.GITHUB_TOKEN }} */
    const githubToken = core.getInput('token');
    

    await executeTests({
        pwd,
        runName,
        goTestArgs,
        githubToken,
    })
}




(async function main() {
    try {
        await executeAction()
    } catch (err: any) {
        core.setFailed(err.message);
    }
})()
