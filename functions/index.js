


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

const nodeMailer = require('nodemailer');
const mailTransport = nodeMailer.createTransport({
  host:'smtp.gmail.com',
  port:465,
  secure:true,
  auth:{
    user:'smart.bus.vast@gmail.com',
    pass:'smartbus123'
  }
}) 

//const ref = admin.database.ref();

exports.sendMail = functions.database.ref('/Users/{pushId}').onWrite(event =>{
  const user = event.data.val();
  if (user.roleId === 2)
  {
    //parent 

    const mailId = user.email;
    const name = user.firstName;
    console.log(mailId);
    const mailOptions = {
      from:'SmartBus <smart.bus.vast@gmail.com>',
      bcc:mailId,
      subject:'Smart Bus Tracking System',
      text:'Dear ' + name + ',' + '\r\n \r\n Your Registration is successfull.\r\n Kindly use below login credentials. \r\n Email: ' +mailId + ' \r\n Password: pnt12345678'

    }
    return mailTransport.sendMail(mailOptions).then(()=>{
      console.log("send mail");
       return null;

    }).catch(error =>{
      console.log(error);
      return null;
    });
  }
  console.log(user);
})


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
