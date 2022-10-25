import commandExists from 'command-exists'
import * as core from '@actions/core'
import * as github from '@actions/github'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { Readable } from 'stream'
import path from 'path'
import { time } from 'console'

const pkgDir = path.resolve(__dirname, "..")

export interface TestRunnerOpts {
    /** Display name of the test run */
    runName: string
    /** Folder to execute 'go test' from */
    pwd: string
    /** Args to pass to 'go test' */
    goTestArgs: string
    /** Github access token */
    githubToken: string
}



export async function executeTests(opts: TestRunnerOpts) {
    //==< Ensure go is installed and on PATH >=================|
    if (!commandExists.sync('go')) {
        core.error("Required executable 'go' not found on $PATH", {
            title: "Required executable not found",
        })
    }

    //==< Configure the github client >=================|
    const token = opts.githubToken;
    const gh = github.getOctokit(token, {
        userAgent: 'wetransfer/gh-action-go-test'
    })


    //==< Mark the test check as starting >=================|
    const check = await gh.rest.checks.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        name: opts.runName,
        head_sha: github.context.sha,
        status: 'in_progress',
        started_at: new Date().toISOString(),
    })

    //==< Execute tests and grab json output >=================|
    const testJson = await runGoTest(opts.goTestArgs, opts.pwd)

    //==< Set up the outputs >=================|


    //==< Mark the check as complete >=================|
    await gh.rest.checks.update({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        check_run_id: check.data.id,

        status: 'completed',
        completed_at: new Date().toISOString(),
        conclusion: 'neutral'
    })
}



function spawnGoTest(cwd: string): ChildProcessWithoutNullStreams {
    return spawn('go', ['test', '-v', '-json', './...'], {
        cwd,
    })
}

function spawnGoTestFmt(opts: {
    cwd: string,
    ci?: string,
}): ChildProcessWithoutNullStreams {
    let args: string[] = []
    if (opts.ci) {
        args = [...args, '-ci',opts.ci ]
    }

    return spawn('gotestfmt', args, {
        cwd: opts.cwd
    })
}

function runGoTest(args: TestRunnerOpts["goTestArgs"], cwd: string): Promise<string> {
    
    // Test runner emits results as json
    const goTestProc = spawnGoTest(cwd)

    // Formatter to make stdout pretty for github
    const goTestFmtProc1 = spawnGoTestFmt({
        cwd,
        ci: 'github',
    })
    // Pipe formatted output to process stdout to display it
    goTestFmtProc1.stdout.pipe(process.stdout)
    
    
    // Formatter to make stdout pretty for github
    // Pipe test results into it
    const goTestFmtProc2 = spawnGoTestFmt({
        cwd: pkgDir,
        ci: 'markdown'
    })


    goTestProc.stdout.pipe(goTestFmtProc1.stdin)
    goTestProc.stdout.pipe(goTestFmtProc2.stdin)

    return pipeToBufferAsync(goTestFmtProc2.stdout)
}


function pipeToBufferAsync(stream: Readable): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let buf = ''
        stream.on('error', (err) => {
            reject(err)
        })
        stream.on('end', () => {
            resolve(buf)
        })
        stream.on('data', (data) => {
            buf += data
        })
    })
}