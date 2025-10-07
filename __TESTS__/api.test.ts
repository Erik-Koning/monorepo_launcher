const { exec } = require("child_process");

test("Checks for function calls present", (done) => {
  exec("./scripts/checkForFunctionCalls.sh", (error: any, stdout: any, stderr: any) => {
    console.log(stdout);
    if (error) {
      done(error); // Fail the test if there's an error
      return;
    }

    //expect(stdout.trim()).toBe("Hello from Bash script!");
    expect(stderr).toBe(""); // Ensure no errors are output
    done(); // Mark the test as complete
  });
});
