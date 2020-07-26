require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
// const mysql = require('mysql');
var blockchainFunction = require('../Connection/query.js');
const { time } = require('console');
// const connection_mysql = require('./mysql.json');


const port = 3030;


// create express app Initialization of object for express
const app = express();
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(cors());



// -------------------------- Creating Mysql connection ---------------------------------------- 

// const connection = mysql.createConnection(connection_mysql.development);

// connection.connect(function(err) {
//     if (err) {throw err;}
//     console.log('\n ***************Connection Established with International Security Database*****************')
// });

// ------------------------------------------------------------------------------------------------




// Get Request - for checking of API.

function initial(req,res) {
    res.json({message: 'Welcome to Healthcare medical blockchain on Hyperledger fabric'});
}

app.get('/',initial);


// This is to query any single transaction 

app.get('/getSingleTransaction/:TXNKey',async(req,res) => {
    let TXNKey = req.params.TXNKey;
    TXNKey = TXNKey.toString();

    await blockchainFunction.postTransaction("user3", "ISOcode", "querySingle",[TXNKey], function(err,result){
        try  {
         if (err == null) {
             res.json({
                 'Success':1,
                 'Result':JSON.parse(result),
                 'queryKey': TXNKey,
                 'Msg':'Transaction is successful'
             });
         }
         else{
             res.json({
                 'Success':0,
                 'ERR':err,
                 'Msg':'Error occured'
             });
         }
        }
        catch (error){
             res.json({'Suuccess':0,'ERR':error})
        }
        
      });
});





app.post('/post/registerPatient',(req,res) =>{
    try{
        let patientId = req.body.patientId;
        let patientName = req.body.patientName;
        let patientEmail = req.body.patientEmail;


        blockchainFunction.invokeChaincode("user3", "ISOcode", "patientRecord", "mychannel", [patientId,patientName,patientEmail,"",""], function(err,result){
            console.log(err,result);
            if(!err){
    
            res.json({
                 'Success':1,
                 'Transaction ID':result,
                 'queryKey': patientId,
                 'Msg':'Transaction is successful'
            });}
            else{
                res.json({'Suuccess':0,'ERR':err || "ERROR OCCURED"});

            }
            });

    }catch(error){
        var errData = error.toString()
        console.error(`Error Occured: ${error}`);
        res.json({'Suuccess':0,'ERR':errData || "ERROR OCCURED"});
    }

})




app.post('/post/registerDoctor',(req,res) =>{
    try{
        let doctorId = req.body.doctorId;
        let doctorName = req.body.doctorName;
        let doctorEmail = req.body.doctorEmail;
        let hospitalId = req.body.hospitalId;
        let hospitalName = req.body.hospitalName;



        blockchainFunction.invokeChaincode("user3", "ISOcode", "doctorRecord", "mychannel", [doctorId,doctorName,doctorEmail,hospitalId,hospitalName], function(err,result){
            console.log(err,result);
            if(!err){
    
            res.json({
                 'Success':1,
                 'Transaction ID':result,
                 'queryKey': doctorId,
                 'Msg':'Transaction is successful'
            });}
            else{
                res.json({'Suuccess':0,'ERR':err || "ERROR OCCURED"});

            }
            });

    }catch(error){
        var errData = error.toString()
        console.error(`Error Occured: ${error}`);
        res.json({'Suuccess':0,'ERR':errData || "ERROR OCCURED"});
    }

})


// This is used to create medical Record

app.post('/post/medicalRecord',(req,res) =>{
    try{
        let medicalRecordId = req.body.medicalRecordId;
        let uploadedBy = req.body.uploadedBy;
        let medicalRecordData = req.body.medicalRecordData;
        let attachments = req.body.attachments;

        var date = new Date();
        var epochTime = date.getTime();
        var DateandTime = epochTime.toString() ; 
    


        blockchainFunction.invokeChaincode("user3", "ISOcode", "medicalRecord", "mychannel", [medicalRecordId,uploadedBy,DateandTime,medicalRecordData,attachments], function(err,result){
            console.log(err,result);
            if(!err){
    
            res.json({
                 'Success':1,
                 'Transaction ID':result,
                 'queryKey': medicalRecordId,
                 'Msg':'Transaction is successful'
            });}
            else{
                res.json({'Suuccess':0,'ERR':err || "ERROR OCCURED"});

            }
            });

    }catch(error){
        var errData = error.toString()
        console.error(`Error Occured: ${error}`);
        res.json({'Suuccess':0,'ERR':errData || "ERROR OCCURED"});
    }

})





