//导入数据库操作模块
const db = require('../db/data')
//导入bcryptjs这个包
const bcrypt = require('bcryptjs')
//导入生成Token的包
const jwt = require('jsonwebtoken')
//导入全局的配置文件
const config = require('../config')
const session = require('express-session')



//注册的处理函数
exports.regUser = (req, res) => {
    const userinfo = req.body;
    // console.log(userinfo);
    //定义sql语句，查询用户名是否被占用
    const sqlStr = 'select * from users where username=?'
    db.query(sqlStr, userinfo.username, (err, results) => {
        if(err) {


            return res.cc(err)
        }
        // 判断用户名是否被占用
        if(results.length > 0) {
            return res.cc('用户名被占用，请更换其他用户名！')
        }
        // 调用bcrypt.hashSync()对密码进行加密
        userinfo.password  =bcrypt.hashSync(userinfo.password, 10)
        //用户名没有问题，接下来定义sql语句插入新用户信息
        const sql = 'insert into users set ?'
        db.query(sql, {username: userinfo.username, password: userinfo.password}, (err, results) => {
            if(err) {
                return res.cc(err)
            }
            if(results.affectedRows !== 1) {
                return res.cc('注册用户失败，请稍后再试！')
            }
            //注册成功
            res.cc('注册成功', 0)
        })
    })

}

//登录的处理函数
exports.login = (req, res) => {
    const userinfo = req.body
    const sqlStr = 'select * from users where username=?'
    db.query(sqlStr, userinfo.username, (err, results) => {
        if(err) {
            return res.cc(err)
        }
        if(results.length !== 1) {
            return res.cc('登录失败！')
        }

        //用户名存在，接下来判断密码是否正确
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
        //返回值为布尔值
        if(!compareResult) {
            
            return res.send({
                status: 204,
                message: '登录失败',
            })
        }
        //在服务器端生成Token字符串
        const user = {...results[0], password:''}
        //对用户信息进行加密，生成Token字符串
        const tokenStr = jwt.sign(user, config.jwtSecretKey, {expiresIn:config.expiresIn})
        // 用户状态登录状态为true
        req.session.user = req.body // 用户的信息
        req.session.islogin = true // 用户的登录状态
        // console.log(req.session)
        res.send({
            status: 0,
            session,
            message: '登录成功',
            token: 'Bearer' + tokenStr,
        })
        return
    })
}
// function getToken (token) {
//     return new Promise((resolve, reject) => {
//       if(!token) {
//         reject({error: 'token是空的'})
//       }else {
//         const info = jwt.verify(JSON.parse(token), jwtSecretKey)
//         resolve(info) //解析返回的值
//       }
//     })
//   }
//登录拦截token处理函数
// exports.getinfo = (req, res) => {
//     const token = req.headers['authorization']
//     console.log(token)
//     // console.log(getToken(token))
//     const info = jwt.verify(JSON.parse(token), jwtSecretKey)
//     console.log(info)
//     // getToken(token).then((data) => {
//     //     // 解析正确
//     //     res.data = data;
//     //     // console.log(res.data)
//     //     const { userId } = data
//     //     // 查询数据库是否正确
//     //     //这下面有问题噢！！！
//     //     user.find({ _id: userId }).then((data) => {
//     //       if (!data) {
//     //         res.send({err: 401, msg: 'token信息错误，不存在，过期'})
//     //       } else {
//     //         res.send({status: 0, message: '验证成功，进入首页'})
//     //       }
//     //     })
//     //   }).catch((error) => {
//     //   //  解析是空的
//     //     res.send({err: 401, msg: 'token信息错误，不存在，过期'})
//     //   })
// }
