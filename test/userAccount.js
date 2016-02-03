var expect = require('chai').expect,
    userAccount = require('../models/Account.js');

describe('Account Tests', function() {

    it('ADD a new user', function(done){
        userAccount.createUser({
            userEmail: "pdiederichssierr@fullsail.edu",
            userPassword: "hello",
            userName:"Paul Diederichs",
            userPhone:9046242477
            }, function (doc) {
                var newUser = doc;
                expect(doc).not.to.be.null;
                userAccount.getUser({userEmail:"pdiederichssierr@fullsail.edu"}, function(targetDoc){
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
            userEmail: "bbergh@fullsail.edu",
            userPassword: "bb",
            userName:"Brandy Bergh",
            userPhone:8918223211
            }, function (doc) {
                var removeUser = doc;
                expect(doc).not.to.be.null;
                userAccount.destroyUser({userEmail:"bbergh@fullsail.edu"}, function() {
                    userAccount.getUser({userEmail:"bbergh@fullsail.edu"}, function(targetDoc){
                        expect(targetDoc).to.be.empty;
                        done();
                    });
                });
        });
        //done();
    });
    //remove all test from db
    it('REMOVE all test users',function (done){
        userAccount.destroyUser({userEmail: "pdiederichssierr@fullsail.edu"}, function() {
            userAccount.getUser({userEmail: "pdiederichssierr@fullsail.edu"}, function(targetTest){
                expect(targetTest).to.be.empty;
                done();
            });
        });
        //done();
    });
});
