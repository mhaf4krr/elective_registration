/* Database Connection */
var mysql      = require('mysql');
var connection = mysql.createPool({
  host     : 'hyderdevelops.ml',

  port:3306,
});

const express = require("express")
const app = express()
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer');

let total_seats = 60

app.use(express.static("public"))

app.engine('html', require('ejs').renderFile);
app.set("view engine","html")

app.get("/",async (req,res)=>{
    

    calculateRemainigSeats().then((data)=>{
      res.render("index",{
        dl:total_seats - data.dl
        ,ce: total_seats - data.ce 
        ,cc: total_seats - data.cc,
        cv: total_seats - data.cv})
    }).catch((err)=>{
      res.send("We have encountered an error " + err)
    })
})




const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// for parsing application/xwww-



let otp_collection = []


app.post("/generate-otp",(req,res)=>{
  let student = req.body;
  sendOTPMail(student)
  console.log(otp_collection)
  res.send("SUCCESS")

})

app.post("/verify-otp",(req,res)=>{

  let student = req.body
  let verifed = verifyOtp(student.email,student.otp)

    if(verifed){
      res.send("VERIFIED")
    }

    else 
    res.send("FAILED")

  
})


app.post("/register",(req,res)=>{

    let student = req.body

    console.log(student)

   
    checkForAlreadyExisitngInfo(student).then((result)=>{
        console.log("Checking for already exist , found "+result)
        // does not exist in DB so add him
        if(result == "false") {
          
            console.log("adding student to DB")
           
            addStudentToDatabase(student)
            res.send("<h2>"+ student.name + " your preference is saved." + "</h2>")
        }

        else {
            let student_details = JSON.parse(JSON.stringify(result))[0]
            let detail = ""

            Object.keys(student_details).forEach((key,index)=>{
                detail = detail + ` <li> ${key} : ${student_details[key]} </li>`
            })

         
            res.send("We have your following Information already " + "</br>" + "<ul>" + detail + "</ul>")
        }
    })
    
    .catch((err)=>{
      console.log(err)
    })
    
})





function addStudentToDatabase(student){

    console.log(student)
    query = `INSERT INTO STUDENT_INFO VALUES("${student.name}","${student.registration}","${student.roll_number}","${student.email}","${student.phone}","${student.elective1}","${student.elective2}")`
    queryDatabase(query)

}


/* Nodemailer Config */

var transporter = nodemailer.createTransport({
    host: 'mail.hyderdevelops.ml',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'hyder@hyderdevelops.ml', // your domain email address
      pass: 'Root@linux20' // your password
    }
  });

function sendEmail(email,subject,html){


    let mailOptions = {
        from: 'DOCSE <hyder@hyderdevelops>', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line

        html: html, // html body

    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
   
       
   })
}

/* Utility Functions */



function checkForAlreadyExisitngInfo(student){
    return new Promise((resolve,reject)=>{
        queryDatabase(`SELECT * FROM STUDENT_INFO WHERE REG_NUM="${student.registration}" OR EMAIL="${student.email}" OR PHONE="${student.phone}"`)
        .then((result)=>{

            console.log(result)

            if(result == null || result == undefined || result == [] || result.length == 0){
               resolve("false")
            }

            else resolve(result)
        })
    })
}


function queryDatabase(query){
    return new Promise((resolve,reject)=>{
      connection.query(query,function(err,results,fields){
        if(err) {
          console.log(new Error(err))
          reject("Error occured while Retreiving")
        }
  
        else {
          resolve(results)
        }
  
       
      })
    })
  }
  

  function sendOTPMail(student){
    let otp=otpGenerator.generate(
        4, { digits:true,upperCase: false,alphabets:false, specialChars: false });
        addOTPtoCollection(student.email,otp)
        let subject = "OTP | Complete your Registration"
        let html = `Dear ${student.name}, your OTP for 8th Semester registration is ${otp}. Please ensure you fill all details correctly. #STAYHOMESTAYSAFE`
    sendEmail(student.email,subject,html)
  }


  function addOTPtoCollection(email,otp){
    let i;
    let found_flag = false
    for (i=0;i<otp_collection.length;i++){
      if (otp_collection[i].email == email){
          found_flag = true
          otp_collection[i].otp = otp
      }
    }

    if(found_flag == false){

      otp_collection.push({
        email:email,
        otp:otp
      })
    }
  }


  function verifyOtp(email,otp){
    let verified = false;
    for(let i=0 ; i<otp_collection.length ;i++){
      if (otp_collection[i].email == email){
        if(otp_collection[i].otp == otp){
          verified = true
        }

        break
    }

    }

    return verified
  }


  function calculateRemainigSeats(){
    return new Promise((resolve,reject)=>{

      queryDatabase("SELECT * FROM STUDENT_INFO").then((result)=>{
        if(result == null || result == undefined || result.length == 0){
         resolve({dl:0,ce:0,cv:0,cc:0})
        }
  
        else {
  
          let dl =0,ce = 0,cv=0,cc=0
          let students = JSON.parse(JSON.stringify(result))
  
          students.forEach((student) => {
            if(student.ELECTIVE_1 == "deep_learning") {
              dl++
            }
  
            if(student.ELECTIVE_1 == "computational_ethics") {
              ce++
            }
  
            if(student.ELECTIVE_2 == "cloud_computing") {
              cc++
            }
  
            if(student.ELECTIVE_2 == "computer_vision") {
              cv++
            }
            
          })


          resolve({dl:dl,ce:ce,cv:cv,cc:cc})
        }
      })

    })
  }




  function checkStudentPreference(details){
   return new Promise((resolve,reject)=>{
    let query = `SELECT * FROM STUDENT_INFO WHERE EMAIL="${details}" OR PHONE="${details}"`

    queryDatabase(query).then((data)=>{
      if(data.length == 0){
        reject("NO SUCH STUDENT")
      }

      else {
        resolve(JSON.parse(JSON.stringify(data))[0])
      }
    })
   })
}


app.post("/check-pref",(req,res)=>{
  let data = req.query.detail
  
  console.log(req.query)
 
  checkStudentPreference(data).then((detail)=>{
    console.log(detail)
    let html = `
     <ul>
       <li>Name : ${detail.NAME.toUpperCase()}</li>
       <li> Reg : ${detail.REG_NUM.toUpperCase()} </li>
       <li> <b>ELEC 1 </b> : <b>${detail.ELECTIVE_1.toUpperCase()}</b> </li>
       <li> <b>ELEC 2 </b> : <b>${detail.ELECTIVE_2.toUpperCase()}</b> </li>
     </ul>
    `
    res.send(JSON.stringify(html))
  })
  .catch((err)=>{
    console.log(err)
    res.send(JSON.stringify(err))
  })
})

function sendMailToAll(){
  return new Promise((resolve,reject)=>{
    queryDatabase("SELECT * FROM STUDENT_INFO").then((data)=>{
      data = JSON.parse(JSON.stringify(data))

      console.log(data)
      data.forEach((student)=>{
        let subject = "Registration Details"
        let html = `Dear ${student.NAME}, it is to inform you that you have opted for <b> ${student.ELECTIVE_1} </b>  and <b> ${student.ELECTIVE_2} </b> as elective subjects for your 8Th semester. Please save this mail for your reference.`
        sendEmail(student.EMAIL,subject,html)
      })
    })

  })
}



//sendMailToAll()

app.listen()