app.post('/post/grantPermissionToDoctor',(req,res) =>{
    try{
        let patientId = req.body.patientId;
        let doctorId = req.body.doctorId;

        blockchainFunction.invokeChaincode("user3", "ISOcode", "permissionAppend", "mychannel", [patientId,doctorId], function(err,result){
            console.log(err,result);
            if(!err){
    
            res.json({
                 'Success':1,
                 'Transaction ID':result,
                 'Msg':'Access given to doctor'
            });}
            else{
                res.json({'Suuccess':0,'ERR':err || "ERROR OCCURED"});

            }
            });

    }catch(error){
        var errData = error.toString()
        console.error(`Error Occured: ${error}`);
        res.json({'Suuccess':0,'ERR':errData || "ERROR OCCURED"});
    }

})




app.post('/post/addMedicalRecordToPatient',(req,res) =>{
    try{
        let patientId = req.body.patientId;
        let medicalRecordId = req.body.medicalRecordId;

        blockchainFunction.invokeChaincode("user3", "ISOcode", "medicalRecordAppend", "mychannel", [patientId,medicalRecordId], function(err,result){
            console.log(err,result);
            if(!err){
    
            res.json({
                 'Success':1,
                 'Transaction ID':result,
                 'Msg':'Medical record added to Patient'
            });}
            else{
                res.json({'Suuccess':0,'ERR':err || "ERROR OCCURED"});

            }
            });

    }catch(error){
        var errData = error.toString()
        console.error(`Error Occured: ${error}`);
        res.json({'Suuccess':0,'ERR':errData || "ERROR OCCURED"});
    }

})



app.post('/post/revokePermissionToDoctor',(req,res) =>{
    try{
        let patientId = req.body.patientId;
        let doctorId = req.body.doctorId;

        blockchainFunction.invokeChaincode("user3", "ISOcode", "revokePermission", "mychannel", [patientId,doctorId], function(err,result){
            console.log(err,result);
            if(!err){
    
            res.json({
                 'Success':1,
                 'Transaction ID':result,
                 'Msg':'Access revoke from doctor'
            });}
            else{
                res.json({'Suuccess':0,'ERR':err || "ERROR OCCURED"});

            }
            });

    }catch(error){
        var errData = error.toString()
        console.error(`Error Occured: ${error}`);
        res.json({'Suuccess':0,'ERR':errData || "ERROR OCCURED"});
    }

})





// app.post('/createTransaction', async(req,res) => {
//     let tx_id = req.body.tx_id;
//     let Receiver = req.body.Receiver;
//     let Sender = req.body.Sender;
//     let ExchangedAmountCopper = req.body.ExchangedAmountCopper;
//     let ExchangedAmountSilver = req.body.ExchangedAmountSilver;
//     let ExchangedAmountGold = req.body.ExchangedAmountGold;
//     let ExchangedAmountDiamond = req.body.ExchangedAmountDiamond;
//     let ExchangedAmountPlatinum = req.body.ExchangedAmountPlatinum;

//     console.log("Params inserted \t ",ExchangedAmountCopper,ExchangedAmountSilver,ExchangedAmountGold)
    

//     var date = new Date();
//     var epochTime = date.getTime();
//     var timeStamp = epochTime.toString() ; 

//     // Creating a Receiver and Sender Balance ID .
//     // It will act as a Hash key for their balance db
//     var ReceiverBalanceId = 'BAL'.concat(Receiver);
//     var ReceiverBalanceIdStr  = ReceiverBalanceId.toString();

//     var SenderBalanceId = 'BAL'.concat(Sender);
//     var SenderBalanceIdStr = SenderBalanceId.toString();

//     var ReceiverBalanceCopper,ReceiverBalanceSilver,ReceiverBalanceGold,ReceiverBalanceDiamond,ReceiverBalancePlatinum,
//     SenderBalanceCopper,SenderBalanceSilver,SenderBalanceGold,SenderBalanceDiamond,SenderBalancePlatinum;
    
//     try {

//         await blockchainFunction.postTransaction("user3", "ISOcode", "querySingle",[ReceiverBalanceIdStr], async function(err,queryRes){
//            console.log("RESPONSE of query Reciever \n",queryRes);
//         //    console.log(typeof("TYPE OF \t",queryRes));

//             if (typeof(queryRes) === 'undefined'){
//                 console.log("We are in the the loop of Gravity, Let's start from scratch creating a wallet")
//              ReceiverBalanceCopper = 0 ,ReceiverBalanceSilver = 0,
//              ReceiverBalanceGold = 0, ReceiverBalanceDiamond = 0,
//              ReceiverBalancePlatinum = 0 ;
//              console.log(`\n \n Wanna have a look at wallet balance \t Receiveer:`,ReceiverBalanceCopper,ReceiverBalanceSilver,ReceiverBalanceGold,ReceiverBalanceDiamond,ReceiverBalancePlatinum);

