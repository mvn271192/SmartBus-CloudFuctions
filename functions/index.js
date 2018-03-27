

const functions = require('firebase-functions');
var bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors')({
  origin: true,
});
const app = express();

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


app.use(bodyParser.json());
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
//  console.log("my first function called");
// });

exports.addBus = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  var busNumber = req.query.busNo;
  var numberOfSeats = parseInt(req.query.noSeat);
  //const busData = {'busNumber':busNumber,'numberOfSeats':numberOfSeats};


  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  return admin.database().ref('/Buses').push({ 'busNumber': busNumber, 'numberOfSeats': numberOfSeats }).then((snapshot) => {
    const jsonRes = { 'key': snapshot.key };
    console.log(jsonRes);
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    // return res.redirect(303, snapshot.ref);
    return res.json(jsonRes);

  });
});

exports.authenticateUser = functions.https.onRequest((req, res) => {
  console.log("request-body", req.body);
  return cors(req, res, () => {
    console.log("request-body", req.body);
    const loginName = req.body.loginName;
    const password = req.body.password;
    console.log(password);
    admin.database().ref('/Users').orderByChild('loginName').equalTo(loginName).once('value').then(snapshot => {
      if (snapshot.numChildren() === 1) {
        snapshot.forEach(function (data) {
          console.log(data.val());
          if (data.val().password === password) {
             return res.json({ 'Status': 'Success', 'Key': data.key });
          }
          else {
            return  res.json({ 'Status': 'Fail', 'Reson': 'Invalid password' });
          }

        });

        return res.json({ 'Status': 'Fail', 'Reson': 'Invalid Login name' });
      }
      else {
        return res.json({ 'Status': 'fail', 'Reson': 'No user exist' });
      }


    }).catch(reson => {
      return res.json({ 'Status': 'fail', 'Reson': reson });
    });

  });



});
