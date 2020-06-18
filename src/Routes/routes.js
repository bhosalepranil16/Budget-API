const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Budget = require('../db/schema')

const auth = async(req,res,next) => {
    try {
        const user = await Budget.findOne({ username : req.params.name })
        console.log(typeof user.jwt)
        const decoded = jwt.verify(user.jwt,process.env.SECRET)
        console.log(decoded)
        next()
    } catch(error) {
        console.log(error)
        next()
    }
}

const generateToken = async(username) => {
    const token = await jwt.sign({ username : username },process.env.SECRET)
    return token
}

router.post('/addUser',async(req,res) => {
    const user = new Budget({
        _id : new mongoose.Types.ObjectId,
        username : req.body.username,
        password : await bcrypt.hash(req.body.password,8),
        jwt : await generateToken(req.body.username)
    })
    try {
        const newUSer = await user.save()
        res.status(201).json({
            message : 'Created',
            newUSer
        })
    } catch (error) {
        res.status(400).json({
            message : error
        })
    }
})

router.get('/login',async(req,res) => {
    try {
        const user = await Budget.findOne({ username : req.body.username })
        if(user) {
            isAuth = await bcrypt.compare(req.body.password,user.password)
            if(isAuth) {
                return res.status(200).json({
                    msg : 'Authenticated'
                })
            } else {
                return res.status(400).json({
                    msg : 'Not Authenticated'
                })
            }
        }
        res.status(404).json({
            msg : 'not found'
        })
    } catch(error) {
        res.status(500).json({
            error : error
        })
    }
    
})

router.get('/getData/:name',auth,async(req,res)=>{
    try {
        const data = await Budget.findOne({username : req.params.name})
        if(data) {
            return res.status(200).json({
                msg : 'found',
                data : data
            })
        }
        res.status(404).json({
            msg : 'not found'
        })
    } catch (error) {
        res.status(400).json({
            error : error
        })
    }
})

router.patch('/addCredit/:name',async(req,res) => {
    try {
        const user = await Budget.findOne({username : req.params.name})
        if(!user) {
            return res.status(404).json({
                msg : 'not found'
            })
        }        
        const newCredit = {
            price : parseInt(req.body.price),
            title : req.body.title
        }
        const oldTotalCredit = parseInt(user.totalCredit) + newCredit.price;
        await Budget.updateOne({ username:req.params.name },{ totalCredit: oldTotalCredit, $push :{ credit : [newCredit] } },{ new: true })
        res.status(200).json({
            msg : 'updated'
        })
    } catch (error) {
        res.status(500).json({
            error : error
        })
    }
})

router.patch('/addDebit/:name',async(req,res) => {
    try {
        const user = await Budget.findOne({username : req.params.name})
        if(!user) {
            return res.status(404).json({
                msg : 'not found'
            })
        }        
        const newDebit = {
            price : parseInt(req.body.price),
            title : req.body.title
        }
        const oldTotalDebit = parseInt(user.totalDebit) + newDebit.price;
        await Budget.updateOne({ username:req.params.name },{ totalDebit: oldTotalDebit, $push :{ debit : [newDebit] } },{ new: true })
        res.status(200).json({
            msg : 'added'
        })
    } catch (error) {
        res.status(500).json({
            error : error
        })
    }
})

module.exports = router;