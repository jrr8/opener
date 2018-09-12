# Authentication
To access any endpoint of this API, a user must first `POST` to `/auth/login`
and supply an email and password to verify that they are a valid
user of this service. The given email and password will be compared against
the stored hash of the password. Upon success, a session variable
indicating the logged in user is set, and upon failure a `401` error
is returned.

# Get Test Plan
Returns JSON data on the given test approval plan and its associated workflow

* **URL:**

  `/plan`

* **Method:**
  
  `GET`
  
*  **URL Query Params:**

    * `id` - The id of the desired test plan. **Required**
    
* **Sample Call:**
    ```javascript
    $.ajax({
        url: "/plan",
        method: "GET",
        data: {
            // for GET requests, ajax automatically
            // appends these fields to the url
            // (e.g. "/plan?id=1001")
            id: 1001
        },
        dataType: "json",
        success: function(r) {
            console.log(r)
        }
    })
    ```

* **Success Response:** 

  * **Code:** 200 <br />
    **Content:**
    ```javascript
    {    
      id : 1001,
      title: "Sample Test 1",
      description: "...",
      author: "Alexa Smith",
      created: "2018-08-21: 12:30:11.4011",
      status: "complete",
      stages: [
                {
                  id: 3001,
                  description: "Author approval",
                  approved: true
                }
              ]
    }
    ```
 
* **Error Response:**

  * **Code:** `400` <br />
    **Content:**
    ```
    { error : "Test plan '<sample_id>' does not exist" }
    ```
    
* **Notes:**
  
  * Any logged in user can access retrieve data for any
  test plan. In the future, test plans may be restricted to
  only users related to the test.
    
# Set User Data
Sets the specified data for the given user in the database and returns
the JSON of the new record.

* **URL:**

  `/user`

* **Method:**
  
  `POST`
  
* **Data Params:**

    * `id` - The id of the user who's data will be set. **Required**
    * `phone` - User's phone number in (xxx)xxx-xxxx format. Optional
    * `risk_clearance` - One of `LOW`, `MODERATE`, `HIGH`, `SEVERE`. Optional
    * `password` - A new password for the user. Optional
    
* **Sample Call:**
    ```javascript
    $.ajax({
        url: "/user",
        method: "POST",
        data: {
            id: 4001,
            email: "new_email@opener.aero"
        },
        dataType: "json",
        success: function(r) {
            console.log(r)
        }
    })
    ```

* **Success Response:** 

  * **Code:** 200 <br />
    **Content:**
    ```javascript
    {    
      id : 4001,
      first_name: "Alexa",
      last_name: "Smith",
      position: "engineer",
      phone: "(555)555-5001",
      email: "new_email@opener.aero",
      risk_clearance: "LOW",
      password: "..."
    }
    ```
 
* **Error Response:**

  * **Code:** `400` <br />
    **Content:**
    ```
    { error : "User '<sample_id>' does not exist" }
    ```
    or
    ```javascript
    { error: "Field '<field_name> is improperly formatted" }
    ```
    
* **Notes**
    
  * As this endpoint sets data in the database, given fields must be
  validated to ensure data-integrity. This depends on the nature of each supplied
  field, but email addresses must be valid, phone numbers must be of an expected
  format, etc.. Also, data can only be set for the logged in user to prevent
  one user from altering another.




 
