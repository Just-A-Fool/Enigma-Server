# Aedan's Enigma Server

Live app: https://aedan-enigma.now.sh/

Client GitHub: https://github.com/Just-A-Fool/Enigma-Client

## API
_________
Unprotected-Endpoints
_____________________

`POST /signup` Creates new user if sucessful in signup attempt. Requires body to be an object with 'username', 'password' and 'email' keys. Returns 201 if sucessful.

- Username may not be more than 20 characters. 

- Password must be between 8-32 characters and have an Upper/Lower/Number.

- Email must be less than 40 characters and have an @ in it. 

`POST /login` Logs in a user if supplied with correct information. Requires body to be an object with 'username' and 'password' keys. Returns 200 with JWT if sucessful. 

_____

Protected-Endpoints
___________________

`GET /cipher` Returns all saved ciphers for a user who is 'logged in'. Returns 200 if sucessful and an array of objects in the shape of: 

    [{
        id: 1,
        data: (JSON string of cipher data.)
    }]

`POST /cipher` Saves a new cipher for a user who is 'logged in'. Returns 201 if sucessful. Requires the body to be an object in the shape of:

    {
        rotor1: {
            which: 'I',
            shift: 0
        }
        rotor2: {
            which: 'II',
            shift: 0
        }
        rotor3: {
            which: 'III',
            shift: 0
        }
        plug: {
            A: 'B',
            C: 'D'
        }
    }

- "Which" values must be one of the following: I, II, III, IV, V.

- "Shift" values must be a number between 0-25.

- "Plug" key/value pairs must only be capital letters.

`DELETE /cipher/:id` Deletes a specified cipher if the user is logged in and is allowed access to the cipher. Returns 204 if sucessful.

___________
Errors
______

- `All Errors` will return with an error status and an object with a message key. The error message is written there. 

______


## Summary

This server allows for the saving/retrieval of Enigma settings called ciphers. Users are able to sign-up/log in and use this service. The data is stored in a PostgreSQL database. 

## Technology Used

Javascript, PostgreSQL, Express, Mocha, Chai