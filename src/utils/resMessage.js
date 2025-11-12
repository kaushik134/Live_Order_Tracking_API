const auth = {
    usernameTaken: "Username is already taken.",
    emailTaken: "Email is already registered.",
    registerSuccess: "Registration successful. Please verify your email.",
    notFound: "User not found.",
    invalidCredentials: "Invalid email or password.",
    loginSuccess: "Login successful.",
    invalidToken: "Invalid or expired token.",
}

const orderMsg = {
    createSuccess: "Order created successfully.",
    notFound: "Order not found.",
    unauthorized: "You are not authorized to access this order.",
    fetchSuccess: "Orders fetched successfully.",
    fetchCacheSuccess: "Orders fetched successfully (from cache).",
    statusUpdateSuccess: "Order status updated successfully.",
}

module.exports = {
    auth,
    orderMsg,
}