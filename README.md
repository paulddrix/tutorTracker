# Tutor Tracker
Application to Manage tutors in a university environment

[ ![Codeship Status for paulddrix/tutortracker](https://codeship.com/projects/30548ba0-a8ef-0133-4556-528fa7782574/status?branch=master)](https://codeship.com/projects/130786)

#Alpha Release v0.2.5

##Running it
- Just clone the repository
- run `npm install`
- create a .env file with the following in it:
`DEBUG='true'
MONGOLAB_URI='mongodb://localhost:27017/tutorTracker'`
- run `gulp setup` to create test users and test data

and then node app.js. That's it :).

If you want to run it on another port, just run PORT=3001 node app.js to run it on port 3001 for example
