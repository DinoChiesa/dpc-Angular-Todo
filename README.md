
Toy Todo List App
========================

This toy todo list app uses [AngularJS](http://angularjs.org/)
for MVC, [Bootstrap](http://twitter.github.com/bootstrap/) for
styling, and [Usergrid](https://apigee.com/usergrid) for backend
storage. The scaffolding was created with yeoman, which is
nice.** Yeoman also gave me [Grunt](http://gruntj.com) for
running a test server with automagic
[LiveReload](http://livereload.com/) capability.

All good.


I've published it as a simple example.



To use it
========================

This is just an HTML5 app.  You can run it from any HTTP server, even
localhost. To use it: unpack it and load the index.html for the app. 

The app should ask you to login or register. Obviously on the first run
you need to register. Thereafter you can login .

The app uses a standard file layout: 
  app/index.html
  app/scripts/...
  app/views/...
  app/styles/...
  app/img/...


Hacking it
========================

To really get the feel for things, you'll want to hack it.  The first
change to make is to direct the todolist controller to your own usergrid
org+app.  

In order for that to work, first you need your own App Services org. You
can use a free org, sign up if you don't have one.  Then create an app
in App Services, I suggest you use a new one just for this todolist
app. Then, you need to establish these permissions for the default role
in UG on that app:

    /users        POST
    /items    GET POST     DELETE
    /items/*           PUT DELETE

You can do this through the UG Admin UI, or using curl commands.

To do it with curl commands, first, login to the Admin UI and get the
org creds - this is a client_id and client_secret.

Then, authenticate: 

    curl -X POST -i -H "Content-Type: application/json" \
        "https://api.usergrid.com/management/token" \
        -d '{"grant_type":"client_credentials","client_id":"XXXXXXX","client_secret":"ZZZZZZZ"}'

in response, you get a token: 

    {
      ...
      "access_token": "TOKEN_HERE"
    }


With the token, make the following curl commands: 

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


 




The use of Yeoman
========================

As far as I can tell, Yeoman  scaffolds out new webapps and other types of apps.
I dont know what Bower is, but it uses that.
It also uses Grunt which is just a task manager, like a build tool for
Javascript, based on Node.js.


I started this project by doing this:

    # install generators
    npm install generator-angular generator-testacular

    # scaffold out a AngularJS project
    yo angular

    # install default dependencies
    npm install && bower install --dev

    # install a dependency for your project from Bower
    bower install angular-ui

    # test your app
    grunt test

    # preview your app
    grunt server

    #  build the application for deployment
    grunt


You don't need to know this to use the project. I'm adding it here only
for interest.

You need yeoman to use this app as is; yeoman is really for initial set
up as far as I can tell.  You also don't NEED to use Grunt, but you
could use it.


Bugs
======

- depends on a patched pre-release snapshot of ui-bootstrap v0.4.0. 
  need to upgrade to v0.4.0

- the log window needs to be a slideout. I don't know what the eidget is in angular. 

- It should be possible to specify the UG org+app when signing in and registering. 
  This information should be cached on the machine under the html5 app key (uuid). 
