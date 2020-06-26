const mongoose = require('mongoose')

const budgetSchema = mongoose.Schema({
    _id : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },
    username : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    totalCredit : {
        type : Number,
        default : 0
    },
    totalDebit : {
        type : Number,
        default : 0
    },
    credit : [{
        title : {
            type : String,
        },
        price : {
            type : Number,
            default : 0
        }
    }],
    debit : [{
        title : {
            type : String,
        },
        price : {
            type : Number,
            default : 0
        }
    }]
})


module.exports = mongoose.model('Budget',budgetSchema)