const { generateToken } = require("../../common/common");
const userModel = require("../../model/userModel");
const { auth } = require("../../utils/resMessage");
const { validateWithJoi } = require("../../utils/validate");
const { registerSchema, loginSchema } = require("../../utils/validations/authValidation");

exports.register = async (req, res) => {
    try {
        const { isValid, value, errors } = validateWithJoi(req.body, registerSchema);

        if (!isValid) {
            return res.badRequest({
                message: errors.length > 1 ? "Multiple validation errors occurred." : "Validation error occurred.",
                data: errors,
            });
        }

        const { userName, fullName, email, password } = value;

        const existUser = await userModel.findOne({
            $or: [{ userName }, { email }],
        });

        if (existUser) {
            if (existUser.userName === userName) {
                return res.conflict({ message: auth.usernameTaken });
            }

            if (existUser.email === email) {
                return res.conflict({ message: auth.emailTaken });
            }
        }

        const newUser = await new userModel({
            userName,
            fullName,
            email,
            password,
        })

        const { accessToken, refreshToken } = await generateToken({
            userId: newUser?._id?.toString(),
            role: newUser.role,
        });

        await newUser.save()

        return res.createResource({
            message: auth.registerSuccess,
            data: { accessToken, refreshToken },
        });

    } catch (error) {
        console.error("Registration Error:", error);
        return res.internalServerError({
            message: "An error occurred during registration. Please try again later.",
        });
    }
}

exports.login = async (req, res) => {
    try {
        const { isValid, value, errors } = validateWithJoi(req.body, loginSchema);
        if (!isValid) {
            return res.badRequest({
                message: errors.length > 1 ? "Multiple validation errors occurred." : "Validation error occurred.",
                data: errors,
            });
        }

        const { email, password } = value;
        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.notFound({ message: auth.notFound });
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.unauthorized({ message: auth.invalidCredentials });
        }

        const { accessToken, refreshToken } = await generateToken({
            userId: user._id,
            role: user.role,
        });

        return res.success({
            message: auth.loginSuccess,
            data: { accessToken, refreshToken },
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.internalServerError({
            message: "An error occurred during login. Please try again later.",
        });
    }
}