const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please  tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'please provide your email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please porvide a valid email!']
    },

    photo: String,
    password: {
        type: String,
        required: [true, 'please provide a password!'],
        minLength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'please provide a password!'],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: 'passwords are not the same!'
        }
    },
    passwordChangedAt: Date,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    active: {
        type: Boolean,
        defualt: true,
        select: false
    },
    passwordResetToken: String,
    passwordResetExpires: Date
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
    // isNew => mean new document created
    this.passwordChangedAt = new Date() - 5000;

    next();
});

userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function(candinatePassword, userPassword) {
    return await bcrypt.compare(candinatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimeStamp;
    }
    return false; // mean not changed
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds

    return resetToken;

}
const User = mongoose.model('User', userSchema);



module.exports = User;