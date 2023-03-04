const express = require('express')

const router = express.Router()
const session = require('express-session')


// 导入用户路由处理函数对应的模块
const user_handler = require('../router_handler/user')

//1.导入验证数据的中间件
const expressJoi = require('@escook/express-joi')
//2.导入需要的验证规则对象
const {reg_login_schema} = require('../schema/user')

//注册
router.post('/register', expressJoi(reg_login_schema), user_handler.regUser)
//登录
router.post('/login', expressJoi(reg_login_schema), user_handler.login)
//登录拦截
// router.get('/getinfo', user_handler.getinfo)
router.get('/getinfo', (req, res) => {
    // console.log(req.session)
    if (!req.session) {
        return res.send({
            status: 1,
            message: 'Cookie已过期',
        })
    } else {
        return res.send({
            status: 0,
            message: 'Hello',
        })
    }
})
//退出登录
router.post('/logout', (req, res) => {
    //清空 Session 信息
    req.session.destroy()
    res.send({
        status: 0,
        message: '退出登录成功',
    })
})




module.exports = router