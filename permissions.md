# Permissions
1) Any user of the service must have an account
2) Only the author of the plan and the author's manager can view the plan
3) For each approval stage, only the specified user for that
stage can sign-off
4) Only the logged in user and system admins can alter a user's record
in the database with a `POST` to `/user`
5) To submit a new plan, a user must have a manager sign-off on the
risk level of the test. This prevents a user from side-stepping the
approval by stating the test has a low risk level