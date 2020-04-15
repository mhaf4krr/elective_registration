const express = require("express")
const app = express()

const fs = require("fs")

let data = fs.readFileSync("./STUDENT_INFO.json","utf-8")
data = JSON.parse(data)
student_info = data[2].data


app.get("/",(req,res)=>{

    let elective = "computational_ethics"    

 
    let data = ""
    let i = 1
    student_info.forEach((student)=>{
        if(student.ELECTIVE_1 == elective || student.ELECTIVE_2 == elective){
            data = data + `
                <tr>
                    <td> ${i++} </td>
                    <td> ${student.REG_NUM.toUpperCase()} </td>
                    <td> ${student.NAME.toUpperCase()} </td>
                    <td> ${student.ROLL_NUM.toUpperCase()} </td>
                </tr>
            `
        }
    })


    let html = `
    <html>
    <head>

    <style>

        body {
            text-align:center;
        }

        table {
            border: 1px solid black;
            margin:auto auto;
        
        }

        td,th {
            padding:1rem 1rem;
            text-align:center;
        }
    </style>
    </head>
    <body>
    <h2> Student List for ${elective} </h2>
    <table>
    <thead>
    <th> SNO </th>
    <th> REG </th>
    <th> NAME </th>
    <th> ROLL NO. </th>
    </thead>

    <tbody>
    ${data}
    </tbody>

    
    </table>
    </body>
    </html>
    `

    res.send(html)

})

app.listen(3001)