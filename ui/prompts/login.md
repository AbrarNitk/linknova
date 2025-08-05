# About Login


We have a basic login functionality, On click submit we hit the POST `/-/ln/api/login` REST api
with the below data. On this api call we get the redirected response as LOCATION header.

I don't how to handle the redirect with the fetch request, because we are also setting the
Cookie header in the response.

You can check @routes/login.rs file for more info, here I am doubtful, I don't want to persist
the user, just set the cookie as header whatever the name is coming. Make sure not to change any
code related to user persistence, only accept the data either as json or any other format set the
cookie and send the redirect. 

We can even try accepting the form-data in the rust axum routes, and try it out. Only things that
is matter better way of handling the cookie.

If use change any thing in the UI so make sure it must related to user only and nothing else.

```json
{
    "username": "username",
    "password": "user-password" 
}
```

