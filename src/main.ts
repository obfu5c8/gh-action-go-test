import core from "@actions/core"
import gh from "@actions/github"


try {

    const inputs = {
        name: core.getInput('name'),
        packages: core.getInput('packages'),
        coverage: core.getBooleanInput('coverage')
    }

    console.log(inputs)
    
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);

    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(gh.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);


  } catch (error: any) {
    core.setFailed(error.message);
  }