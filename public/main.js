let email = document.querySelector("#email")
let name = document.querySelector("#name")
let emailBtn = document.querySelector(".email_send_btn")
let otp = document.querySelector("#otp")
let otpBtn = document.querySelector(".verify_otp_btn")
let otpSection = document.querySelector(".otp-section")
let reg = document.querySelector("#registration")
let otp_verified = false


let url = window.location.origin

let regular_exp = /^IUST011600\d{4}$/;

async function requestOTP(){
    let data = {
        name:name.value,
        email:email.value
    }

    let options = {
        method:"POST",
        headers : {
            'Content-Type': 'application/json;charset=utf-8',
        },

        body: JSON.stringify(data)
    }

    let response = await fetch(url+"/generate-otp",options)
    emailBtn.textContent = "Sending ... "
    let result = await response.text()
    if(result == "SUCCESS"){
        emailBtn.textContent = "SENT"
    }
    if(result == "ERROR"){
        emailBtn.textContent = "ERROR"
    }
}

emailBtn.addEventListener("click",(e)=>{
    e.preventDefault()

    if(name.value == "" || email.value == ""){
        alert("Name & Email can't be empty")
        return
    }
    
    
    else {
        email.readonly = true
        name.readonly = true
        emailBtn.disabled = true;
         otpSection.style.display = "block";
       requestOTP()
    }
})


otpBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    if(otp.value == ""){
        alert("Please use the OTP")
        return
    }

    else {
        verifyOTP()
    }
})


async function verifyOTP(){
    let data = {
        email:email.value,
        otp:otp.value
    }

    let options = {
        method:"POST",
        headers : {
            'Content-Type': 'application/json;charset=utf-8',
        },

        body: JSON.stringify(data)
    }

    let response = await fetch(url+"/verify-otp",options)
    otpBtn.textContent = "Checking ... "
      
    let result = await response.text()
    if(result == "VERIFIED"){

        otpBtn.disabled = true
        otpBtn.textContent = "VERIFIED"
        otp_verified = true
        
    }
    if(result == "FAILED"){
        otpBtn.textContent = "FAILED"
    }

}


function finalVerify(){

    let user = localStorage.getItem("user")

    if(!otp_verified){
        alert("OTP is not verified")
        return false
    }

    if(!(regular_exp.test(reg.value.toUpperCase()))){
        alert("Error with your Registration Number")
        return false
    }

    if(user!=null){
        alert("This device has been used to register for "+user)
        return false
    }

    else {
        localStorage.setItem("user",reg.value)
    }

    return true
}


function checkPreference(){
    let check = document.querySelector("#check")
    let prefArea = document.querySelector(".pref-area")
    if(check.value == ""){
        alert("Value cannot be empty!")
        return
    }

    fetch(url+"/check-pref?detail="+check.value,{method:"POST"}).then((response)=> response.text())
    .then((data)=>{
        
        prefArea.innerHTML = JSON.parse(data)
    })
}