//             }
//             else{
//                 console.log("This is something serious, you already have some dolla bills")

//                 var prev_bal = JSON.parse(queryRes);
//                 // console.log("Previous balance of receiver = > \t", prev_bal);
//                 ReceiverBalanceCopper = parseInt(prev_bal.CopperBalance);
//                 ReceiverBalanceSilver = parseInt(prev_bal.SilverBalance);
//                 ReceiverBalanceGold = parseInt(prev_bal.GoldBalance);
//                 ReceiverBalanceDiamond = parseInt(prev_bal.DiamondBalance);
//                 ReceiverBalancePlatinum = parseInt(prev_bal.PlatinumBalance);

//             }
//             // console.log(`Query Performed Receiver Balance is:`,ReceiverBalanceCopper,ReceiverBalanceSilver,ReceiverBalanceGold,ReceiverBalanceDiamond,ReceiverBalancePlatinum);



//             await blockchainFunction.postTransaction("user3", "ISOcode", "querySingle",[SenderBalanceIdStr], function(err,querySend){
//                 console.log("Sender type =>",querySend)
//                 if (typeof(querySend) === 'undefined'){
//                     SenderBalanceCopper = 0,SenderBalanceSilver = 0,
//                     SenderBalanceGold = 0,SenderBalanceDiamond = 0,
//                     SenderBalancePlatinum = 0;           
//                     // console.log(`Time to create wallet is: ${"SENDERR \n \n",SenderBalanceCopper.toString()}`);
//                 }
//                 else{
//                     var prev_bal = JSON.parse(querySend);
//                     SenderBalanceCopper = parseInt(prev_bal.CopperBalance);
//                     SenderBalanceSilver = parseInt(prev_bal.SilverBalance);
//                     SenderBalanceGold = parseInt(prev_bal.GoldBalance);
//                     SenderBalanceDiamond = parseInt(prev_bal.DiamondBalance);
//                     SenderBalancePlatinum = parseInt(prev_bal.PlatinumBalance);  
//                     }
//                 // console.log(`Query Performed Sender Balance is: ${"SENDERR \n \n",SenderBalanceCopper.toString()}`);



//             }); // Sender query await end

//         }); // Receiver query await end


//         // Call invoke chaincode to create a transaction 

//         blockchainFunction.invokeChaincode("user3", "ISOcode", "createUser", "mychannel", [tx_id,Receiver,Sender,timeStamp,ExchangedAmountCopper,ExchangedAmountSilver,ExchangedAmountGold,ExchangedAmountDiamond,ExchangedAmountPlatinum], async function (err, result) {
//             console.log(err, result);
            
//             if(!err){
//             // Calling Post Transaction to get previous receiver balance and storing it
//             // ---- Copper wallet addition and subtraction -----------------
//             var senderAmountDebitedCopper = SenderBalanceCopper - parseInt(ExchangedAmountCopper);
//             senderAmountDebitedCopper = senderAmountDebitedCopper.toString();

//             var receiverAmountCreditedCopper = ReceiverBalanceCopper + parseInt(ExchangedAmountCopper);
//             receiverAmountCreditedCopper = receiverAmountCreditedCopper.toString();

//             // ---------------- Silver Wallet addition and subtraction -----------------

//             var senderAmountDebitedSilver = SenderBalanceSilver - parseInt(ExchangedAmountSilver);
//             senderAmountDebitedSilver = senderAmountDebitedSilver.toString();

//             var receiverAmountCreditedSilver = ReceiverBalanceSilver + parseInt(ExchangedAmountSilver);
//             receiverAmountCreditedSilver = receiverAmountCreditedSilver.toString();

//             // ---------------- Gold Wallet addition and subtraction -----------------

//             var senderAmountDebitedGold = SenderBalanceGold - parseInt(ExchangedAmountGold);
//             senderAmountDebitedGold = senderAmountDebitedGold.toString();

//             var receiverAmountCreditedGold = ReceiverBalanceGold + parseInt(ExchangedAmountGold);
//             receiverAmountCreditedGold = receiverAmountCreditedGold.toString();

//             // ---------------- Diamond Wallet addition and subtraction -----------------

//             var senderAmountDebitedDiamond = SenderBalanceDiamond - parseInt(ExchangedAmountDiamond);
//             senderAmountDebitedDiamond = senderAmountDebitedDiamond.toString();

//             var receiverAmountCreditedDiamond = ReceiverBalanceDiamond + parseInt(ExchangedAmountDiamond);
//             receiverAmountCreditedDiamond = receiverAmountCreditedDiamond.toString();

