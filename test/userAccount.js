var expect = require('chai').expect,
    userAccount = require('../models/account');
    // Dot Env File Loader
    if(!process.env.PORT){
    	var dotenv = require('dotenv').load();
    }

describe('Account Tests', function() {

    it('Create a new user', function(done){
        userAccount.createUser({
            email: "tester@testsuit.test",
            password: "testing101",
            name:"Tester Quiz",
            phone:6060606060
          }, function (err,doc) {
                var newUser = doc;
                expect(doc).not.to.be.null;
                userAccount.getUser({email:"tester@testsuit.test"}, function(err,targetDoc){
                    expect(targetDoc).not.to.be.null;
                    done();
                });

        });
        //done();
    });

    it('FIND ALL users', function(done){
        userAccount.getUsers({},function(err,targetDoc){
            expect(targetDoc.length).not.to.be.empty;
            done();
        });
    });

    it('REMOVE an existing user', function(done){
        userAccount.createUser({
            email: "bbergh@fullsail.edu",
            password: "bb",
            name:"Brandy Bergh",
            phone:8918223211
          }, function (err,doc) {
                var removeUser = doc;
                expect(doc).not.to.be.null;
                userAccount.destroyUser({email:"bbergh@fullsail.edu"}, function() {
                    userAccount.getUser({email:"bbergh@fullsail.edu"}, function(err,targetDoc){
                        expect(targetDoc).to.be.empty;
                        done();
                    });
                });
        });
        //done();
    });
    //remove all test from db
    it('REMOVE all test users',function (done){
        userAccount.destroyUser({email: "tester@testsuit.test"}, function() {
            userAccount.getUser({email: "tester@testsuit.test"}, function(err,targetTest){
                expect(targetTest).to.be.empty;
                done();
            });
        });
        //done();
    });
});
