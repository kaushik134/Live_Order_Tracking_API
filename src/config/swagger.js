const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Live Order Tracking API",
            version: "1.0.0",
            description: "Backend service for creating, managing, and tracking orders in real time using Express, MongoDB, Redis, and Socket.IO.",
        },
        servers: [
            {
                url: process.env.SERVER_URL || "http://localhost:8000",
                description: "Main API Server",
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },

    apis: ["./src/routes/*.js", "./src/controllers/*.js", "./src/docs/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
    serveSwagger: swaggerUi.serve,
    setupSwagger: swaggerUi.setup(swaggerSpec),
};
