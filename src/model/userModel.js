const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { USER_ROLES } = require("../common/constant.js");

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.USER,
    },
}, { timestamps: true, });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    if (!update.password) return next();

    try {
        update.password = await bcrypt.hash(update.password, 10);
        this.setUpdate(update);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;