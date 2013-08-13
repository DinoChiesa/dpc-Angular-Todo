
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
