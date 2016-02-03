var expect = require('chai').expect,
    userAccount = require('../models/Account.js');

describe('Account Tests', function() {

    it('ADD a new user', function(done){
        userAccount.createUser({
            email: "pdiederichssierr@fullsail.edu",
            password: "hello",
            name:"Paul Diederichs",
            phone:9046242477
            }, function (doc) {
                var newUser = doc;
                expect(doc).not.to.be.null;
                userAccount.getUser({password:"hello"}, function(targetDoc){
                    expect(targetDoc).not.to.be.null;
                    done();
                });

        });
        //done();
    });

    it('FIND ALL users', function(done){
        userAccount.getUsers(function(targetDoc){
            expect(targetDoc.length).to.be.above(1);
            done();
        });
    });

    it('REMOVE an existing user', function(done){
        userAccount.createUser({
            email: "bbergh@fullsail.edu",
            eassword: "bb",
            name:"Brandy Bergh",
            phone:8918223211
            }, function (doc) {
                var removeUser = doc;
                expect(doc).not.to.be.null;
                userAccount.destroyUser({email:"bbergh@fullsail.edu"}, function() {
                    userAccount.getUser({email:"bbergh@fullsail.edu"}, function(targetDoc){
                        expect(targetDoc).to.be.empty;
                        done();
                    });
                });
        });
        //done();
    });
    //remove all test from db
    it('REMOVE all test users',function (done){
        userAccount.destroyUser({email: "pdiederichssierr@fullsail.edu"}, function() {
            userAccount.getUser({email: "pdiederichssierr@fullsail.edu"}, function(targetTest){
                expect(targetTest).to.be.empty;
                done();
            });
        });
        //done();
    });
});
