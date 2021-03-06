# `/plan` Endpoint
This SQL query would be called in the handler for the `/plan`
endpoint where `sample_id` is the id supplied by the user in the
`GET` request. These records would be further processed
by the handler before returning the JSON result to the client
```sql
SELECT plans.*, stages.*, users.*
FROM ((plans
    LEFT JOIN stages ON stages.workflow=plans.workflow)
    LEFT JOIN users on users.user_id=plans.author)
WHERE plans.plan_id=sample_id;
```

# `/user` Endpoint
This SQL query would be called in the handler for the `/user`
endpoint. Here, `user_id` is given in the body of the `POST`
and `updates` would be generated by the handler based on the body
of the `POST`. For example, if the posted data is
```
{ phone: (555)555-5555, email: "abc@opener.aero" }
```
Then `updates` would be the string 
```
"phone='(555)555-5555', email='abc@opener.aero'"
```
The handler would also validate the supplied data before making this
query and return an error if the any fields are invalid.

The query is:
```sql
UPDATE users SET updates WHERE users.user_id=user_id
```