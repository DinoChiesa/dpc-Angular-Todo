
# Toy Todo List App


This toy todo list app uses [AngularJS](http://angularjs.org/)
for MVC, [Bootstrap](http://twitter.github.com/bootstrap/) for
styling, and [Usergrid](https://apigee.com/usergrid) for backend
storage. 

I use it on an ongoing basis for fiddling with Angular things.
I've published it as a simple example. 


## To use it

This is a single-page HTML5 web app.  You can run it from any HTTP server, even
localhost. To use it: unpack it and load the index.html for the app. 

The app should ask you to login or register. Obviously on the first run
you need to register. Thereafter, you can login .

The app uses a pretty transparent file layout: 
```
  app/index.html
  app/scripts/...
  app/views/...
  app/styles/...
  app/img/...
```

## Hacking it

To really get the feel for things, you'll want to hack it.  The first
change to make is to direct the todolist controller to your own usergrid
org+app.  

In order for that to work, first you need your own App Services org. You
can use a free org, sign up if you don't have one.  Then create an app
in App Services, I suggest you use a new one just for this todolist
app. Then, you need to establish these permissions in App Services for
the default role:

```
    /users        POST
    /items    GET POST     DELETE
    /items/*           PUT DELETE
```
and these permissions for the guest role
in App Services:

```
    /users        POST
```

You can do this through the App Services Admin UI; it's pretty
self-explanatory if you go to "User Management" and click on the
appropriate roles.  You can also do it in an automated fashion using
curl commands.

For the latter, first, login to the Admin UI and get the
org creds - this is a client_id and client_secret.

Then, authenticate: 

```
    curl -X POST -i -H "Content-Type: application/json" \
        "https://api.usergrid.com/management/token" \
        -d '{"grant_type":"client_credentials","client_id":"XXXXXXX","client_secret":"ZZZZZZZ"}'
```

in response, you get a token: 

```json
    {
      ...
      "access_token": "TOKEN_HERE"
    }
```

With the token, make the following curl commands: 

```
    curl -X POST -H "authorization: Bearer TOKEN_HERE" \
       -d '{ "permission" : "post:/users" }' \
      "https://api.usergrid.com/{your_org}/{your_app}/roles/default/permissions"

    curl -X POST -H "authorization: Bearer TOKEN_HERE" \
       -d '{ "permission" : "get,post,delete:/items" }' \
      "https://api.usergrid.com/{your_org}/{your_app}/roles/default/permissions"

    curl -X POST -H "authorization: Bearer TOKEN_HERE" \
       -d '{ "permission" : "put,delete:/items/*" }' \
      "https://api.usergrid.com/{your_org}/{your_app}/roles/default/permissions"

    curl -X POST -H "authorization: Bearer TOKEN_HERE" \
       -d '{ "permission" : "post:/users" }' \
      "https://api.usergrid.com/{your_org}/{your_app}/roles/guest/permissions"
```




## Bugs

- depends on a patched version of ui-bootstrap v0.5.0. 

- It should be possible to specify the UG org+app when signing in and registering. 
  This information should be cached on the machine under the html5 app key (uuid). 



## Fixed Things

- the log window is now a slideout. 


