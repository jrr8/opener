# Email Notifications
The main activity in the service is when an approval stage
is granted or denied, or when a new test approval plan is created.

In the case that a stage is approved, the author of the plan and the author's
managers should be emailed. In the case of a severe risk test, the CEO
should also be notified. This is redundant since the managers and CEO (depending on the risk level)
are the ones approving the stage, but this helps in cases where someone
maliciously or accidentally approves a stage on someone else's behalf. A similar
notification would go out in the case of a denial, and the author should
probably be given a description of why the approval was not granted in this case.

It would be useful if upon the approval of one stage the manager
required to sign-off on the next stage is notified that their review
is required for this new stage.

When a new plan is created, the listed author will be notified of the plan
and of their responsibility to sign-off on the initial stage

## Sample email
A notification email should be sent to the appropriate parties as described above,
and we may as well cc the author so they are kept up to date. 

A sample email notification for a stage being approved may have a subject line: 
'Update for test plan "Sample Test"', and the body would include:
"Alexa Smith has approved the second stage of your plan! Next, Jacques
Bernard must sign off. He has been notified, but consider following up
with him if you don't get any more notifications in a few days".