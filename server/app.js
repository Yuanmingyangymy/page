const express = require('express')
const app = express()
// const joi = require('@hapi/joi')
const joi = require('joi')


// 导入并配置cors中间件
const cors = require('cors')
app.use(cors())
// app.all("*", function (req, res, next) {
//     //设置允许跨域的域名，*代表允许任意域名跨域
//     res.header("Access-Control-Allow-Origin", "*");
//     //允许的header类型
//     res.header("Access-Control-Allow-Headers", "content-type");
//     //跨域允许的请求方式 
//     res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
//     next()
// })


//配置session中间件，获取用户信息
const session = require('express-session')
app.use(session({
    secret: 'sheep',
    //Cookie
    name: 'session_cookie',
    resave: false,
    saveUninitialized: true,
    rolling: true //每次请求时强行设置cookie
}))
// 配置解析表单数据的中间件，注意：这个中间件，只能解析 application/x-www-form-urlencoded 格式的表单数据
app.use(express.urlencoded({ extended: false }))

//在路由之前封装res.cc函数
app.use((req, res, next) => {
    // status 默认值为1,表示失败的情况
    // err的值，可能是一个错误对象，也可能是一个错误的描述字符串
    res.cc = function(err, status = 1) {
        res.send({
            status,
            message: err instanceof Error ? err.message : err,
        })
    }
    next()
})
//在路由之前配置解析Token的中间件
const expressJWT = require('express-jwt')
const config = require('./config')
app.use(expressJWT({secret: config.jwtSecretKey}).unless({path: [/^\/api/]}))




// 导入并使用用户路由模块
const userRouter = require('./router/user')
app.use('/api', userRouter)


//定义错误级别中间件
app.use((err, req, res, next) => {
    //验证失败导致的错误
    if(err instanceof joi.ValidationError) return res.cc(err)
    //身份认证失败后的错误
    if(err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    //未知错误
    res.cc(err)
})



app.listen('3007', () => {
    console.log('server running at http://127.0.0.1:3007')
})