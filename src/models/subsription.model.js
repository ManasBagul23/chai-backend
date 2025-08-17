import mongoose, { Schema } from "mongoose"

const subcriptionSchema = new Schema({
    subcriber: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamp : true })



export const Subscription = mongoose.model('Subscription', subcriptionSchema)