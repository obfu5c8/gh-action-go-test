export interface TestRunnerOpts {
    /** Display name of the test run */
    runName: string;
    /** Folder to execute 'go test' from */
    pwd: string;
    /** Args to pass to 'go test' */
    goTestArgs: string;
    /** Github access token */
    githubToken: string;
}
export declare function executeTests(opts: TestRunnerOpts): Promise<void>;
//# sourceMappingURL=testrunner.d.ts.map