const express = require('express')
const bodyParser = require('body-parser')//获取传递的body
const mysql = require('mysql')
const app = express()
const cors = require('cors')
app.use(cors())//跨域问题
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

const option = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '15521180143luo',
    database: 'test',
    connectTimeout: 5000,
    multipleStatements: false//是否允许一个query中包含多个查询语句
}
// let conn;
// reconn();
//多迸发使用池子
let pool;
repool()
app.listen(8091,()=>{
    console.log('服务启动了！')
})
// let login = true
// app.all("*",(req,res,next)=>{//*路径放最上，不然其他接口不执行next()，则*路径捕捉不到请求
//     //TODO 校验登陆
//     if(!login) {
//         res.json({code:1,msg:"未登陆"})
//     }
//     next()
// })
app.post('/',(req,res)=>{
    res.send('<div style="color: red">helloword</div>')
})
app.post('/test/:data',(req,res)=>{
    console.log(req.body)
    return res.json({query:req.query,data:req.params,json:req.body})
})
app.get('/user',(req,res)=>{
    pool.query('SELECT * FROM testnode',(err,result)=>{res.json({data:result,msg:err})})
    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM testnode',(err,result)=>{
            res.json({data: result,msg:err})
        })
        conn.release()
    })
    // conn.query('SELECT * FROM testnode',(er,result) =>res.json(new Result({data:result,msg:er})))
})
function Result({code=0,msg='',data={}}) {
    this.code = code,
    this.msg = msg
    this.data = data
}
function reconn() {
    conn = mysql.createConnection(option)
    conn.on('error',err => err.code=='PROTOCAL_CONNECTION_LOST' && setTimeout(reconn,2000))
}
function repool() {
    pool = mysql.createPool({
        ...option,
        waitForConnections: true,//当没有连接池可以链接时是否等待：true：等待，false：抛出错误
        connectionLimit: 100,//连接池限制
        queueLimit: 0
    })
    pool.on('error',err=>err==='PROTOCAL_CONNECTION_LOST' && setTimeout(repool,2000))
    app.all('*',( req,res ,next)=> pool.getConnection((err,conn) =>err && setTimeout(repool,2000)||next()))
}