//             // ---------------- Platinum Wallet addition and subtraction -----------------

//             var senderAmountDebitedPlatinum = SenderBalancePlatinum - parseInt(ExchangedAmountPlatinum);
//             senderAmountDebitedPlatinum = senderAmountDebitedPlatinum.toString();

//             var receiverAmountCreditedPlatinum = ReceiverBalancePlatinum + parseInt(ExchangedAmountPlatinum);
//             receiverAmountCreditedPlatinum = receiverAmountCreditedPlatinum.toString();

//             console.log("\n \n \n -------------------------------------BALANCE -------------------- \n \n")
//                 console.log("This is what we are going to exchange \n",typeof(senderAmountDebitedCopper),senderAmountDebitedSilver,senderAmountDebitedGold,senderAmountDebitedDiamond,senderAmountDebitedPlatinum)
//             blockchainFunction.invokeChaincode("user3", "ISOcode","createBalance", "mychannel", [SenderBalanceIdStr,senderAmountDebitedCopper,senderAmountDebitedSilver,senderAmountDebitedGold,senderAmountDebitedDiamond,senderAmountDebitedPlatinum], function(err,senderBalanceWrite){
//             //  console.log("BALANCEEE",err,senderBalanceWrite);
            
//             if(!err){

//                 blockchainFunction.invokeChaincode("user3", "ISOcode","createBalance", "mychannel", [ReceiverBalanceIdStr,receiverAmountCreditedCopper,receiverAmountCreditedSilver,receiverAmountCreditedGold,receiverAmountCreditedDiamond,receiverAmountCreditedPlatinum], function(err,receiverBalanceWrite){
//                 console.log(err,receiverBalanceWrite);
                
//                 if(!err){
           
//                     res.send({success: 1,
//                         message:'Transaction has been submitted,To get this Tx details store this TXN id => '+tx_id,
//                         transaction_id:tx_id,
//                         timeStamp:timeStamp,
//                         SenderAccountID:Sender,
//                         PreviousBalanceSender:{"Copper":SenderBalanceCopper,"Silver":SenderBalanceSilver,"Gold":SenderBalanceGold,"Diamond":SenderBalanceDiamond,"Platinum":SenderBalancePlatinum},
//                         ReceiverAccountID:Receiver,
//                         PreviousBalanceReceiver:{"Copper":ReceiverBalanceCopper,"Silver":ReceiverBalanceSilver,"Gold":ReceiverBalanceGold,"Diamond":ReceiverBalanceDiamond,"Platinum":ReceiverBalancePlatinum},
//                         Current_Amount_Exchanged:{"Copper":ExchangedAmountCopper,"Silver":ExchangedAmountSilver,"Gold":ExchangedAmountGold,"Diamond":ExchangedAmountDiamond,"Platinum":ExchangedAmountPlatinum}
//                     });
//                 }

//                 }); // receiver block end

//             } // end of if statement

//             }); // Sender write balance end
           

//             }else{
//             res.json({'Suuccess':0,'ERR':err});
//             }           

//         });

//     } catch (error) {
//         console.error(`Error Occured: ${error}`);
//         res.json({'Suuccess':0,'ERR':error});
//     }
// })


app.post('/getBalanceofAsset',(req,res)=>{

    try{

        let UserID = req.body.UserID;

        var UserBalanceId = 'BAL'.concat(UserID);
        var UserBalanceIdStr  = UserBalanceId.toString();
        
        
        blockchainFunction.postTransaction("user3", "ISOcode", "querySingle",[UserBalanceIdStr], function(err,resBalance){
        console.log(err,resBalance);
        if(err == null){

        res.json({
            'Success':1,
            'Balance':JSON.parse(resBalance),
            'UserID': UserID,
            'Msg':'Transaction is successful'
        });
    }
    else{
        var balData = {
            "CopperBalance": 0,
            "DiamondBalance": 0,
            "GoldBalance": 0,
            "PlatinumBalance": 0,
            "SilverBalance": 0,
            "docType": "balance"
        }
        res.json({'Suuccess':0,'Balance':balData});

    }
        });
        
    } catch (error){
        var errData = error.toString()
        var balData = {
            "CopperBalance": 0,
            "DiamondBalance": 0,
            "GoldBalance": 0,
            "PlatinumBalance": 0,
            "SilverBalance": 0,
            "docType": "balance"
        }
        console.error(`Error Occured: ${error}`);
        res.json({'Suuccess':0,'Balance':balData});
    }

})










// Start the server
const server = app.listen(port, (error) => {
    if (error) {return console.log(`Error: ${error}`);}

    console.log(`Server listening on port ${server.address().port}`);
});