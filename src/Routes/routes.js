const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Budget = require('../db/schema')

const auth = async(req,res,next) => {
    try {
        const user = await Budget.findOne({ username : req.params.name })
        if(!user) {
            return res.status(404).json({
                error : 'Not Found'
            })
        }
        const decoded = jwt.verify(user.jwt,process.env.SECRET)
        if(decoded.username === req.params.name) {
            return next()
        }
        res.status(400).json({
            error : 'Not Authenticated'
        })
    } catch(error) {
        res.status(400).json({
            error : error
        })
    }
}

router.post('/addUser',async(req,res) => {
    const user = new Budget({
        _id : new mongoose.Types.ObjectId,
        username : req.body.username.trim(),
        password : await bcrypt.hash(req.body.password.trim(),8),
        jwt : jwt.sign({ username: req.body.username }, process.env.SECRET)
    })
    try {
        const newUSer = await user.save()
        res.status(201).json({
            msg : 'Created',
        })
    } catch (error) {
        res.status(400).json({
            error : error
        })
    }
})

router.get('/login',async(req,res) => {
    try {
        const user = await Budget.findOne({ username : req.body.username })
        if(user) {
            isAuth = await bcrypt.compare(req.body.password,user.password)
            if(isAuth) {
                const newToken = jwt.sign({ username : user.username },process.env.SECRET)
                await Budget.updateOne({ username : user.username },{ jwt : newToken })
                return res.status(200).json({
                    msg : 'Authenticated'
                })
            } else {
                return res.status(400).json({
                    error : 'Not Authenticated'
                })
            }
        }
        res.status(404).json({
            error : 'not found'
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
            username : data.username,
               totalCredit : data.totalCredit,
               totalDebit : data.totalDebit,
               credit : data.credit,
               debit : data.debit
            })
        }
        res.status(404).json({
            error : 'not found'
        })
    } catch (error) {
        res.status(400).json({
            error : error
        })
    }
})

router.patch('/addCredit/:name',auth,async(req,res) => {
    try {
        const user = await Budget.findOne({username : req.params.name})
        if(!user) {
            return res.status(404).json({
                error : 'not found'
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

router.patch('/addDebit/:name',auth,async(req,res) => {
    try {
        const user = await Budget.findOne({username : req.params.name})
        if(!user) {
            return res.status(404).json({
                error : 'not found'
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

router.delete('/removeUser/:name',auth,async(req,res) => {
    try {
        await Budget.deleteOne({ username : req.params.name })
    } catch(error) {
        res.status(404).json({
            error : 'Not Found'
        })
    }
})

module.exports = router;